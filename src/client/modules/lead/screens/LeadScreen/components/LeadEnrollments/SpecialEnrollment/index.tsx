import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Row, Col, Button, Select } from 'antd';
import { LmsCourse, Lead, ProductEnrollmentItemStatus, LeadOrderItem, LmsClass, ProductEnrollmentItem } from '@client/services/service-proxies';
import { EnrollmentStatus } from '../EnrollmentStatus';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';

interface Props {
  leadInfo: Lead;
  productItemIndex: number;
  productItem: LeadOrderItem;
  handleProductEnrollmentChange: (newProductEnrollments: any[], enrollmentIndex: number) => void;
  sendEnrollmentStatusSuccess: (newLeadInfo: Lead, productItemIndex: number, productEnrollmentItemIndex: number) => void;
  addEmptyProductEnrollmentItem: (enrollmentIndex: number) => void;
}

interface ItemProps {
  enrollments: ProductEnrollmentItem[];
  productEnrollmentItem: ProductEnrollmentItem;
  productItemIndex: number;
  productEnrollmentItemIndex: number;
  leadInfo: Lead;
  productItem: LeadOrderItem;
  handleProductEnrollmentChange: (newProductEnrollments: any[], enrollmentIndex: number) => void;
  sendEnrollmentStatusSuccess: (newLeadInfo: Lead, productItemIndex: number, productEnrollmentItemIndex: number) => void;
}

const SpecialEnrollmentItem = (props: ItemProps) => {
  const [courses, setCourses] = useState<LmsCourse[]>(_.get(props.productItem, 'product.special.selectableCourses', []));
  const [classes, setClasses] = useState<LmsClass[]>([]);

  const { sendEnrollmentStatusSuccess, productItem, productEnrollmentItem, enrollments, handleProductEnrollmentChange, productItemIndex, productEnrollmentItemIndex, leadInfo } = props;

  useEffect(() => {
    if (_.get(productEnrollmentItem, 'course._id')) {
      searchClasses('', _.get(productEnrollmentItem, 'course._id'));
    }
  }, []);

  const searchClasses = async (searchKeyword: string, courseId: string) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);

    const searchClassesResult = await serviceProxy.findLmsClasses(
      searchKeyword,
      courseId ? [courseId] : undefined,
      10,
      1,
      'createdAt|desc',
    );

    setClasses(searchClassesResult.data);
  };

  const handleCourseChange = (newCourseId: string, productEnrollmentIndex: number) => {
    const selectedCourse = _.mapKeys(courses, '_id')[newCourseId];
    const newProductEnrollments = enrollments.map((item, index) => {
      if (index === productEnrollmentIndex && item) {
        return {
          ...item,
          course: selectedCourse,
          class: undefined,
        };
      } else {
        return item;
      }
    });

    handleProductEnrollmentChange(newProductEnrollments, productItemIndex);
    searchClasses('', newCourseId);
  };

  const handleClassChange = (newClassId: string, productEnrollmentIndex: number) => {
    const selectedClass = _.mapKeys(classes, '_id')[newClassId];
    const newProductEnrollments = enrollments.map((item, index) => {
      if (index === productEnrollmentIndex && item) {
        return {
          ...item,
          class: selectedClass,
        };
      } else {
        return item;
      }
    });

    handleProductEnrollmentChange(newProductEnrollments, productItemIndex);
  };

  const renderCoursesById = _.mapKeys(courses, '_id');
  if (_.get(productEnrollmentItem, 'course._id')) {
    renderCoursesById[productEnrollmentItem.course._id] = productEnrollmentItem.course;
  }
  const renderCourses = _.values(renderCoursesById);

  const renderClassesById = _.mapKeys(classes, '_id');
  if (_.get(productEnrollmentItem, 'class._id')) {
    renderClassesById[productEnrollmentItem.class._id] = productEnrollmentItem.class;
  }
  const renderClasses = _.values(renderClassesById);

  const disabledEdit = Boolean([ProductEnrollmentItemStatus.Approved, ProductEnrollmentItemStatus.Waiting].indexOf(_.get(productEnrollmentItem, 'status')) > -1);
  return (
    <Row gutter={16} style={{marginBottom: '8px'}}>
      <Col xs={2}>{productEnrollmentItemIndex === 0 ? 'Courses' : ''}</Col>
      <Col xs={6}>
        <Select
          disabled={disabledEdit}
          style={{ width: '100%' }}
          onSelect={((value: string) => handleCourseChange(value, productEnrollmentItemIndex)) as any}
          value={_.get(productEnrollmentItem, 'course._id')}
          filterOption={() => true}
          placeholder=''
        >
          {renderCourses.map((courseInfo) => {
            return (
              <Select.Option value={courseInfo._id} key={courseInfo._id}>{courseInfo.title}</Select.Option>
            );
          })}
        </Select>
      </Col>
      <Col xs={2}>{productEnrollmentItemIndex === 0 ? 'Classes' : ''}</Col>
      <Col xs={6}>
        <Select
          showSearch={true}
          disabled={disabledEdit}
          style={{ width: '100%' }}
          onSelect={((value: string) => handleClassChange(value, productEnrollmentItemIndex)) as any}
          onSearch={(value: string) => searchClasses(value, _.get(productEnrollmentItem, 'course._id'))}
          value={_.get(productEnrollmentItem, 'class._id')}
          filterOption={() => true}
          placeholder=''
        >
          {renderClasses.map((classInfo) => {
            return (
              <Select.Option value={classInfo._id} key={classInfo._id}>{classInfo.title}</Select.Option>
            );
          })}
        </Select>
      </Col>
      <Col xs={2}>{productEnrollmentItemIndex === 0 ? 'Status' : ''}</Col>
      <Col xs={6}>
        <EnrollmentStatus
          leadInfo={leadInfo}
          productItemId={(productItem as any)._id}
          productItemIndex={productItemIndex}
          courseId={_.get(productEnrollmentItem, 'course._id')}
          classId={_.get(productEnrollmentItem, 'class._id')}
          productEnrollmentItemId={(productEnrollmentItem as any)._id}
          productEnrollmentItemIndex={productEnrollmentItemIndex}
          status={productEnrollmentItem.status}
          sendEnrollmentStatusSuccess={sendEnrollmentStatusSuccess}
        />
      </Col>
    </Row>
  );
};

