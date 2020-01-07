import uuid from 'uuid';
import _ from 'lodash';
import { Lead } from '@client/services/service-proxies';

export const shapeLeadByEnrollments = (leads: Lead[]): any => {
  const leadByEnrollments = leads.map((lead: Lead) => {
    const productItems = _.get(lead, 'order.productItems');
    if (!productItems) {
      return {
        leadRowSpan: 1,
        productItemRowSpan: 1,
        ...lead,
        uuid: uuid.v4(),
        enrollment: {},
        productItem: {},
      };
    }
    const totalLeadRow = productItems.reduce((prev: any, prodItem: any) => {
      let enrollmentCount = _.get(prodItem, 'enrollments.length', 1);
      if (enrollmentCount === 0) {
        enrollmentCount = 1;
      }
      return prev + enrollmentCount;
    }, 0);
    return productItems.map((productItem: any, productItemIndex: number) => {
      const enrollments = _.get(productItem, 'enrollments');
      if (!enrollments || !enrollments.length) {
        return {
          leadRowSpan: productItemIndex === 0 ? totalLeadRow : 0,
          productItemRowSpan: 1,
          ...lead,
          uuid: uuid.v4(),
          enrollment: {},
          productItem,
        };
      }
      return enrollments.map((enrollment: any, enrollmentIndex: number) => ({
        leadRowSpan: (productItemIndex + enrollmentIndex) === 0 ? totalLeadRow : 0,
        productItemRowSpan: enrollmentIndex === 0 ? enrollments.length : 0,
        enrollment,
        productItem,
        ...lead,
        uuid: uuid.v4(),
      }));
    });
  }) as any;
  const expandedLeads = _.flattenDeep(leadByEnrollments);
  return expandedLeads;
};
