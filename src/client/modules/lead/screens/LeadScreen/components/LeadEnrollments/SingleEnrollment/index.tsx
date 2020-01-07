import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Row, Col, Select } from 'antd';
import { LmsCourse, LmsClass, Lead, ProductEnrollmentItemStatus, LeadOrderItem } from '@client/services/service-proxies';
import { EnrollmentStatus } from '../EnrollmentStatus';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';

interface Props {
  leadInfo: Lead;
  productItemIndex: number;
  productItem: LeadOrderItem;
  handleProductEnrollmentChange: (newProductEnrollments: any[], enrollmentIndex: number) => void;
  sendEnrollmentStatusSuccess: (newLeadInfo: Lead, productItemIndex: number, productEnrollmentItemIndex: number) => void;
}

export const SingleEnrollment = (props: Props) => {
  const { leadInfo, productItemIndex, productItem, handleProductEnrollmentChange, sendEnrollmentStatusSuccess } = props;
  const enrollments = _.get(productItem, 'enrollments', []) as any[];

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
          const [courses, setCourses] = useState<LmsCourse[]>([]);
          const [classes, setClasses] = useState<LmsClass[]>([]);

          useEffect(() => {
            searchCourses('');
            searchClasses('', _.get(productItem, 'product.single.course'));
          }, []);

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

          const searchCourses = async (searchKeyword: string) => {
            const idToken = await firebase.auth().currentUser!.getIdToken();
            const serviceProxy = getServiceProxy(idToken);

            const searchCoursesResult = await serviceProxy.findLmsCourses(
              searchKeyword,
              undefined,
              10,
              1,
              'createdAt|desc',
            );

            setCourses(searchCoursesResult.data);
          };

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

          const disabledEdit = Boolean([ProductEnrollmentItemStatus.Approved, ProductEnrollmentItemStatus.Waiting].indexOf(productEnrollmentItem.status) > -1);
          return (
            <Row gutter={16} style={{marginBottom: '8px'}}>
              <Col xs={2}>{productEnrollmentItemIndex === 0 ? 'Courses' : ''}</Col>
              <Col xs={6}>
                <Select
                  showSearch={true}
                  disabled={true}
                  style={{ width: '100%' }}
                  onSelect={((value: string) => handleCourseChange(value, productEnrollmentItemIndex)) as any}
                  onSearch={(value: string) => searchCourses(value)}
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
                  productEnrollmentItemId={productEnrollmentItem._id}
                  productEnrollmentItemIndex={productEnrollmentItemIndex}
                  status={productEnrollmentItem.status}
                  sendEnrollmentStatusSuccess={sendEnrollmentStatusSuccess}
                />
              </Col>
            </Row>
          );
        })}
      </div>
    </div>
  );
};
