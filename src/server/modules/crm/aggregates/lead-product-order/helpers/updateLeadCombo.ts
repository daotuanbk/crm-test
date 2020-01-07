import { leadRepository, calculateTuitionAD, leadPaymentTransactionRepository } from '@app/crm';
import { get } from 'lodash';

export const updateLeadCombo = async (leadId: string, payload: any) => {
  const lead = await leadRepository.findById(leadId);

  if (get(lead, 'productOrder.comboId')) {
    const tuitionAD = calculateTuitionAD(payload, lead.productOrder.courses);

    let totalPayment = 0;
    const transactions = await leadPaymentTransactionRepository.find({ leadId: lead._id } as any);
    if (transactions) {
      totalPayment = transactions.reduce((sum: number, val: any) => sum + Number(val.amount), 0);
    }
    const remaining = Number(tuitionAD) - Number(totalPayment);

    await leadRepository.update({
      id: lead._id,
      'tuition.totalAfterDiscount': tuitionAD,
      'tuition.remaining': remaining,
      'productOrder.comboName': payload.name,
    } as any);
  }
};
