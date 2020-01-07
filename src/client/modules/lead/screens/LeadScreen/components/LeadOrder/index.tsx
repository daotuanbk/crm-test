import React, { useState } from 'react';
import { Lead, Customer, LeadProduct, LeadOrderItem, PromotionDiscountType, LeadPaymentItem } from '@client/services/service-proxies';
import { Button, notification, Descriptions, Table, Typography } from 'antd';
import _ from 'lodash';
import { getErrorMessage, calculatePromotionValue, formatMoney, checkPermission } from '@client/core';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { MakeOrderModal } from '../MakeOrderModal';
import { AddPaymentModal, PaymentType } from '../AddPaymentModal';
import moment from 'moment';
import { config } from '@client/config';
import { PERMISSIONS } from '@common/permissions';
import { AuthUser } from '@client/store';

interface Props {
  authUser: AuthUser;
  leadInfo: Lead;
  changeInput: (values: (Customer|Lead)) => void;
}

export const LeadOrder = (props: Props) => {
  const hasOrder = !!_.get(props, 'leadInfo.order.code');

  const [loadingMakeOrderFromProduct, setLoadingMakeOrderFromProduct] = useState<boolean>(false);
  const [makeOrderModalVisible, setMakeOrderModalVisible] = useState<boolean>(false);
  const [addPaymentModalVisible, setAddPaymentModalVisible] = useState<string>('');

  const openMakeOrderModal = () => {
    setMakeOrderModalVisible(true);
  };

  const closeMakeOrderModal = () => {
    setMakeOrderModalVisible(false);
  };

  const openAddPaymentModal = (paymentType: string) => {
    setAddPaymentModalVisible(paymentType);
  };

  const closeAddPaymentModal = () => {
    setAddPaymentModalVisible('');
  };

  const makeOrderFromProduct = async () => {
    try {
      setLoadingMakeOrderFromProduct(true);

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      const orderItems = _.get(props, 'leadInfo.products', []).map((leadProduct: LeadProduct) => {
        return {
          product: leadProduct.product._id,
          candidate: leadProduct.candidate._id,
        };
      });
      const newLeadInfo = await serviceProxy.createLeadOrder(props.leadInfo._id, {
        orderItems,
      });
      props.changeInput(newLeadInfo);
      notification.success({
        message: 'Make order from product success',
        placement: 'bottomRight',
      });
    } catch (error) {
      notification.error({
        message: 'Make order failed',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      setLoadingMakeOrderFromProduct(false);
    }
  };

  if (!hasOrder) {
    const disableMakeOrderFromProduct = !(_.get(props, 'leadInfo.products.length', 0) > 0);
    return (
      <div>
        {/* <Button
          type='primary'
          icon='plus'
          style={{marginRight: '16px'}}
          disabled={disableMakeOrderFromProduct}
          loading={loadingMakeOrderFromProduct}
          onClick={makeOrderFromProduct}
        >
          Make order from products
        </Button> */}
        <Button
          type='primary'
          icon='plus'
          onClick={openMakeOrderModal}
        >
          Make order
        </Button>

        {makeOrderModalVisible ? (
          <MakeOrderModal
            visible={makeOrderModalVisible}
            leadInfo={props.leadInfo}
            closeModal={closeMakeOrderModal}
            changeInput={props.changeInput}
          />
        ) : null}
      </div>
    );
  }

  const maxIndex = _.get(props.leadInfo, 'order.productItems', []).length;
  const orderColumns = [{
    title: 'Product',
    render: (_text: string, record: LeadOrderItem, index: number) => {
      if (index < maxIndex) {
        return {
          children: <span>{_.get(record, 'product.name', '')}</span>,
          props: {
            colSpan: 1,
          },
        };
      }
      return {
        children: <span>Total</span>,
        props: {
          colSpan: 2,
        },
      };
    },
  }, {
    title: 'Candidate',
    render: (_text: string, record: LeadOrderItem, index: number) => {
      if (index < maxIndex) {
        return {
          children: <span>{_.get(record, 'candidate.fullName', '')}</span>,
          props: {
            colSpan: 1,
          },
        };
      }
      return {
        children: '',
        props: {
          colSpan: 0,
        },
      };
    },
  }, {
    title: 'Tuition',
    render: (_text: string, record: LeadOrderItem, index: number) => {
      if (index < maxIndex) {
        return {
          children: <span>{formatMoney(_.get(record, 'product.price', 0))}</span>,
          props: {
            colSpan: 1,
          },
        };
      }

      let tuitionBeforeDiscount = 0;
      _.get(props.leadInfo, 'order.productItems', []).forEach((item: any) => {
        tuitionBeforeDiscount += item.product.price;
      });
      return {
        children: <span>{formatMoney(tuitionBeforeDiscount)}</span>,
        props: {
          colSpan: 1,
        },
      };
    },
  }, {
    title: 'Discount',
    render: (_text: string, record: LeadOrderItem, index: number) => {
      if (index < maxIndex) {
        if (_.get(record, 'promotion.discountType') === PromotionDiscountType.Value) {
          return {
            children: <span>{formatMoney(_.get(record, 'promotion.value', 0))}</span>,
            props: {
              colSpan: 1,
            },
          };
        } else if (_.get(record, 'promotion.discountType') === PromotionDiscountType.Percent) {
          return {
            children: <span>{_.get(record, 'promotion.percent', 0)}%</span>,
            props: {
              colSpan: 1,
            },
          };
        }
        return {
          children: <span>N/A</span>,
          props: {
            colSpan: 1,
          },
        };
      }

      return {
        children: <span></span>,
        props: {
          colSpan: 1,
        },
      };
    },
  }, {
    title: 'Revenue',
    render: (_text: string, record: LeadOrderItem, index: number) => {
      if (index < maxIndex) {
        const promotionValue = calculatePromotionValue(record.promotion, record.product);
        const revenue = _.get(record, 'product.price', 0) - promotionValue;

        return {
          children: <span>{formatMoney(revenue)}</span>,
          props: {
            colSpan: 1,
          },
        };
      }
      return {
        children: <span>{formatMoney(_.get(props.leadInfo, 'tuition.totalAfterDiscount', 0))}</span>,
        props: {
          colSpan: 1,
        },
      };
    },
  }];

  const paymentHistoryColumns = [{
    title: 'Payment time',
    render: (_text: string, record: LeadPaymentItem) => record.payday ? moment(record.payday).format(config.stringFormat.date) : 'Total',
  }, {
    title: 'Amount',
    render: (_text: string, record: LeadPaymentItem) => formatMoney(record.amount),
  }, {
    title: 'Note',
    render: (_text: string, record: LeadPaymentItem) => <div>{record.note}</div>,
  }];

  let totalPayment = 0;
  for (const paymentItem of _.get(props.leadInfo, 'payments', [])) {
    totalPayment += paymentItem.amount;
  }

  let totalRefund = 0;
  for (const refundItem of _.get(props.leadInfo, 'refunds', [])) {
    totalRefund += refundItem.amount;
  }

  // const allowedEditOrder = _.get(props.leadInfo, 'tuition.completePercent', 0) < 100;
  return (
    <div>
      <div className='order-summary'>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
          <Typography.Title level={4}>Summary</Typography.Title>
          <div>
            {checkPermission(props.authUser, PERMISSIONS.LEAD_PAYMENT.CREATE) ? (
              <Button type='primary' icon='plus' onClick={() => openAddPaymentModal(PaymentType.Payment)}>
                Add payment
              </Button>
            ) : null}
            {checkPermission(props.authUser, PERMISSIONS.LEAD_REFUND.CREATE) ? (
              <Button type='primary' icon='plus' style={{marginLeft: '12px'}} onClick={() => openAddPaymentModal(PaymentType.Refund)}>
                Add refund
              </Button>
            ) : null}
          </div>
        </div>

        <Descriptions bordered={true} size='small'>
          <Descriptions.Item label='Payment status' span={3}>
            {_.get(props.leadInfo, 'tuition.completePercent', 0)}%
          </Descriptions.Item>
          <Descriptions.Item label='Total' span={3}>
            {formatMoney(_.get(props.leadInfo, 'tuition.totalAfterDiscount', 0))}
          </Descriptions.Item>
          <Descriptions.Item label='Paid' span={3}>
            {formatMoney(_.get(props.leadInfo, 'tuition.totalPayment', 0))}
          </Descriptions.Item>
          <Descriptions.Item label='Refunded' span={3}>
            {formatMoney(_.get(props.leadInfo, 'tuition.totalRefund', 0))}
          </Descriptions.Item>
          <Descriptions.Item label='Remaining' span={3}>
            {formatMoney(_.get(props.leadInfo, 'tuition.remaining', 0))}
          </Descriptions.Item>
        </Descriptions>
      </div>

      <div className='order-detail' style={{marginTop: '24px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
          <Typography.Title level={4}>Order</Typography.Title>
          {/* <div>
            {allowedEditOrder ? (
              <Button type='primary' icon='edit' onClick={openMakeOrderModal}>
                Edit
              </Button>
            ) : null}
          </div> */}
        </div>

        <Descriptions bordered={true} size='small'>
          <Descriptions.Item label='Order ID' span={3}>
            {_.get(props.leadInfo, 'order.code')}
          </Descriptions.Item>
        </Descriptions>

        <Table
          style={{marginTop: '24px'}}
          bordered={true}
          columns={orderColumns}
          dataSource={[..._.get(props.leadInfo, 'order.productItems', []), {}]}
          pagination={false}
          rowKey={(record: any) => record._id}
        />
      </div>

      {_.get(props.leadInfo, 'payments', []).length > 0 ? (
        <div style={{marginTop: '24px'}}>
          <Typography.Title level={4}>Payment history</Typography.Title>

          <Table
            bordered={true}
            columns={paymentHistoryColumns}
            dataSource={[
              ..._.get(props.leadInfo, 'payments', []),
              {payday: '', amount: totalPayment, note: ''},
            ]}
            pagination={false}
            rowKey={(record: any) => record._id}
          />
        </div>
      ) : null}

      {_.get(props.leadInfo, 'payments', []).length > 0 ? (
        <div style={{marginTop: '24px'}}>
          <Typography.Title level={4}>Refund history</Typography.Title>

          <Table
            bordered={true}
            columns={paymentHistoryColumns}
            dataSource={[
              ..._.get(props.leadInfo, 'refunds', []),
              {payday: '', amount: totalRefund, note: ''},
            ]}
            pagination={false}
            rowKey={(record: any) => record._id}
          />
        </div>
      ) : null}

      {makeOrderModalVisible ? (
        <MakeOrderModal
          visible={makeOrderModalVisible}
          leadInfo={props.leadInfo}
          closeModal={closeMakeOrderModal}
          changeInput={props.changeInput}
        />
      ) : null}

      {!!addPaymentModalVisible ? (
        <AddPaymentModal
          visible={!!addPaymentModalVisible}
          type={addPaymentModalVisible as any}
          closeModal={closeAddPaymentModal}
          leadInfo={props.leadInfo}
          changeInput={props.changeInput}
        />
      ) : null}
    </div>
  );
};
