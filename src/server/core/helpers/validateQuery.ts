import { FindQuery } from '@app/core';
import { UserInputError } from '../errors/UserInputError';

export const validateQuery = (query: FindQuery | undefined) => {
  if (!query) {
    throw new UserInputError('Query is undefined');
  }
  const limit = query.limit || query.first;
  if (!limit || isNaN(limit) || limit < 0 || limit > 100) {
    throw new UserInputError('Query.first is invalid');
  }
};
