import React from 'react';
import { Modal, Row, Col, Select, Input } from 'antd';
import { translate } from '@client/i18n';

interface Props {
  loading: boolean;
  visible: boolean;
  createCourseData: any;
  checkComboConditionForCourse: any;
  courses: any;
  combo: any;
  comboDiscount: any;
  createCourse: () => void;
  toggleCreateCourseModal: (visible: boolean) => void;
  changeCourseInput: (value: any) => void;
  changeCreateCourseInput: (value: any) => void;
}

export const CreateCourseModal = (props: Props) => {
  const inputValue = props.checkComboConditionForCourse(props.courses.length, props.combo, [...props.courses, props.createCourseData]) !== 'NONE' ? props.comboDiscount : 0;

  return (
    <Modal
      confirmLoading={props.loading}
      title={translate('lang:createCourse')}
      visible={props.visible}
      onOk={props.createCourse}
      onCancel={() => props.toggleCreateCourseModal(false)}
    >
      <Row type='flex'>
        <Col xs={24} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%' }}>
            <h4>{translate('lang:course')}</h4>
            <Select
              style={{ width: '100%' }}
              value={props.createCourseData._id}
              onChange={(value: any) => props.changeCourseInput(value)}
            >
              {props.courses.map((val: any) => {
                return <Select.Option value={val._id} key={val._id}>{val.name}</Select.Option>;
              })}
            </Select>
          </div>
        </Col>
        <Col xs={12} style={{ display: 'flex', alignItems: 'center' }}>
          <div>
            <h4>{translate('lang:comboDiscount')}:</h4>
            <Input
              value={inputValue}
              disabled={true}
            />
          </div>
        </Col>
        <Col xs={12} style={{ display: 'flex' }}>
          <Col xs={15} style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              <h4>{translate('lang:additionalDiscount')}</h4>
              <Input
                value={props.createCourseData.discountValue}
                type='number'
                onChange={(e) => props.changeCreateCourseInput({discountValue: e.target.value})}
              />
            </div>
          </Col>
          <Col xs={8} offset={1} style={{ display: 'flex', alignItems: 'flex-end' }}>
            <Select
              style={{ width: '100%' }}
              value={props.createCourseData.discountType}
              onChange={(value: any) => props.changeCreateCourseInput({discountType: value})}>
              <Select.Option key='1' value='PERCENT'>%</Select.Option>
              <Select.Option key='2' value='AMOUNT'>VND</Select.Option>
            </Select>
          </Col>
        </Col>
      </Row>
    </Modal>
  );
};