export const SpecialEnrollment = (props: Props) => {
  const {
    leadInfo,
    productItemIndex,
    productItem,
    handleProductEnrollmentChange,
    addEmptyProductEnrollmentItem,
    sendEnrollmentStatusSuccess,
  } = props;
  const enrollments = _.get(productItem, 'enrollments', []) as any[];
  const lastProductEnrollmentItem = enrollments[enrollments.length - 1];
  const showAddCourseButton = Boolean(!lastProductEnrollmentItem || (lastProductEnrollmentItem && lastProductEnrollmentItem._id));

  return (
    <div style={{marginBottom: '32px'}}>
      <div style={{marginBottom: '8px'}}>
        <b style={{fontSize: '20px'}}>{_.get(productItem, 'candidate.fullName')}</b>
      </div>

      <div style={{paddingLeft: '16px'}}>
        <div style={{marginBottom: '8px'}}>
          <b style={{fontSize: '16px'}}>{_.get(productItem, 'product.name')}</b>
        </div>

        {enrollments.map((productEnrollmentItem, productEnrollmentItemIndex) => {
          return (
            <SpecialEnrollmentItem
              enrollments={enrollments}
              productEnrollmentItem={productEnrollmentItem}
              productItemIndex={productItemIndex}
              productEnrollmentItemIndex={productEnrollmentItemIndex}
              leadInfo={leadInfo}
              productItem={productItem}
              handleProductEnrollmentChange={handleProductEnrollmentChange}
              sendEnrollmentStatusSuccess={sendEnrollmentStatusSuccess}
            />
          );
        })}

        {showAddCourseButton ? (
          <Row gutter={16} style={{marginBottom: '8px'}}>
            <Col xs={2}></Col>
            <Col xs={6}>
              <Button
                type='primary'
                icon='plus'
                onClick={() => addEmptyProductEnrollmentItem(productItemIndex)}
              >
                Add course
              </Button>
            </Col>
            <Col xs={16}></Col>
          </Row>
        ) : null}
      </div>
    </div>
  );
};
