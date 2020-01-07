import {
  OrderProductItem,
  calculatePromotionValue,
  Lead,
  LeadTuition,
} from '@app/crm';
import _ from 'lodash';

export const calculateTuitionAfterDiscount = (productItems: OrderProductItem[]) => {
  let tuitionAfterDiscount = 0;

  productItems.forEach((productItem) => {
    let discountValue = 0;
    if (productItem.promotion) {
      discountValue = calculatePromotionValue(productItem.promotion, productItem.product);
    }
    tuitionAfterDiscount = tuitionAfterDiscount + productItem.product.price - discountValue;
  });

  return tuitionAfterDiscount;
};

export const calculateLeadTotalPayment = (lead: Lead) => {
  const payments = _.get(lead, 'payments', []);
  return _.sumBy(payments, 'amount') || 0;
};

export const calculateLeadTotalRefund = (lead: Lead) => {
  const payments = _.get(lead, 'refunds', []);
  return _.sumBy(payments, 'amount') || 0;
};

export const calculateLeadTuitionAfterDiscount = (lead: Lead) => {
  const orderProductItems = _.get(lead, 'order.productItems', []) as [OrderProductItem];
  return calculateTuitionAfterDiscount(orderProductItems);
};

export const calculateLeadTuition = (lead: Lead): LeadTuition => {
  const totalAfterDiscount = calculateLeadTuitionAfterDiscount(lead);
  const totalPayment = calculateLeadTotalPayment(lead);
  const totalRefund = calculateLeadTotalRefund(lead);
  const totalToPay = totalAfterDiscount - totalRefund;
  const paymentLeft = totalPayment - totalRefund;
  const remaining =  totalToPay - paymentLeft;
  const completePercent = totalToPay === 0? 100 : Math.round(paymentLeft / totalToPay * 100);
  return {
    totalAfterDiscount,
    totalPayment,
    totalRefund,
    remaining,
    completePercent,
  };
};
