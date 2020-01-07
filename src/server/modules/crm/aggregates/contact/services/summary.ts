import { contactRepository } from '@app/crm';

export const summary = async (req: any, res: any) => {
  try {
    const { listId } = req.query;
    const contactSummary = await contactRepository.summary(listId);
    res.status(200).json(contactSummary);
  } catch (error) {
    res.status(error.status || 500).end(error.message || 'Internal server error');
  }
};
