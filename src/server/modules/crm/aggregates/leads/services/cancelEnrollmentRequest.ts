import { ensurePermission, getCurrentTimestamp, messageQueue, MessageMetadataTypes, RELATION_SELF } from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import { leadRepository, ClassEnrollmentStatuses, QueueMessageOperation } from '@app/crm';
import { BadRequest } from '@feathersjs/errors';
import _ from 'lodash';
import { EnrollmentMessagePayload } from '../interfaces/EnrollmentMessagePayload';
import { config } from '@app/config';

const cancelEnrollmentRequestMessage = async (enrollmentData: EnrollmentMessagePayload) => {
  const metadata = messageQueue.createMetadata(MessageMetadataTypes.COMMAND);
  const payload = messageQueue.createPayload(QueueMessageOperation.ENROLLMENT_CANCEL_REQUEST, enrollmentData);
  const message = messageQueue.createMessage(enrollmentData.productEnrollmentItemId, metadata, payload);

  const messageRequest = messageQueue.createMessageRequest(config.queue.enrollmentRequestTopic, message as any);
  const debugMessageRequest = messageQueue.createMessageRequest(`${config.queue.enrollmentRequestTopic}_${enrollmentData.productEnrollmentItemId}`, message as any);
  await messageQueue.sendMessages([messageRequest, debugMessageRequest]);
};

export const cancelEnrollmentRequest = async (req: any, res: any) => {
  try {
    const { id, productItemId, productEnrollmentItemId } = req.params;

    // 1. authorize
    ensurePermission(req.authUser, PERMISSIONS.LEADS.EDIT);

    // 2. validate
    const existedLead = await leadRepository.findById(id);
    if (!existedLead) {
      throw new BadRequest('Lead not found');
    }

    const productItemsById = _.mapKeys(existedLead.order.productItems, '_id');
    const productItem = productItemsById[productItemId];
    if (!productItem) {
      throw new BadRequest('Product item not found');
    }

    const productEnrollmentsByIds = _.mapKeys(productItem.enrollments, '_id');
    const productEnrollmentItem = productEnrollmentsByIds[productEnrollmentItemId];
    if (!productEnrollmentItem) {
      throw new BadRequest('Product enrollment item not found');
    }
    if (productEnrollmentItem.status !== ClassEnrollmentStatuses.Waiting) {
      throw new BadRequest('Enrollment request not found');
    }

    // 3. update data
    productEnrollmentItem.status = ClassEnrollmentStatuses.NotEnrolled;
    productEnrollmentItem.cancelled = true;
    productItem.enrollments = _.values(productEnrollmentsByIds);
    existedLead.order.productItems = _.values(productItemsById);

    // 4. send message to kafka queue
    const familyMembers = _.get(existedLead, 'customer.family', []);
    const familyMembersById = _.mapKeys(familyMembers, '_id');
    let relation = RELATION_SELF;
    if (familyMembersById[String(_.get(productItem, 'candidate._id', ''))]) {
      relation = familyMembersById[String(_.get(productItem, 'candidate._id', ''))].relation;
    }
    const enrollmentData: any = {
      leadId: existedLead._id,
      productItemId: (productItem as any)._id,
      productEnrollmentItemId: productEnrollmentItem._id,
      customer: existedLead.customer,
      candidate: productItem.candidate,
      relation,
      cancelled: true,
      requestTime: getCurrentTimestamp(),
      lmsCourseId: _.get(productEnrollmentItem, 'course._id', ''),
      lmsClassId: _.get(productEnrollmentItem, 'class._id', ''),
    };
    await cancelEnrollmentRequestMessage(enrollmentData);

    const newLeadInfo = await leadRepository.update({
      id,
      order: existedLead.order,
    });

    res.status(200).json(newLeadInfo);
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
