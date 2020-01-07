import { leadRepository } from '@app/crm';

export const getByLmsId = async (req: any, res: any) => {
  try {
    const result = await leadRepository.findOne({lmsStudentId: req.params.lmsStudentId});
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).end(error.message || req.t('internalServerError'));
  }
};
