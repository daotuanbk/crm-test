import { logger } from '@app/core';
import { leadRepository } from '../leads.repository';
import { rootContactRepository } from '@app/crm';
import { config } from '@app/config';
import axios from 'axios';

const LOGGER_WEB = 'Web-register';

export const execSyncWithLms = async (leadParams?: any[]) => {
  logger.info(`${LOGGER_WEB} Start Syncing with LMS`);
  let leads = [];
  if (leadParams) {
    leads = leadParams;
  }
  else {
    leads = await leadRepository.findByCriteria({
      'productOrder.courses.class': { $ne: null },
    }, [{
      path: 'contact._id',
      model: 'Contact',
      populate: {
        path: 'prospectingListId',
        model: 'ProspectingList',
      },
    }, 'productOrder.comboId', 'owner.id']);
  }

  const deepClones = JSON.parse(JSON.stringify(leads));
  const promises = deepClones.map((lead: any) => {
    const classes = lead && lead.productOrder && lead.productOrder.courses ?
      lead.productOrder.courses.map((val: any) => val.classId).filter((val: string) => val) : [];
    const parent = lead && lead.contact._id && lead.contact._id.contactRelations && lead.contact._id.contactRelations[0] ? {
      firstName: lead.contact._id.contactRelations[0].fullName,
      lastName: '',
      relation: lead.contact._id.contactRelations[0].relation,
      email: [lead.contact._id.contactRelations[0].email],
      phoneNo: [lead.contact._id.contactRelations[0].phone],
    } : {};
    const ps = classes && classes.length && lead.contact && (lead.contact.email || lead.contact.phone) ? classes.map((v: any) => {
      return axios.post(`${config.lms.systemApiUrl}/users/create-or-update-student`, {
        email: lead.contact ? lead.contact.email : '',
        phoneNo: lead.contact ? lead.contact.phone : '',
        firstName: lead.contact ? lead.contact.firstName : '',
        lastName: lead.contact ? lead.contact.lastName : '',
        name: lead.contact ? lead.contact.fullName : '',
        password: 123456,
        details: {
          fbLink: lead.contact ? lead.contact.fb : '',
          address: lead.contact ? lead.contact.address : '',
          recentClasses: classes,
          parent,
        },
        studentClasses: classes,
        studentCenter: lead.centre ? lead.centre._id : undefined,
        gender: lead.contact && lead.contact._id && lead.contact._id.contactBasicInfo && lead.contact._id.contactBasicInfo.gender ? lead.contact._id.contactBasicInfo.gender : undefined,
        dob: lead.contact && lead.contact._id && lead.contact._id.contactBasicInfo && lead.contact._id.contactBasicInfo.dob ? new Date(lead.contact._id.contactBasicInfo.dob).getTime() : undefined,
        oldClassId: null,
        newClassId: v,
      });
    }) : [];
    return Promise.all(ps);
  });
  const students = await Promise.all(promises);
  const updateLeadPromises = students.map((result: any, index: number) => {
    if (result && result.length) {
      const prs = result.map((res: any) => {
        if (res && res.data) {
          return leadRepository.update({
            id: deepClones[index] ? deepClones[index]._id : undefined,
            lmsStudentId: res.data._id,
          } as any);
        } else {
          return null;
        }
      }).filter((val: any) => val);
      return Promise.all(prs);
    } else {
      return null;
    }
  }).filter((val: any) => val);
  await Promise.all(updateLeadPromises as any);

  const updateRootContactPromises = students.map((result: any, index: number) => {
    if (result && result.length) {
      const prs = result.map((res: any) => {
        if (res && res.data) {
          return rootContactRepository.update({
            id: deepClones[index] && deepClones[index].contact && deepClones[index].contact._id && deepClones[index].contact._id.rootContactId ?
              deepClones[index].contact._id.rootContactId : undefined,
            lmsStudentId: res.data._id,
          } as any);
        } else {
          return null;
        }
      }).filter((val: any) => val);
      return Promise.all(prs);
    } else {
      return null;
    }
  }).filter((val: any) => val);
  await Promise.all(updateRootContactPromises as any);
};

export const syncWithLms = async (req: any, res: any) => {
  try {
    await execSyncWithLms();
    res.status(200).end();
  } catch (error) {
    res.status(error.status || 500).end(error.message || req.t('internalServerError'));
  }
};
