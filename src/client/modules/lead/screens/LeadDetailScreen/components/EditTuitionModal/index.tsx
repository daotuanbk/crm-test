import React from 'react';
import { Modal, Row, Col, Select, Input } from 'antd';
import { translate } from '@client/i18n';

interface Props {
  loading?: boolean;
  visible: boolean;
  editTuitionData: any;
  combo: any;
  courses: any;
  comboDiscount: any;
  editTuition: () => void;
  toggleEditTuitionModal: (visible: boolean) => void;
  changeEditTuitionInput: (payload: any) => void;
  checkComboConditionForCourse: (indexInTable: any, combo: any, courses: any) => string;
}

export const EditTuitionModal = (props: Props) => {
  return (
    <Modal
      confirmLoading={props.loading}
      title={translate('lang:editTuition')}
      visible={props.visible}
      onOk={props.editTuition}
      onCancel={() => props.toggleEditTuitionModal(false)}
    >
      <Row type='flex'>
        <Col xs={12} style={{ display: 'flex', alignItems: 'center' }}>
          <div>
            <h4>{translate('lang:comboDiscount')}:</h4>
            <Input
              value={props.checkComboConditionForCourse(props.editTuitionData.indexInTable, props.combo, props.courses) !== 'NONE' ? props.comboDiscount : 0}
              disabled
            />
          </div>
        </Col>
        <Col xs={12} style={{ display: 'flex' }}>
          <Col xs={15} style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              <h4>{translate('lang:additionalDiscount')}</h4>
              <Input
                value={props.editTuitionData.discountValue}
                type='number'
                onChange={(e) => props.changeEditTuitionInput({discountValue: e.target.value})}
                disabled={props.editTuitionData.shortName === 'UNK'}
              />
            </div>
          </Col>
          <Col xs={8} offset={1} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Select
              style={{ width: '100%' }}
              value={props.editTuitionData.discountType}
              onChange={(value: any) => props.changeEditTuitionInput({discountType: value})}
              disabled={props.editTuitionData.shortName === 'UNK'}
            >
              <Select.Option key='1' value='PERCENT'>%</Select.Option>
              <Select.Option key='2' value='AMOUNT'>VND</Select.Option>
            </Select>
          </Col>
        </Col>
      </Row>
    </Modal>
  );
};
