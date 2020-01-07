import { leadRepository, leadPaymentTransactionRepository, productComboRepository } from '@app/crm';
import { calculateTuitionAD } from '../helpers/calculateTuitionAD';
import _ from 'lodash';

export const updateDataTuition = async (req: any, res: any) => {
  try {
    const allLeads = await leadRepository.findByCriteria({});
    const deepClones = JSON.parse(JSON.stringify(allLeads));
    const transactionPromises = deepClones.map((val: any) => {
      if (val) {
        return leadPaymentTransactionRepository.find({ leadId: val._id } as any);
      } else {
        return [];
      }
    });
    const transactions = await Promise.all(transactionPromises);
    const comboPromises = deepClones.map((val: any) => {
      if (val && val.productOrder && val.productOrder.comboId) {
        return productComboRepository.findById(val.productOrder.comboId);
      } else {
        return null;
      }
    });
    const combos = await Promise.all(comboPromises);

    const updatePromises = deepClones.map((val: any, index: number) => {
      let tuitionAD = 0;
      const combo = combos[index] || null;
      if (val && val.productOrder) {
        tuitionAD = calculateTuitionAD(val.productOrder.courses, combo);
      } else {
        tuitionAD = 0;
      }
      const leadTransactions = transactions[index] as any;
      let collected = 0;
      if (leadTransactions && leadTransactions.length) {
        const deepClone = JSON.parse(JSON.stringify(leadTransactions));
        collected = deepClone.reduce((sum: any, v: any) => {
          return sum + (v.amount || 0);
        }, 0);
      } else {
        collected = 0;
      }
      return leadRepository.updateByCriteria({ _id: val._id }, {
        tuition: {
          totalAfterDiscount: tuitionAD,
          remaining: tuitionAD - collected,
          completePercent: Math.round(collected / tuitionAD * 100),
        },
        hasTuition: _.get(val, 'productOrder.courses.length', 0) > 0, // Data redundancy for ease of sorting
      });
    });
    await Promise.all(updatePromises);

    res.status(200).end();
  } catch (error) {
    res.status(error.status || 500).end(error.message || req.t('internalServerError'));
  }
};
