import mongoose from 'mongoose';
import { config } from '@app/config';
import { generateFullName } from '@app/core';
import slugify from 'slugify';

import {
  mappingContactInfoRepository, rootContactRepository,
} from '@app/crm';

const mainFunc = async () => {
  // delete all mappings
  await mappingContactInfoRepository.deleteAll();
  // query all rootContacts
  const rootContacts = await rootContactRepository.findAll();
  const deepClones = JSON.parse(JSON.stringify(rootContacts));
  const promises = deepClones.map((rootContact: any) => {
    return createMapping(rootContact);
  });
  return await Promise.all(promises);
};

const createMapping = async (rootContact: any) => {
  if (rootContact) {
    const fullName = slugify(generateFullName({
      firstName: rootContact.contactBasicInfo && rootContact.contactBasicInfo.firstName ? rootContact.contactBasicInfo.firstName : '',
      lastName: rootContact.contactBasicInfo && rootContact.contactBasicInfo.lastName ? rootContact.contactBasicInfo.lastName : '',
    }));
    const reverseFullName = slugify(generateFullName({
      firstName: rootContact.contactBasicInfo && rootContact.contactBasicInfo.firstName ? rootContact.contactBasicInfo.firstName : '',
      lastName: rootContact.contactBasicInfo && rootContact.contactBasicInfo.lastName ? rootContact.contactBasicInfo.lastName : '',
    }, true));

    if (rootContact.contactBasicInfo && rootContact.contactBasicInfo.email) {
      const emailPromises = rootContact.contactBasicInfo.email.map((email: string) => {
        const array = [];
        if (fullName) {
          array.push(mappingContactInfoRepository.findAndCreate({
            key: `${email}-${fullName}`,
            refId: rootContact._id,
          }));
        }
        if (reverseFullName && reverseFullName !== fullName) {
          array.push(mappingContactInfoRepository.findAndCreate({
            key: `${email}-${reverseFullName}`,
            refId: rootContact._id,
          }));
        }
        return Promise.all(array);
      });
      await Promise.all(emailPromises);
    }

    if (rootContact.contactBasicInfo && rootContact.contactBasicInfo.phone) {
      const phonePromises = rootContact.contactBasicInfo.phone.map((phone: string) => {
        const array = [];
        if (fullName) {
          array.push(mappingContactInfoRepository.findAndCreate({
            key: `${phone}-${fullName}`,
            refId: rootContact._id,
          }));
        }
        if (reverseFullName && reverseFullName !== fullName) {
          array.push(mappingContactInfoRepository.findAndCreate({
            key: `${phone}-${reverseFullName}`,
            refId: rootContact._id,
          }));
        }
        return Promise.all(array);
      });
      await Promise.all(phonePromises);
    }

    return null;
  } else {
    return null;
  }
};

const processing = async () => {
  try {
    await mongoose.connect(config.database.connectionString, { useNewUrlParser: true });
    await mainFunc();
    process.exit();
  } catch (error) {
    // tslint:disable-next-line:no-console
    console.log(error);
    process.exit();
  }
};

processing();
