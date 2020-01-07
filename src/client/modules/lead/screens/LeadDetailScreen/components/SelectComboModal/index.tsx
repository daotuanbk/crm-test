import React from 'react';
import { Modal, Row, Col, Select } from 'antd';
import { translate } from '@client/i18n';

interface Props {
  loading?: boolean;
  visible: boolean;
  selectComboData: any;
  combos: any;
  selectCombo: () => void;
  toggleSelectComboModal: (visible: boolean) => void;
  changeSelectCombo: (value: string) => void;
}

export const SelectComboModal = (props: Props) => {
  return (
    <Modal
      confirmLoading={props.loading}
      title={translate('lang:selectCombo')}
      visible={props.visible}
      onOk={props.selectCombo}
      onCancel={() => props.toggleSelectComboModal(false)}
    >
      <Row type='flex'>
        <Col xs={24} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%' }}>
            <h4>{translate('lang:combo')}</h4>
            <Select
              style={{ width: '100%' }}
              value={props.selectComboData.isDeleted ? props.selectComboData.name : props.selectComboData._id}
              onChange={(value: any) => props.changeSelectCombo(value)}
            >
              {[{ _id: 'None', name: 'None' }, ...props.combos].map((val: any) => {
                return <Select.Option value={val._id} key={val._id}>{val.name}</Select.Option>;
              })}
            </Select>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};
