import {
  ProspectingListInputError,
  EntityNotFoundError,
  validateQuery,
  ensurePermission,
  validatePayload,
  validateOperation,
  logger, PROSPECTING_LIST_SOURCE_WEB, REGISTRATION_BACKUP,
  forwardRegistrationJob,
} from '@app/core';
import {
  ProspectingListService,
  contactRepository,
  prospectingListRepository,
  productComboRepository,
  productCourseRepository,
  leadProductOrderRepository,
  leadRepository,
  systemConfigRepository,
  emailTemplateConfigRepository,
  createLeadDefaultTask,
  classRepository,
  centreRepository,
  execSyncWithLms,
  checkComboCondition,
  checkComboConditionForCourse,
} from '@app/crm';
import { PERMISSIONS } from '@common/permissions';
import { config } from '@app/config';
import * as yup from 'yup';
import axios from 'axios';
import uuid from 'uuid';
import moment from 'moment';

// @ts-ignore
const prospectingListService: ProspectingListService = {
  setup: (_app, _path) => {
    _app.get(_path + '/campaigns', async (req: any, res: any) => {
      try {
        const accessToken = (await systemConfigRepository.findFbCampaignAccessToken() as any).value.access_token;
        const result = await axios({
          url: `https://graph.facebook.com/v4.0/me/adaccounts`,
          method: 'get',
          params: {
            fields: 'campaigns{name,created_time,account_id,status}',
            access_token: accessToken,
          },
        });
        res.status(200).json({
          data: result.data,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
    _app.post(_path + '/web-register', async (req: any, res: any) => {
      try {
        await registerOnWeb(req.body);
        res.status(200).json({
          data: true,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
    _app.post(_path + '/create', async (req: any, res: any) => {
      try {
        const item = req.body;
        item.createdAt = moment().valueOf();
        const _id = await prospectingListRepository.create(item);
        res.status(200).json({
          id: _id,
        });
      } catch (error) {
        logger.error(error);
        res.status(error.status || 500).end(error.message || req.t('internalServerError'));
      }
    });
  },
  find: async ({ query, repository, authUser }) => {
    // 1. authorize
    ensurePermission(authUser, PERMISSIONS.PROSPECTING_LIST.VIEW);
    if (authUser && authUser.permissions && authUser.permissions.indexOf(PERMISSIONS.PROSPECTING_LIST.VIEW_ALL) >= 0) {
      // 2. validate
      validateQuery(query);

      // 3. do business logic

      // 4. persist to db
      return await repository.find(query, true);
    } else {
      // 2. validate
      validateQuery(query);

      // 3. do business logic

      // 4. persist to db
      return await repository.find({
        ...query,
        authUser,
      });
    }
  },
  get: async (_id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.PROSPECTING_LIST.VIEW);

    // 2. validate
    if (!_id) {
      throw new ProspectingListInputError(params.translate('missingId'));
    }

    // 3. do business logic

    // 4. persist to db
    return await params.repository.findById(_id);
  },
  create: async (data, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.PROSPECTING_LIST.CREATE);

    // 2. validate
    await validatePayload({
      // Validate object
    }, data);

    // 3. do business logic

    // 4. persist to db
    const _id = await params.repository.create({
      ...data,
      ...params.creationInfo,
    });

    return {
      id: _id,
      _id,
    };
  },
  patch: async (id, data, params) => {
    validateOperation(data.operation, ['updateDetail']);
    await prospectingListService[data.operation](id, data.payload, params);
    return {};
  },
  updateDetail: async (_id, data: any, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.PROSPECTING_LIST.EDIT);

    // 2. validate
    if (!_id) {
      throw new ProspectingListInputError(params.translate('missingId'));
    }
    const existedProspectingList: any = await params.repository.findById(_id);
    if (!existedProspectingList) {
      throw new EntityNotFoundError('ProspectingList');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);
    // 3. do business logic

    // 4. persist to db
    await params.repository.update({
      id: _id,
      ...data,
      ...params.modificationInfo,
    });
    return {};
  },
  remove: async (id, params) => {
    // 1. authorize
    ensurePermission(params.authUser, PERMISSIONS.PROSPECTING_LIST.DELETE);

    // 2. validate
    if (!id) {
      throw new ProspectingListInputError(params.translate('missingId'));
    }
    const existed: any = await params.repository.findById(id);
    if (!existed) {
      throw new EntityNotFoundError('ProspectingList');
    }

    // 3. persist to db
    await params.repository.del(id);
    await removePLRelationInfos(id);
    return {};
  },
};

interface WebBody {
  contact: {
    'contactBasicInfo': {
      'firstName': string,
      'lastName': string,
      'phone': string,
      'email': string,
      'fb': string,
      'address': string,
      'gender': string,
    },
    'contactRelations': [{
      'userType': string,
      'fullName': string,
      'phone': string,
      'email': string,
    }],
    'schoolInfo': {
      'schoolName': string,
    },
    'centre': string,
    'prospectingListId'?: string;
    'isQualified'?: boolean,
  };
  'combo': string;
  'courses': [{ 'courseId': string }, { 'courseId': string }, { 'courseId': string }];
}

const LOGGER_WEB = 'Web-register';
const registerOnWeb = async (data: WebBody) => {
  logger.info(`${LOGGER_WEB} data: ${JSON.stringify(data)}`);
  try {
    await sendRegistrationMailBackup(data);
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.log(error);
  }
  const { contact } = data;
  logger.info(`${LOGGER_WEB} Find web prospecting list`);
  const prospectingList = (await prospectingListRepository.find({
    filter: JSON.stringify([{
      source: PROSPECTING_LIST_SOURCE_WEB,
    }]),
    first: 1,
    sortBy: 'createdAt|asc',
  } as any)).data[0] as any;
  contact.prospectingListId = `${prospectingList._id}`;
  contact.isQualified = true;
  logger.info(`${LOGGER_WEB} Create contact`);
  const id = await contactRepository.create(contact as any);
  const contactRecord = await contactRepository.findById(id);
  const lastContacts: any[] = [];
  let contactToLead = contactRecord;
  if (lastContacts.length === 1) {
    // can not find any same contact
    // create lead from this contact
  }
  else if (lastContacts.length === 2) {
    // find the same contact
    if (!lastContacts[1].leadId) {
      contactToLead = lastContacts[1];
      await contactRepository.update({
        refContactId: `${lastContacts[1]._id}`,
        _id: `${contactRecord._id}`,
      } as any);
    }
  }
  logger.info(`${LOGGER_WEB} Create lead`);
  const leadId = await createLead(contactToLead, data, prospectingList.assigneeId);
  const leadParam = await leadRepository.findById(leadId);
  if (leadParam) {
    await execSyncWithLms([leadParam]);
    logger.info(`${LOGGER_WEB} Sync with LMS`);
  }
  await contactRepository.update({
    _id: `${contactToLead._id}`,
    leadId,
    isQualified: true,
  } as any);
};

const sendRegistrationMailBackup = async (data: WebBody) => {
  logger.info(`${LOGGER_WEB} Send Registration Email backup`);
  const { contact } = data;
  if (!contact) return;
  const { contactBasicInfo } = contact;
  if (!contactBasicInfo) return;
  const { firstName, phone, email, fb, address } = contactBasicInfo;
  const coursesPromise = data.courses && data.courses.length ? data.courses.map((val: any) => {
    return productCourseRepository.findById(val.courseId);
  }) : [];
  logger.info(`${LOGGER_WEB} Find courses`);
  const courses = await Promise.all(coursesPromise);
  const courseNames = courses.map((item: any) => {
    if (!item) return;
    return item.name;
  }).join(', ');
  const templateConfig = await emailTemplateConfigRepository.findByName(REGISTRATION_BACKUP) as any;
  const from = config.emailAccount.reg.account;
  if (templateConfig && templateConfig.data && templateConfig.data.length) {
    const promises = templateConfig.data.map((templateConf: any) => {
      const subject = templateConf.subject.replace(/@first_name/g, firstName).replace(/@course_names/g, courseNames);
      const template = templateConf ? templateConf.template : undefined;
      if (template && template.text) {
        const html = template.text.replace(/@from/g, from)
          .replace(/@date/g, moment().format('MMMM Do YYYY, HH:mm:ss'))
          .replace(/@subject/g, subject)
          .replace(/@first_name/g, firstName)
          .replace(/@course_names/g, courseNames)
          .replace(/@email/g, email)
          .replace(/@fb/g, fb)
          .replace(/@phone/g, phone)
          .replace(/@address/g, address);
        const rec = templateConf.recipient || '';
        let recipient = '';
        if (rec === 'admin') {
          recipient = config.emailAccount.contact.account;
        }
        if (recipient) {
          return forwardRegistrationJob({
            // subject: `[Đăng ký mới] ${firstName} - ${courseNames}`,
            subject,
            html,
            recipient,
          });
        } else {
          return null;
        }
      } else {
        return null;
      }
    });
    await Promise.all(promises);
  }
};

const calculateTuitionAD = (courses: any, combo: any) => {
  if (courses && courses.length) {
    if (combo && combo.discountType === 'FIXED' && checkComboCondition(combo, courses)) {
      const totalAdditionalDiscount = courses.reduce((sum: number, val: any, _index: number) => {
        const tuition = val.tuitionBeforeDiscount || 0;
        const discount = val.discountValue ?
          (val.discountType === 'PERCENT' ?
            (Number(tuition) * Number(val.discountValue) / 100) :
            Number(val.discountValue))
          : 0;
        return sum + discount;
      }, 0);
      return Number(combo.discountValue) - Number(totalAdditionalDiscount) > 0 ? Number(combo.discountValue) - Number(totalAdditionalDiscount) : 0;
    } else {
      const totalBD = courses.reduce((sum: number, val: any) => {
        return sum + Number(val.tuitionBeforeDiscount || 0);
      });
      const tuitionFees = courses.reduce((sum: number, val: any, index: number) => {
        const tuition = val.tuitionBeforeDiscount || 0;
        const discount = val.discountValue ?
          (val.discountType === 'PERCENT' ?
            (Number(tuition) * Number(val.discountValue) / 100) :
            Number(val.discountValue))
          : 0;
        const comboDiscount = checkComboConditionForCourse(combo, courses, index, totalBD) === 'PERCENT' ? (Number(tuition) * Number(combo ? combo.discountValue : 0) / 100) : 0;
        return sum + ((Number(tuition) - Number(discount) - Number(comboDiscount)) > 0 ? Number(tuition) - Number(discount) - Number(comboDiscount) : 0);
      }, 0);
      if (combo && combo.discountType === 'AMOUNT' && checkComboCondition(combo, courses)) {
        return (Number(tuitionFees) - Number(combo.discountValue)) > 0 ? (Number(tuitionFees) - Number(combo.discountValue)) : 0;
      } else {
        return tuitionFees;
      }
    }
  } else {
    if (combo && combo.discountType === 'FIXED' && combo.field === 'courseCount' && combo.conditionValue < 0 && combo.condition === 'gt') return combo.discountValue;
    else return 0;
  }
};

const createLead = async (contact: any, data: any, ownerId: string) => {
  const { contactBasicInfo = {} } = contact;
  logger.info(`${LOGGER_WEB} contact: ${JSON.stringify(contact)}`);
  let centre;
  if (data.centre || contact && contact.centre && `${contact.centre._id}`) {
    const centreRecord = await centreRepository.findById(data.centre || contact && contact.centre && `${contact.centre._id}`) as any;
    if (centreRecord) {
      centre = {
        _id: centreRecord._id,
        name: centreRecord.name,
        shortName: centreRecord.shortName,
      };
    }
  }
  const id = await leadRepository.create({
    contact: {
      _id: contact._id,
      firstName: contactBasicInfo.firstName,
      lastName: contactBasicInfo.lastName,
      fullName: (contactBasicInfo.firstName ? contactBasicInfo.firstName : '') + (contactBasicInfo.firstName ? ' ' : '') + (contactBasicInfo.lastName ? contactBasicInfo.lastName : ''),
      phone: contactBasicInfo.phone,
      email: contactBasicInfo.email,
      fb: contactBasicInfo.firstName,
      address: contactBasicInfo.address,
    },
    centre,
    createdAt: moment().valueOf(),
    sourceId: PROSPECTING_LIST_SOURCE_WEB,
    owner: ownerId ? { id: ownerId } : undefined,
    currentStage: 'New',
    currentStatus: 'Chưa liên lạc',
  } as any);
  await contactRepository.update({
    _id: contact._id,
    leadId: `${id}`,
    currentStatus: 'L2A - Đúng đối tượng - cần chăm sóc lại',
    currentStage: 'L2',
  } as any);
  // update l2A
  logger.info(`${LOGGER_WEB} created leadDefaultTask`);
  await createLeadDefaultTask(`${id}`, ownerId);
  let combo;
  if (data.combo) {
    combo = await productComboRepository.findById(data.combo) as any;
  }
  logger.info(`${LOGGER_WEB} find Courses`);
  const coursesPromise = data.courses && data.courses.length ? data.courses.map((val: any) => {
    return productCourseRepository.findById(val.courseId);
  }) : [];
  let classes = [] as any;
  const courses = await Promise.all(coursesPromise);
  if (data.class && data.class.constructor === Array) {
    const classPromises = data.class.map((item: string) => {
      return classRepository.findById(item);
    });
    classes = await Promise.all(classPromises);
  }
  else if (data.class) {
    const classItem = await classRepository.findById(data.class);
    if (classItem) classes = [classItem];
  }

  const coursesInPO = courses.length ? courses.map((val: any) => {
    if (!val) return;
    const filterCourse = data.courses.filter((v: any) => String(v.courseId) === String(val._id))[0];
    const filterClass = classes.filter((item: any) => item && `${item.courseId}` === `${val._id}`).length
      ? classes.filter((item: any) => item && `${item.courseId}` === `${val._id}`)[0] : undefined;
    return val ? {
      _id: val._id,
      name: val.name,
      shortName: val.shortName,
      tuitionBeforeDiscount: val.tuitionBeforeDiscount,
      stage: 'New',
      discountValue: filterCourse.discountValue,
      discountType: filterCourse.discountType,
      index: uuid.v4(),
      classId: filterClass ? filterClass._id : undefined,
      class: filterClass ? filterClass.name : undefined,
    } : undefined;
  }).filter((val: any) => val) : [];
  logger.info(`${LOGGER_WEB} Create lead product order`);
  const productOrder = await leadProductOrderRepository.create({
    leadId: id,
    comboId: combo ? combo._id : undefined,
    comboName: combo ? combo.name : undefined,
    courses: coursesInPO,
  } as any) as any;
  logger.info(`${LOGGER_WEB} Update lead with product order`);

  await leadRepository.update({
    id,
    productOrder: {
      _id: productOrder,
      courseCount: data.courses.length,
      comboId: combo ? combo._id : undefined,
      comboName: combo ? combo.name : undefined,
      courses: coursesInPO,
    },
    tuition: {
      totalAfterDiscount: calculateTuitionAD(coursesInPO, combo),
      remaining: calculateTuitionAD(coursesInPO, combo),
    },
  } as any);
  return id;
};

const removePLRelationInfos = async (id: string) => {
  try {
    const promises = [] as any;
    const contacts = await contactRepository.findByCriteria({ prospectingListId: id });
    const leadContacts = contacts.filter((contact: any) => contact.leadId);

    leadContacts.forEach((contact: any) => {
      promises.push(contactRepository.update({ _id: contact._id, prospectingListId: null } as any));
    });
    await Promise.all(promises);
  } catch (err) {
    logger.error(err);
  }
};

export default prospectingListService;
