import {
  OrderProductItem,
  ClassEnrollmentStatuses,
  ProductEnrollmentItem,
} from '@app/crm';
import _ from 'lodash';

export const findActiveEnrollmentInProductItem = (productItem: OrderProductItem) => {
  return _.get(productItem, 'enrollments', [])
    .find((enrollment: ProductEnrollmentItem) => (
      enrollment.status === ClassEnrollmentStatuses.Approved || enrollment.status === ClassEnrollmentStatuses.Waiting
    ));
}