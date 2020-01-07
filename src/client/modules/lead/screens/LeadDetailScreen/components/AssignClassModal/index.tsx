import React from 'react';
import { Modal, Row, Col, Select } from 'antd';
import { translate } from '@client/i18n';
import { get } from 'lodash';

interface Props {
  leadInfo: any;
  loading: boolean;
  visible: boolean;
  assignClassData: any;
  classes: any;
  assignClass: () => void;
  selectClass: (value: any) => void;
  toggleAssignClassModal: (visible: boolean) => void;
}

export const AssignClassModal = (props: Props) => {
  return (
    <Modal
      title={translate('lang:assignClass')}
      okButtonProps={{loading: props.loading}}
      visible={props.visible}
      onOk={props.assignClass}
      onCancel={() => props.toggleAssignClassModal(false)}
    >
      <Row type='flex'>
        <Col xs={24} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%' }}>
            <h4>{translate('lang:class')}</h4>
            <Select
              style={{ width: '100%' }}
              value={props.assignClassData.classId}
              key={props.assignClassData.index}
              onChange={(value: any) => props.selectClass(value)}
            >
              {get(props, ['assignClassData', '_id'], '') ?
                [{ _id: 'None', name: 'None' },
                ...props.classes.filter((val: any) => val.centreId === props.leadInfo.centre._id && val.courseId === props.assignClassData._id)].map((val: any) => {
                  return <Select.Option value={val._id} key={val._id}>{val.name}</Select.Option>;
                }) : <Select.Option value={'none'} key='none' disabled>{translate('lang:specifyCentre')}</Select.Option>
              }
            </Select>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};
