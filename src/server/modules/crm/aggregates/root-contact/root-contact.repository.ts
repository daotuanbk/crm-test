import { addDeletableSchema, NotImplementedError, execCursorPaging, generateFullName } from '@app/core';
import mongoose from 'mongoose';
import { RootContactRepository } from './interfaces/RootContactRepository';
import { mappingContactInfoRepository, contactRepository } from '@app/crm';
import _ from 'lodash';
import axios from 'axios';
import { config } from '@app/config';
import slugify from 'slugify';

const RootContactSchema = new mongoose.Schema(addDeletableSchema({
  contactBasicInfo: {
    firstName: String,
    lastName: String,
    phone: [{
      type: String,
    }],
    email: [{
      type: String,
    }],
    fb: [{
      type: String,
    }],
    address: String,
    gender: String,
    dob: Date,
    avatar: String,
    userType: String,
    job: String,
  },
  contactRelations: [{
    index: String,
    userType: String,
    relation: String,
    description: String,
    fullName: String,
    email: [{
      type: String,
    }],
    phone: [{
      type: String,
    }],
    fb: [{
      type: String,
    }],
    dob: Date,
    job: String,
    social: String,
  }],
  schoolInfo: {
    schoolName: String,
    majorGrade: String,
  },
  createdAt: Date,
  createdBy: {
    type: String,
    ref: 'User',
  },
  updatedAt: Date,
  lastModifiedAt: Date,
  lastModifiedBy: {
    type: String,
    ref: 'User',
  },
  fbConversationId: {
    type: String,
  },
  lmsStudentId: {
    type: String,
  },
}), {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

RootContactSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});

const RootContactModel = mongoose.model('RootContact', RootContactSchema);

