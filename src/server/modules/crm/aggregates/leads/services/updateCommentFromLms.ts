import * as yup from 'yup';
import { RequestParams, LeadInputError, EntityNotFoundError } from '@app/core';
import { LeadsRepository } from '@app/crm';

export const updateCommentFromLms = async (id: string, data: any, params: RequestParams<LeadsRepository>) => {
  // 1. authorize
  if ((params.authUser as any).fromLms) {
    if (!id) {
      throw new LeadInputError(params.translate('missingId'));
    }
    const existedLead: any = await params.repository.findById(id);
    if (!existedLead) {
      throw new EntityNotFoundError('Lead');
    }
    const validationSchema = yup.object().shape({
      //
    });
    await validationSchema.validate(data);

    // 2. persist to db
    existedLead.productOrder.courses = existedLead.productOrder.courses.map((value: any) => {
      if (value._id === data.courseId) {
        value.comment = data.comment;
        return value;
      } else {
        return value;
      }
    });
    await params.repository.update({
      id,
      ...existedLead,
      ...params.modificationInfo,
    });
    return {};
  }

  return {};
};
