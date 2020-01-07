import { Promotion, Product, PromotionDiscountType } from '@client/services/service-proxies';

export const calculatePromotionValue = (promotion: Promotion, product: Product) => {
  if (!promotion) {
    return 0;
  } else if (promotion.discountType === PromotionDiscountType.Value) {
    return promotion.value;
  } else {
    return Math.round(promotion.percent * product.price / 100);
  }
};
