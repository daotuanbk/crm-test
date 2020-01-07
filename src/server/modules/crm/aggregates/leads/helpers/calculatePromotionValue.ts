import { Promotion, Product, DiscountTypes } from '@app/crm';
import _ from 'lodash';

export const calculatePromotionValue = (promotion: Promotion, product: Product) => {
  if (!promotion) {
    return 0;
  } else if (promotion.discountType === DiscountTypes.Value) {
    return _.get(promotion, 'value', 0);
  } else {
    const discountPercent = _.get(promotion, 'percent', 0);
    return Math.round(discountPercent * product.price / 100);
  }
};
