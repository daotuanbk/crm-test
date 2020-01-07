import { addDeletableSchema, addAuditableSchema, NotImplementedError, execCursorPaging } from '@app/core';
import mongoose from 'mongoose';
import { ClassRepository } from './interfaces/ClassRepository';
import { config } from '@app/config';
import axios from 'axios';
import { mappingContactInfoRepository } from '@app/crm';

const ClassSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  centreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Centre',
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCourse',
  },
  minStudents: Number,
  students: Number,
  tuitionPercent: Number,
})), {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

ClassSchema.virtual('id').get(function() {
  // @ts-ignore
  return this._id;
});

ClassSchema.index({ name: 'text' });
const ClassModel = mongoose.model('Class', ClassSchema);
ClassModel.createIndexes();

export const classRepository: ClassRepository = {
  findById: async (id) => {
    return await ClassModel.findById(id)
      .exec() as any;
  },
  findOne: async (query: {name?: string}) => {
    return await ClassModel.findOne({name: query.name}).exec() as any;
  },
  findAll: async() => {
    return await ClassModel.find({}).sort('startTime|desc').exec();
  },
  find: async (query) => {
    const filters: any[] = [];
    if (query.search) {
      filters.push({name: { $regex: `^${query.search}`, $options: 'i' }});
      // filters.push({ $text: { $search: query.search} });
    }
    if (query.filter && query.filter.length > 0) {
      query.filter.forEach((val: any) => {
        if (val.split('|').length > 1) {
          filters.push({ [val.split('|')[0]]: val.split('|')[1] === 'null' ? null : val.split('|')[1] });
        } else if (val.split('%').length > 1) {
          filters.push({ [val.split('%')[0]]: val.split('%')[1] === 'null' ? null : JSON.parse(val.split('%')[1]) });
        }
      });
    }

    if (query.authUser && query.viewCentre) {
      filters.push({ centreId : query.authUser.centreId });
    }

    return await execCursorPaging(
      ClassModel,
      filters,
      query.sortBy,
      Number(query.first),
      ['centreId', 'courseId'],
      query.before,
      query.after,
    );
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  create: async (payload) => {
    const newClass = new ClassModel({
      ...payload,
    });
    await newClass.save();
    return newClass._id;
  },
  update: async (payload) => {
    await ClassModel.findByIdAndUpdate(payload.id, { $set: payload }).exec();
  },
  del: async (_id): Promise<void> => {
    throw new NotImplementedError();
  },
  ensureIndexes: async () => {
    ClassSchema.index({ name: 'text' });
    await ClassModel.createIndexes();
  },
  findAndPopulate: async (id) => {
    return await ClassModel.findById(id)
      .populate('courseId')
      .exec() as any;
  },
  synchronize: async () => {
    const classes = await axios({
      method: 'GET',
      url: `${config.lms.url}/classes?_limit=10000`,
    });
    if (classes && classes.data) {
      const tuitions = await findTuitionsOfClass(classes.data.filter((val: any) => val.title && val._id));
      const inputs = classes.data.filter((val: any) => val.title && val._id).map((val: any, index: number) => {
        return {
          _id: val._id,
          name: val.title,
          description: val.description,
          startTime: val.startTime,
          endTime: val.endTime,
          centreId: val.center && val.center._id ? val.center._id : '5c7feee8568ccae9b6e3861a',
          courseId: val.course && val.course._id ? val.course._id : undefined,
          minStudents: val.course && val.course.minStudents ? val.course.minStudents : 1,
          students: val.students && val.students.length ? val.students.length : 0,
          createdAt: val.createdAt ? new Date(val.createdAt).getTime() : undefined,
          tuitionPercent: tuitions[index],
        };
      });
      await ClassModel.deleteMany({});
      const promises = inputs.map((val: any) => {
        const newClass = new ClassModel(val);
        return newClass.save();
      });
      await Promise.all(promises);
    }
  },
};

const findTuitionsOfClass = async (classes: any) => {
  const tuitionDataPromises = classes.map((val: any) => {
    const promises = val && val.students ? val.students.map((v: any) => {
      return mappingContactInfoRepository.findTuitions({
        _id: v._id,
        email: v.email,
        phone: v.phoneNo,
      });
    }) : [];
    return Promise.all(promises);
  });

  const tuitionDataOfClasses = await Promise.all(tuitionDataPromises);
  return tuitionDataOfClasses.map((val: any) => {
    const data = val.reduce((sum: any, v: any) => {
      sum.totalAfterDiscount += (v.totalAfterDiscount || 0);
      sum.remaining += (v.remaining || 0);
      return sum;
    }, {
      totalAfterDiscount: 0,
      remaining: 0,
    });
    return data.totalAfterDiscount === 0 ? 100 :
      Math.round((((Number(data.totalAfterDiscount) - Number(data.remaining)) / Number(data.totalAfterDiscount)) * 100));
  });
};