export const rootContactRepository: RootContactRepository = {
  findById: async (id) => {
    return await RootContactModel.findById(id)
      .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await RootContactModel.findOne({name: query.name}).exec() as any;
  },
  findByStudentId: async (id: string) => {
    return await RootContactModel.find({lmsStudentId: id}).exec() as any;
  },
  findByEmail: async (email: string) => {
    return await RootContactModel.findOne({email}).exec() as any;
  },
  findByFbConversationId: async (fbConversationId: string) => {
    return await RootContactModel.findOne({fbConversationId}).exec() as any;
  },
  findAll: async () => {
    return await RootContactModel.find({}).exec() as any;
  },
  findInArrayId: async (payload: any) => {
    return await RootContactModel.find({_id: {$in: payload}}).exec();
  },
  find: async (query) => {
    const filters: any[] = [];
    if (query.search) {
      filters.push({ $text: { $search: `"${query.search}"`} });
    }
    if (query.filter && query.filter.length > 0) {
      query.filter.forEach((val: any) => {
        filters.push(val);
      });
    }

    return await execCursorPaging(
      RootContactModel,
      filters,
      query.sortBy,
      Number(query.first),
      [],
      query.before,
      query.after,
    );
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  create: async (payload) => {
    const newRootContact = new RootContactModel({
      ...payload,
    });
    const newRootContactSaved = await newRootContact.save() as any;
    const newRecord = JSON.parse(JSON.stringify(newRootContactSaved));
    const fullName = slugify(generateFullName({
      firstName: newRecord && newRecord.contactBasicInfo && newRecord.contactBasicInfo.firstName ? newRecord.contactBasicInfo.firstName : '',
      lastName: newRecord && newRecord.contactBasicInfo && newRecord.contactBasicInfo.lastName ? newRecord.contactBasicInfo.lastName : '',
    }));
    const reverseFullName = slugify(generateFullName({
      firstName: newRecord && newRecord.contactBasicInfo && newRecord.contactBasicInfo.firstName ? newRecord.contactBasicInfo.firstName : '',
      lastName: newRecord && newRecord.contactBasicInfo && newRecord.contactBasicInfo.lastName ? newRecord.contactBasicInfo.lastName : '',
    }, true));
    if (newRecord.contactBasicInfo) {
      if (newRecord.contactBasicInfo.email && newRecord.contactBasicInfo.email.length) {
        const promises = newRecord.contactBasicInfo.email.map((email: string) => {
          const arr = [];
          if (email) {
            if (fullName) {
              arr.push(mappingContactInfoRepository.findAndCreate({key: `${email}-${fullName}`, refId: newRecord._id}));
            }
            if (reverseFullName) {
              arr.push(mappingContactInfoRepository.findAndCreate({key: `${email}-${reverseFullName}`, refId: newRecord._id}));
            }
          }
          return Promise.all(arr);
        });
        await Promise.all(promises);
      }
      if (newRecord.contactBasicInfo.phone && newRecord.contactBasicInfo.phone.length) {
        const promises = newRecord.contactBasicInfo.phone.map((phone: string) => {
          const arr = [];
          if (phone) {
            if (fullName) {
              arr.push(mappingContactInfoRepository.findAndCreate({key: `${phone}-${fullName}`, refId: newRecord._id}));
            }
            if (reverseFullName) {
              arr.push(mappingContactInfoRepository.findAndCreate({key: `${phone}-${reverseFullName}`, refId: newRecord._id}));
            }
          }
          return Promise.all(arr);
        });
        await Promise.all(promises);
      }
    }
    return newRootContact._id;
  },
  update: async (payload) => {
    await RootContactModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  updateOne: async (criteria, payload) => {
    return await RootContactModel.findOneAndUpdate(criteria, {$set: payload}, {new: true}).exec();
  },
  del: async (_id): Promise<void> => {
    throw new NotImplementedError();
  },
  ensureIndexes: async () => {
    // RootContactSchema.index({ email: 'text', fullName: 'text', phoneNo: 'text' });
    await RootContactModel.createIndexes();
  },
  synchronize: async (id, payload, indexes) => {
    await mappingContactInfoRepository.deleteByRootId(id);
    const record = await RootContactModel.findById(id).exec();
    if (record) {
      const deepCloneRecord = JSON.parse(JSON.stringify(record));
      const newRecord = {
        ...deepCloneRecord,
        ...payload,
        contactBasicInfo: {
          ...(deepCloneRecord.contactBasicInfo ? deepCloneRecord.contactBasicInfo : {}),
          ...(payload.contactBasicInfo ? payload.contactBasicInfo : {}),
          email: payload.contactBasicInfo && payload.contactBasicInfo.email ?
            payload.contactBasicInfo.email.constructor === Array ?
              generateLastUniq([...(deepCloneRecord.contactBasicInfo && deepCloneRecord.contactBasicInfo.email ? deepCloneRecord.contactBasicInfo.email : []), ...payload.contactBasicInfo.email])
              : generateLastUniq([...(deepCloneRecord.contactBasicInfo && deepCloneRecord.contactBasicInfo.email ? deepCloneRecord.contactBasicInfo.email : []), payload.contactBasicInfo.email])
              : deepCloneRecord.contactBasicInfo && deepCloneRecord.contactBasicInfo.email ? generateLastUniq(deepCloneRecord.contactBasicInfo.email) : [],
          phone: payload.contactBasicInfo && payload.contactBasicInfo.phone ?
            payload.contactBasicInfo.phone.constructor === Array ?
              generateLastUniq([...(deepCloneRecord.contactBasicInfo && deepCloneRecord.contactBasicInfo.phone ? deepCloneRecord.contactBasicInfo.phone : []), ...payload.contactBasicInfo.phone])
              : generateLastUniq([...(deepCloneRecord.contactBasicInfo && deepCloneRecord.contactBasicInfo.phone ? deepCloneRecord.contactBasicInfo.phone : []), payload.contactBasicInfo.phone])
              : deepCloneRecord.contactBasicInfo && deepCloneRecord.contactBasicInfo.phone ? generateLastUniq(deepCloneRecord.contactBasicInfo.phone) : [],
          fb: generateLastUniq(payload.contactBasicInfo && payload.contactBasicInfo.fb ?
            payload.contactBasicInfo.fb.constructor === Array ?
              [...(deepCloneRecord.contactBasicInfo && deepCloneRecord.contactBasicInfo.fb ? deepCloneRecord.contactBasicInfo.fb : []), ...payload.contactBasicInfo.fb]
              : [...(deepCloneRecord.contactBasicInfo && deepCloneRecord.contactBasicInfo.fb ? deepCloneRecord.contactBasicInfo.fb : []), payload.contactBasicInfo.fb]
              : deepCloneRecord.contactBasicInfo && deepCloneRecord.contactBasicInfo.fb ? deepCloneRecord.contactBasicInfo.fb : []),
        },
        contactRelations: mapRelationsIndex(distinctValueArray([
          ...(payload.contactRelations ? payload.contactRelations : []),
          ...(deepCloneRecord.contactRelations ? deepCloneRecord.contactRelations : []),
        ], ['email', 'phone']), 'email').filter((v: any) => ((v.email && v.email.length) || (v.phone && v.phone.length) || v.fullName || (v.fb && v.fb.length)))
        .filter((v: any) => indexes && indexes.length ? indexes.indexOf(v.index) < 0 : true),
        schoolInfo: {
          ...(deepCloneRecord.schoolInfo ? deepCloneRecord.schoolInfo : {}),
          ...(payload.schoolInfo ? payload.schoolInfo : {}),
        },
        updatedAt: Date.now(),
        lastModifiedAt: Date.now(),
      };

      if (newRecord.contactBasicInfo) {
        const fullName = slugify(generateFullName({
          firstName: newRecord && newRecord.contactBasicInfo && newRecord.contactBasicInfo.firstName ? newRecord.contactBasicInfo.firstName : '',
          lastName: newRecord && newRecord.contactBasicInfo && newRecord.contactBasicInfo.lastName ? newRecord.contactBasicInfo.lastName : '',
        }));
        const reverseFullName = slugify(generateFullName({
          firstName: newRecord && newRecord.contactBasicInfo && newRecord.contactBasicInfo.firstName ? newRecord.contactBasicInfo.firstName : '',
          lastName: newRecord && newRecord.contactBasicInfo && newRecord.contactBasicInfo.lastName ? newRecord.contactBasicInfo.lastName : '',
        }, true));
        if (newRecord.contactBasicInfo.email && newRecord.contactBasicInfo.email.length) {
          const promises = newRecord.contactBasicInfo.email.map((val: string) => {
            const arr = [];
            if (fullName) {
              arr.push(mappingContactInfoRepository.findAndCreate({key: `${val}-${fullName}`, refId: id}));
            }
            if (reverseFullName) {
              arr.push(mappingContactInfoRepository.findAndCreate({key: `${val}-${reverseFullName}`, refId: id}));
            }
            return Promise.all(arr);
          });
          await Promise.all(promises);
        }
        if (newRecord.contactBasicInfo.phone && newRecord.contactBasicInfo.phone.length) {
          const promises = newRecord.contactBasicInfo.phone.map((val: string) => {
            const arr = [];
            if (fullName) {
              arr.push(mappingContactInfoRepository.findAndCreate({key: `${val}-${fullName}`, refId: id}));
            }
            if (reverseFullName) {
              arr.push(mappingContactInfoRepository.findAndCreate({key: `${val}-${reverseFullName}`, refId: id}));
            }
            return Promise.all(arr);
          });
          await Promise.all(promises);
        }
      }

      const newDocument = await RootContactModel.findByIdAndUpdate(id, {$set: {
        contactBasicInfo: newRecord.contactBasicInfo,
        contactRelations: newRecord.contactRelations,
        schoolInfo: newRecord.schoolInfo,
        updatedAt: Date.now(),
      }}, {new: true}) as any;
      const newDoc = newDocument ? JSON.parse(JSON.stringify(newDocument)) : undefined;

      // Sync w LMS
      const parent = newDoc && newDoc.contactRelations && newDoc.contactRelations.length ? {
        firstName: newDoc.contactRelations[newDoc.contactRelations.length - 1].fullName ? newDoc.contactRelations[newDoc.contactRelations.length - 1].fullName.split(' ').slice(0, -1).join(' ') : '',
        lastName: newDoc.contactRelations[newDoc.contactRelations.length - 1].fullName ? newDoc.contactRelations[newDoc.contactRelations.length - 1].fullName.split(' ').slice(-1).join(' ') : '',
        relation: newDoc.contactRelations[newDoc.contactRelations.length - 1].relation,
        email: newDoc.contactRelations[newDoc.contactRelations.length - 1].email,
        phoneNo: newDoc.contactRelations[newDoc.contactRelations.length - 1].phone,
        fbLink: newDoc.contactRelations[newDoc.contactRelations.length - 1].social ? newDoc.contactRelations[newDoc.contactRelations.length - 1].social :
          newDoc.contactRelations[newDoc.contactRelations.length - 1].fb[0] || undefined,
      } : {};
      if (newDoc && newDoc.lmsStudentId) {
        await axios.post(`${config.lms.systemApiUrl}/users/create-or-update-student`, {
          _id: newDoc.lmsStudentId ? newDoc.lmsStudentId : undefined,
          email: newDoc.contactBasicInfo && newDoc.contactBasicInfo.email && newDoc.contactBasicInfo.email.length ? newDoc.contactBasicInfo.email[newDoc.contactBasicInfo.email.length - 1] : '',
          phoneNo: newDoc.contactBasicInfo && newDoc.contactBasicInfo.phone && newDoc.contactBasicInfo.phone.length ? newDoc.contactBasicInfo.phone[newDoc.contactBasicInfo.phone.length - 1] : '',
          firstName: newDoc.contactBasicInfo ? newDoc.contactBasicInfo.firstName : '',
          lastName: newDoc.contactBasicInfo ? newDoc.contactBasicInfo.lastName : '',
          name: newDoc.contactBasicInfo ? newDoc.contactBasicInfo.fullName : '',
          details: {
            fbLink: newDoc.contactBasicInfo && newDoc.contactBasicInfo.fb.length ? newDoc.contactBasicInfo.fb[newDoc.contactBasicInfo.fb.length - 1] : '',
            address: newDoc.contactBasicInfo ? newDoc.contactBasicInfo.address : '',
            parent,
          },
          gender: newDoc.contactBasicInfo && newDoc.contactBasicInfo.gender ? newDoc.contactBasicInfo.gender : undefined,
          dob: newDoc.contactBasicInfo && newDoc.contactBasicInfo.dob ? new Date(newDoc.contactBasicInfo.dob).getTime() : undefined,
        });
      }

      // Sync w all Contacts
      await syncWithAllContacts(newDoc);
      return newDoc;
    } else {
      return;
    }
  },
  manualSynchronize: async (id, payload) => {
    await mappingContactInfoRepository.deleteByRootId(id);
    const newDoc = await RootContactModel.findOneAndUpdate({_id: id}, {$set: payload}, {new: true}) as any;
    if (newDoc) {
      await syncWithAllContacts(newDoc);
      if (newDoc.contactBasicInfo) {
        const fullName = slugify(generateFullName({
          firstName: newDoc && newDoc.contactBasicInfo && newDoc.contactBasicInfo.firstName ? newDoc.contactBasicInfo.firstName : '',
          lastName: newDoc && newDoc.contactBasicInfo && newDoc.contactBasicInfo.lastName ? newDoc.contactBasicInfo.lastName : '',
        }));
        const reverseFullName = slugify(generateFullName({
          firstName: newDoc && newDoc.contactBasicInfo && newDoc.contactBasicInfo.firstName ? newDoc.contactBasicInfo.firstName : '',
          lastName: newDoc && newDoc.contactBasicInfo && newDoc.contactBasicInfo.lastName ? newDoc.contactBasicInfo.lastName : '',
        }, true));
        if (newDoc.contactBasicInfo.email && newDoc.contactBasicInfo.email.length) {
          const promises = newDoc.contactBasicInfo.email.map((val: string) => {
            const arr = [];
            if (fullName) {
              arr.push(mappingContactInfoRepository.findAndCreate({key: `${val}-${fullName}`, refId: id}));
            }
            if (reverseFullName) {
              arr.push(mappingContactInfoRepository.findAndCreate({key: `${val}-${reverseFullName}`, refId: id}));
            }
            return Promise.all(arr);
          });
          await Promise.all(promises);
        }
        if (newDoc.contactBasicInfo.phone && newDoc.contactBasicInfo.phone.length) {
          const promises = newDoc.contactBasicInfo.phone.map((val: string) => {
            const arr = [];
            if (fullName) {
              arr.push(mappingContactInfoRepository.findAndCreate({key: `${val}-${fullName}`, refId: id}));
            }
            if (reverseFullName) {
              arr.push(mappingContactInfoRepository.findAndCreate({key: `${val}-${reverseFullName}`, refId: id}));
            }
            return Promise.all(arr);
          });
          await Promise.all(promises);
        }
      }
    }
    return newDoc;
  },
  updateLmsStudentId: async (ids, studentId, payload) => {
    if (!payload) {
      return await RootContactModel.updateMany({_id: {$in: ids}}, {$set: {lmsStudentId: studentId}}).exec();
    } else {
      return await rootContactRepository.syncDataFromLms({_id: {$in: ids}}, payload);
    }
  },
  updateEmailAndPhone: async () => {
    const allRootContacts = await RootContactModel.find({}).exec();
    const deepClones = JSON.parse(JSON.stringify(allRootContacts));
    const promises = deepClones.map((val: any) => {
      if (val && val.contactBasicInfo) {
        if (val.contactBasicInfo.email && val.contactBasicInfo.email.constructor !== Array) {
          val.contactBasicInfo.email = [val.contactBasicInfo.email];
        }
        if (val.contactBasicInfo.phone && val.contactBasicInfo.phone.constructor !== Array) {
          val.contactBasicInfo.phone = [val.contactBasicInfo.phone];
        }
        if (val.contactBasicInfo.fb && val.contactBasicInfo.fb.constructor !== Array) {
          val.contactBasicInfo.fb = [val.contactBasicInfo.fb];
        }
        return RootContactModel.updateOne({_id: val._id}, {$set: val}).exec();
      }
      else return null;
    });
    await Promise.all(promises);
  },
  syncDataFromLms: async (criteria, payload) => {
    if (payload) {
      const rootContacts = await RootContactModel.find(criteria).exec();
      const deepClones = JSON.parse(JSON.stringify(rootContacts));
      const promises = deepClones.map((val: any) => {
        if (val) {
          const updateObj = {
            ...val,
            ...payload,
            contactBasicInfo: {
              ...(val.contactBasicInfo ? val.contactBasicInfo : {}),
              ...(payload.contactBasicInfo ? payload.contactBasicInfo : {}),
              email: generateLastUniq([...(val.contactBasicInfo && val.contactBasicInfo.email ? val.contactBasicInfo.email : []),
                ...(payload.contactBasicInfo && payload.contactBasicInfo.email ? payload.contactBasicInfo.email : []),
              ]),
              phone: generateLastUniq([...(val.contactBasicInfo && val.contactBasicInfo.phone ? val.contactBasicInfo.phone : []),
                ...(payload.contactBasicInfo && payload.contactBasicInfo.phone ? payload.contactBasicInfo.phone : []),
              ]),
              fb: generateLastUniq([...(val.contactBasicInfo && val.contactBasicInfo.fb ? val.contactBasicInfo.fb : []),
                ...(payload.contactBasicInfo && payload.contactBasicInfo.fb ? payload.contactBasicInfo.fb : []),
              ]),
            },
            contactRelations: payload.contactRelations && payload.contactRelations.length ? payload.contactRelations : val.contactRelations,
          };

          return RootContactModel.findOneAndUpdate({_id: val._id}, {$set: updateObj}, {new: true}).exec();
        } else {
          return null;
        }
      });
      const newDocuments = await Promise.all(promises);
      const newDocs = newDocuments ? JSON.parse(JSON.stringify(newDocuments)) : [];
      const syncContactPromises = newDocs.map((newDoc: any) => {
        return syncWithAllContacts(newDoc);
      });
      await Promise.all(syncContactPromises);
    }
  },
  mergeRootContacts: async (payload) => {
    if (payload.oldId) {
      await Promise.all([
        await RootContactModel.deleteOne({_id: payload.oldId}),
        await mappingContactInfoRepository.deleteByRootId(payload.oldId),
        await mappingContactInfoRepository.deleteByRootId(payload._id),
      ]);
    }
    const newDoc = await RootContactModel.findOneAndUpdate({_id: payload._id}, {$set: payload}, {new: true}) as any;
    if (newDoc) {
      await syncWithAllContacts(newDoc);
      if (newDoc.contactBasicInfo) {
        const fullName = slugify(generateFullName({
          firstName: newDoc && newDoc.contactBasicInfo && newDoc.contactBasicInfo.firstName ? newDoc.contactBasicInfo.firstName : '',
          lastName: newDoc && newDoc.contactBasicInfo && newDoc.contactBasicInfo.lastName ? newDoc.contactBasicInfo.lastName : '',
        }));
        const reverseFullName = slugify(generateFullName({
          firstName: newDoc && newDoc.contactBasicInfo && newDoc.contactBasicInfo.firstName ? newDoc.contactBasicInfo.firstName : '',
          lastName: newDoc && newDoc.contactBasicInfo && newDoc.contactBasicInfo.lastName ? newDoc.contactBasicInfo.lastName : '',
        }, true));
        if (newDoc.contactBasicInfo.email && newDoc.contactBasicInfo.email.length) {
          const promises = newDoc.contactBasicInfo.email.map((val: string) => {
            const arr = [];
            if (fullName) {
              arr.push(mappingContactInfoRepository.findAndCreate({key: `${val}-${fullName}`, refId: payload._id}));
            }
            if (reverseFullName) {
              arr.push(mappingContactInfoRepository.findAndCreate({key: `${val}-${reverseFullName}`, refId: payload._id}));
            }
            return Promise.all(arr);
          });
          await Promise.all(promises);
        }
        if (newDoc.contactBasicInfo.phone && newDoc.contactBasicInfo.phone.length) {
          const promises = newDoc.contactBasicInfo.phone.map((val: string) => {
            const arr = [];
            if (fullName) {
              arr.push(mappingContactInfoRepository.findAndCreate({key: `${val}-${fullName}`, refId: payload._id}));
            }
            if (reverseFullName) {
              arr.push(mappingContactInfoRepository.findAndCreate({key: `${val}-${reverseFullName}`, refId: payload._id}));
            }
            return Promise.all(arr);
          });
          await Promise.all(promises);
        }
      }
    }
    return newDoc;
  },
};

const distinctValueArray = (array: any, field: string[]) => {
  const obj = {} as any;
  return array.filter((val: any) => {
    if (val) {
      let overlapped = false;
      const objName = field.reduce((sum: string, f: string) => {
        return sum + f + (val[f] ? (val[f].constructor === Array && val[f].length ? val[f][val[f].length - 1] : val[f]) : '');
      }, '');
      if (obj[objName]) {
        overlapped = true;
      } else {
        obj[objName] = 1;
      }
      return !overlapped;
    } else {
      return false;
    }
  });
};

const mapRelationsIndex = (array: any, field: string) => {
  const obj = {} as any;
  array.map((v: any) => {
    if (v && v[field]) {
      if (obj[v[field]]) {
        obj[v[field]] = {
          ...obj[v[field]],
          ...v,
          email: generateLastUniq([...(obj[v[field]].email ? obj[v[field]].email : []), ...(v.email ? v.email.constructor === Array ? v.email : [v.email] : [])]),
          phone: generateLastUniq([...(obj[v[field]].phone ? obj[v[field]].phone : []), ...(v.phone ? v.phone.constructor === Array ? v.phone : [v.phone] : [])]),
        };
      } else {
        obj[v[field]] = {
          ...v,
          email: v.email ? v.email.constructor === Array ? v.email : [v.email] : [],
          phone: v.phone ? v.phone.constructor === Array ? v.phone : [v.phone] : [],
        };
      }
    } else {
      //
    }
  });
  return Object.values(obj);
};

const syncWithAllContacts = async (newDoc: any) => {
    // Sync w all Contacts
  if (newDoc) {
    const allContacts = await contactRepository.findByCriteria({rootContactId: newDoc._id});
    const deepClones = allContacts ? JSON.parse(JSON.stringify(allContacts)) : [];
    const syncContactPromises = deepClones.map((val: any) => {
      const newContact = {
        ...val,
        contactBasicInfo: {
          ...(val.contactBasicInfo ? val.contactBasicInfo : {}),
          ...(newDoc.contactBasicInfo ? newDoc.contactBasicInfo : {}),
          email: val.contactBasicInfo && val.contactBasicInfo.email ?
            val.contactBasicInfo.email : (newDoc.contactBasicInfo && newDoc.contactBasicInfo.email && newDoc.contactBasicInfo.email.length ?
              newDoc.contactBasicInfo.email[newDoc.contactBasicInfo.email.length - 1] : ''),
          phone: val.contactBasicInfo && val.contactBasicInfo.phone ?
            val.contactBasicInfo.phone : (newDoc.contactBasicInfo && newDoc.contactBasicInfo.phone && newDoc.contactBasicInfo.phone.length ?
              newDoc.contactBasicInfo.phone[newDoc.contactBasicInfo.phone.length - 1] : ''),
          fb: val.contactBasicInfo && val.contactBasicInfo.fb ?
            val.contactBasicInfo.fb : (newDoc.contactBasicInfo && newDoc.contactBasicInfo.fb && newDoc.contactBasicInfo.fb.length ?
              newDoc.contactBasicInfo.fb[newDoc.contactBasicInfo.fb.length - 1] : ''),
        },
        contactRelations: newDoc.contactRelations && newDoc.contactRelations.length ? newDoc.contactRelations.map((v: any) => {
          if (v && v.email && v.email.constructor === Array && v.email.length) {
            v.email = v.email[v.email.length - 1];
          }
          if (v && v.phone && v.phone.constructor === Array && v.phone.length) {
            v.phone = v.phone[v.phone.length - 1];
          }
          if (v && v.fb && v.fb.constructor === Array && v.fb.length) {
            v.social = v.fb[v.fb.length - 1];
          }
          return v;
        }) : (val.contactRelations || []),
        schoolInfo: {
          ...(val.schoolInfo ? val.schoolInfo : {}),
          ...(newDoc.schoolInfo ? newDoc.schoolInfo : {}),
        },
        updatedAt: Date.now(),
        lastModifiedAt: Date.now(),
        noSyncNeeded: true,
      };
      return contactRepository.update(newContact);
    });
    await Promise.all(syncContactPromises);
  }
};

const generateLastUniq = (array: any) => {
  return _.reverse(_.uniq(_.reverse(array)));
};
