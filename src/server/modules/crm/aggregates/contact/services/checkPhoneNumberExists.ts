import { contactRepository } from '@app/crm';

export const checkPhoneNumberExists = async (req: any, res: any) => {
  try {
    const { phoneNumber } = req.params;

    const existedPhoneNumber = await contactRepository.findOne({phoneNumber});
    res.status(200).json(existedPhoneNumber);
  } catch (error) {
    res.status(error.code || 500).json({message: error.message || req.t('internalServerError')});
  }
};
