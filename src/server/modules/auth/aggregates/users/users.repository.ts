import {
  addDeletableSchema,
  addAuditableSchema,
  NotImplementedError,
  EntityNotFoundError,
  execCursorPaging,
  execPaging,
  logger,
} from '@app/core';
import mongoose from 'mongoose';
import { UsersRepository } from './interfaces/UsersRepository';
import { ObjectId } from 'mongodb';
import cache from 'memory-cache';
import mongoosePaginate from 'mongoose-paginate';
import _ from 'lodash';

const UsersSchema = new mongoose.Schema(addAuditableSchema(addDeletableSchema({
  _id: String,
  email: String,
  givenName: String,
  familyName: String,
  fullName: String,
  phoneNo: String,
  address: String,
  description: String,
  avatarUrl: String,
  dob: String,
  gender: String,
  loginDetail: Object,
  roles: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
    default: [],
  },
  completeSignUp: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  centreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Centre',
  },
})), {
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});
UsersSchema.index({ email: 'text', fullName: 'text', phoneNo: 'text' });
UsersSchema.plugin(mongoosePaginate);
UsersSchema.virtual('id').get(function () {
  // @ts-ignore
  return this._id;
});
const UsersModel = mongoose.model('User', UsersSchema);
// Create index for user collections if not exist.
UsersModel.ensureIndexes();

export const userRepository: UsersRepository = {
  findByRole: async (role: string) => {
    return await UsersModel.find({ roles: role }).populate('roles').lean();
  },
  findById: async (id) => {
    return await UsersModel.findById(id)
      .populate('roles', '_id name')
      .lean();
  },
  findOne: async (query) => {
    return await UsersModel.findOne(query).lean();
  },
  findAll: async (query) => {
    const limit = Number(query.limit) || 100;
    return await execPaging(UsersModel, {}, {}, query.page, limit, ['roles']);
  },
  findSalesman: async (roleSalesmanIds: string[]) => {
    return await UsersModel.find({
      roles: {
        $in: roleSalesmanIds.map((id: string) => new ObjectId(id)),
      },
    }).lean();
  },
  findInterviewer: async (roleInterviewerIds: string[]) => {
    return await UsersModel.find({
      roles: {
        $in: roleInterviewerIds.map((id: string) => new ObjectId(id)),
      },
    }).lean();
  },
  findSalesmanByCentreId: async (roleSalesmanIds, centreId) => {
    return await UsersModel.find({
      centreId: new ObjectId(centreId),
      roles: {
        $in: roleSalesmanIds.map((id: string) => new ObjectId(id)),
      },
    }).lean();
  },
  find: async (query, filter?: any) => {
    const filters: any[] = [];
    if (query.search) {
      filters.push({ $text: { $search: `"${query.search}"` } });
    }
    if (query.roles && query.roles.length > 0) {
      filters.push({
        roles: { $in: query.roles },
      });
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

    logger.info(`[User repo] find query: ${JSON.stringify([...filters, filter || {}])}`);

    return await execCursorPaging(
      UsersModel,
      [...filters, filter || {}],
      query.sortBy,
      Number(query.first),
      ['roles'],
      query.before,
      query.after,
    );
  },
  count: async (_query) => {
    throw new NotImplementedError();
  },
  create: async (payload) => {
    const newUser = new UsersModel({
      ...payload,
      _id: payload.id,
    });
    await newUser.save();
    return newUser.id;
  },
  update: async (payload) => {
    if (payload.unset) {
      await UsersModel.findByIdAndUpdate(payload.id, { $set: payload, $unset: payload.unset }).lean();
    }
    else {
      await UsersModel.findByIdAndUpdate(payload.id, { $set: payload }).lean();
    }
  },
  del: async (_id): Promise<void> => {
    throw new NotImplementedError();
  },
  ensureIndexes: async () => {
    UsersModel.createIndexes();
  },
  getAuthUser: async (id) => {
    const cachedAuthUser = cache.get('AUTH_USER__' + id);
    if (cachedAuthUser) {
      return cachedAuthUser;
    } else {
      const authUser = await UsersModel.findById(id)
        .populate('roles')
        .populate('centreId')
        .lean();

      if (authUser) {
        authUser.permissions = _(authUser.roles).map((role) => role.permissions).flatten().uniq().value(); // get all permissions from every roles
        cache.put('AUTH_USER_' + id, authUser);
        return authUser;
      } else {
        throw new EntityNotFoundError('User');
      }
    }
  },
  getUserWithPermissions: async (id) => {
    const userFound = await UsersModel.findById(id).populate('roles').lean();
    if (userFound) {
      const permissions = _(userFound.roles).map((role) => role.permissions).flatten().uniq().value(); // get all permissions from every roles
      userFound.permissions = permissions;
      return userFound;
    } else {
      throw new EntityNotFoundError('User');
    }
  },
};
