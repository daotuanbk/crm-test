import React from 'react';
import { Modal, Row, Col, DatePicker } from 'antd';
import { translate } from '@client/i18n';

interface Props {
  loading?: boolean;
  visible: boolean;
  updatedDueDate: any;
  changeDueDate: (date: any) => void;
  updatePaymentDueDate: () => void;
  togglePaymentDueDateModal: (visible: boolean) => void;
}

export const EditPaymentDueDateModal = (props: Props) => {
  return (
    <Modal
      confirmLoading={props.loading}
      title={translate('lang:editPaymentDueDate')}
      visible={props.visible}
      onOk={props.updatePaymentDueDate}
      onCancel={() => props.togglePaymentDueDateModal(false)}
    >
      <Row type='flex'>
        <Col xs={12} style={{ display: 'flex', alignItems: 'center' }}>
          <h4>{translate('lang:newPaymentDueDate')}:</h4>
        </Col>
        <Col xs={12} style={{ display: 'flex', alignItems: 'center' }}>
          <DatePicker value={props.updatedDueDate} onChange={props.changeDueDate} />
        </Col>
      </Row>
    </Modal>
  );
};
