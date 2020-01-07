import React from 'react';
import { Modal, Row, Col, Select } from 'antd';
import { translate } from '@client/i18n';

interface Props {
  loading?: boolean;
  visible: boolean;
  editCourseData: any;
  courses: any;
  unknownCourse: any;
  leadInfo: any;
  editCourse: () => void;
  toggleEditCourseModal: (visible: boolean) => void;
  selectCourse: (value: any) => void;
}

export const EditCourseModal = (props: Props) => {
  return (
    <Modal
      confirmLoading={props.loading}
      title={translate('lang:editCourse')}
      visible={props.visible}
      onOk={props.editCourse}
      onCancel={() => props.toggleEditCourseModal(false)}
    >
      <Row type='flex'>
        <Col xs={24} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '100%' }}>
            <h4>{translate('lang:course')}</h4>
            <Select
              style={{ width: '100%' }}
              value={String(props.editCourseData._id)}
              key={props.editCourseData.index}
              onChange={(value: any) => props.selectCourse(value)}
            >
              {props.courses.filter((val: any) => {
                if (val._id === props.unknownCourse) {
                  return true;
                } else {
                  const selectedCourses = (props.leadInfo && props.leadInfo.productOrder &&
                    props.leadInfo.productOrder.courses ? props.leadInfo.productOrder.courses : []).filter((v: any) => v.index !== props.editCourseData.index).map((v: any) => v._id);
                  return selectedCourses.indexOf(val._id) < 0;
                }
              }).map((val: any) => {
                return (
                  <Select.Option value={String(val._id)} key={val._id}>{val.name}</Select.Option>
                );
              })}
            </Select>
          </div>
        </Col>
      </Row>
    </Modal>
  );
};
