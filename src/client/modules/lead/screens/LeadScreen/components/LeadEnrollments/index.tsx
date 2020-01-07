import React, { useState } from 'react';
import _ from 'lodash';
import { Customer, Lead, ProductType, LeadOrderItem, ProductEnrollmentItemStatus } from '@client/services/service-proxies';
import { SingleEnrollment } from './SingleEnrollment';
import { ComboEnrollment } from './ComboEnrollment';
import { SpecialEnrollment } from './SpecialEnrollment';
import produce from 'immer';

interface Props {
  leadInfo: Lead;
  changeInput: (values: (Customer|Lead)) => void;
}

export const LeadEnrollments = (props: Props) => {
  const [productItems, setProductItems] = useState<LeadOrderItem[]>(_.get(props.leadInfo, 'order.productItems', []));

  const handleProductEnrollmentChange = (newProductEnrollments: any[], productItemIndex: number) => {
    setProductItems(produce(productItems, (draftState) => {
      draftState[productItemIndex].enrollments = newProductEnrollments;
    }));
  };

  const addEmptyProductEnrollmentItem = (productItemIndex: number) => {
    setProductItems(produce(productItems, (draftState) => {
      draftState[productItemIndex].enrollments = [
        ..._.get(draftState[productItemIndex], 'enrollments', []),
        {status: ProductEnrollmentItemStatus.Not_Enrolled},
      ] as any;
    }));
  };

  const sendEnrollmentStatusSuccess = (newLeadInfo: Lead, productItemIndex: number, productEnrollmentItemIndex: number) => {
    props.changeInput(newLeadInfo);
    setProductItems(produce(productItems, (draftState) => {
      draftState[productItemIndex].enrollments = _.get(productItems, `[${productItemIndex}].enrollments`, []).map((productEnrollmentItem: any, index: number) => {
        if (index === productEnrollmentItemIndex) {
          return _.get(newLeadInfo, `order.productItems[${productItemIndex}].enrollments[${productEnrollmentItemIndex}]`);
        } else {
          return productEnrollmentItem;
        }
      });
    }));
  };

  return (
    <div>
      {productItems.map((productItem, productItemIndex) => {
        switch (_.get(productItem, 'product.type')) {
          case ProductType.Single:
            return (
              <SingleEnrollment
                leadInfo={props.leadInfo}
                productItemIndex={productItemIndex}
                productItem={productItem}
                handleProductEnrollmentChange={handleProductEnrollmentChange}
                sendEnrollmentStatusSuccess={sendEnrollmentStatusSuccess}
              />
            );
          case ProductType.Combo:
            return (
              <ComboEnrollment
                leadInfo={props.leadInfo}
                productItemIndex={productItemIndex}
                productItem={productItem}
                handleProductEnrollmentChange={handleProductEnrollmentChange}
                sendEnrollmentStatusSuccess={sendEnrollmentStatusSuccess}
              />
            );
          case ProductType.Special:
            return (
              <SpecialEnrollment
                leadInfo={props.leadInfo}
                productItemIndex={productItemIndex}
                productItem={productItem}
                handleProductEnrollmentChange={handleProductEnrollmentChange}
                addEmptyProductEnrollmentItem={addEmptyProductEnrollmentItem}
                sendEnrollmentStatusSuccess={sendEnrollmentStatusSuccess}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
};
