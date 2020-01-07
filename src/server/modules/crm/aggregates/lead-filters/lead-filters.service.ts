import { LeadFiltersService } from './interfaces/LeadFilterService';
import { validateQuery, validateOperation, NotAuthorizedError, validatePayload, EntityNotFoundError } from '@app/core';
import * as yup from 'yup';
import { leadFiltersRepository } from './lead-filters.repository';

const leadFilterService: LeadFiltersService = {
  setup: (app, path) => {
    app.get(path + '/customs/check-filter-name/:filterName', leadFilterService.checkFilterName);
  },
  find: async ({ query, repository, authUser }) => {
    if (!query.operation) {
      // 1. authorize
      if (!authUser || !authUser.id) {
        throw new NotAuthorizedError({type: 'owner'});
      }

      // 2. validate
      validateQuery(query);

      // 3. do business logic

      // 4. persist to db
      return await repository.find({
        ...query,
        owner: authUser ? authUser.id : '',
      });
    } else {
      validateOperation(query.operation, ['getAllRecords']);
      return await leadFilterService[query.operation]({ repository, authUser });
    }
  },
  getAllRecords: async ({ repository, authUser }) => {
    // 1. authorize
    if (!authUser || !authUser.id) {
      throw new NotAuthorizedError({type: 'owner'});
    }

    // 2. validate

    // 3. do business logic

    // 4. persist to db
    const data = await repository.findAll(authUser.id);
    return {
      data,
    };
  },
  create: async (data, { authUser, repository, creationInfo }) => {
    // 1. authorize
    if (!authUser || !authUser.id) {
      throw new NotAuthorizedError({type: 'owner'});
    }

    // 2. validate
    await validatePayload({
      name: yup.string()
        .required('Filter name is required')
        .matches(/^[a-zA-Z0-9 ]+$/, `Filter name can't contain special character`)
        .min(2, 'Filter name is too short')
        .max(50, 'Filter name is too long'),
      search: yup.string(),
      filters: yup.array(),
    }, data);

    // 3. do business logic

    // 4. persist to db
    const id = await repository.create({
      ...data,
      ...creationInfo,
      owner: authUser ? authUser.id : '',
    });
    return {
      id,
    };
  },
  remove: async (id, { authUser, repository }) => {
    // 1. authorize
     if (!authUser || !authUser.id) {
      throw new NotAuthorizedError({type: 'owner'});
    }

    // 2. validate
    const existedLeadFilter = await repository.findById(id);
    if (!existedLeadFilter) {
      throw new EntityNotFoundError('Lead filter');
    }
    if (existedLeadFilter.owner !== authUser.id) {
      throw new NotAuthorizedError({type: 'owner'});
    }

    // 3. do business logic

    // 4. persist to db
    await repository.del(id);
    return {};
  },
  checkFilterName: async (req: any, res: any) => {
    try {
      const existedFilterName = await leadFiltersRepository.findOne({name: req.params.filterName});
      res.status(200).json({
        existedFilterName: Boolean(existedFilterName),
      });
    } catch (error) {
      res.status(error.status || 500).end(error.message || req.t('internalServerError'));
    }
  },
};

export default leadFilterService;
