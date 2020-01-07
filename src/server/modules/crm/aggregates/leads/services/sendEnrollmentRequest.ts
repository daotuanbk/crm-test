import { ensurePermission, messageQueue, MessageMetadataTypes, getCurrentTimestamp, RELATION_SELF } from '@app/core';
import { PERMISSIONS } from '@common/permissions';
import { leadRepository, ClassEnrollmentStatuses, QueueMessageOperation, Lead, OrderProductItem, ProductEnrollmentItem } from '@app/crm';
import { BadRequest } from '@feathersjs/errors';
import _ from 'lodash';
import { config } from '@app/config';
import { User } from '@app/auth';

export const sendEnrollmentRequestMessage = async (authUser: User, existedLead: Lead, productItem: OrderProductItem, productEnrollmentItem: ProductEnrollmentItem) => {
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
    cancelled: false,
    owner: {
      _id: (authUser as any)._id,
      email: authUser.email,
      fullName: authUser.fullName,
    },
    requestTime: getCurrentTimestamp(),
    lmsCourseId: _.get(productEnrollmentItem, 'course', ''),
    lmsClassId: _.get(productEnrollmentItem, 'class', ''),
  };

  const metadata = messageQueue.createMetadata(MessageMetadataTypes.COMMAND);
  const payload = messageQueue.createPayload(QueueMessageOperation.ENROLLMENT_REQUEST, enrollmentData);
  const message = messageQueue.createMessage(enrollmentData.productEnrollmentItemId, metadata, payload);

  const messageRequest = messageQueue.createMessageRequest(config.queue.enrollmentRequestTopic, message as any);
  const debugMessageRequest = messageQueue.createMessageRequest(`${config.queue.enrollmentRequestTopic}_${enrollmentData.productEnrollmentItemId}`, message as any);
  await messageQueue.sendMessages([messageRequest, debugMessageRequest]);
};

export const sendEnrollmentRequest = async (req: any, res: any) => {
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
    if ([ClassEnrollmentStatuses.Approved, ClassEnrollmentStatuses.Waiting].indexOf(productEnrollmentItem.status!) > -1) {
      throw new BadRequest('Enrollment request has been sent');
    }

    // 3. update data
    productEnrollmentItem.status = ClassEnrollmentStatuses.Waiting;
    productItem.enrollments = _.values(productEnrollmentsByIds);
    existedLead.order.productItems = _.values(productItemsById);

    // 4. send message to kafka queue
    await sendEnrollmentRequestMessage(req.authUser, existedLead, productItem, productEnrollmentItem);

    const newLeadInfo = await leadRepository.update({
      id,
      order: existedLead.order,
    });

    res.status(200).json(newLeadInfo);
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
