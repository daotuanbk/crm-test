import React, { useState } from 'react';
import { ProductEnrollmentItemStatus, Lead } from '@client/services/service-proxies';
import { Tag, Icon, notification } from 'antd';
import { getErrorMessage } from '@client/core';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import _ from 'lodash';

interface Props {
  leadInfo: Lead;
  productItemId: string;
  productItemIndex: number;
  productEnrollmentItemId: string;
  productEnrollmentItemIndex: number;
  courseId: string;
  classId: string;
  status: string;
  sendEnrollmentStatusSuccess: (newLeadInfo: Lead, productItemIndex: number, productEnrollmentItemIndex: number) => void;
}

export const EnrollmentStatus = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);

  const sendEnrollmentRequest = async () => {
    try {
      setLoading(true);

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      const newLeadInfo = await serviceProxy.sendEnrollmentRequest(props.leadInfo._id, props.productItemId, props.productEnrollmentItemId);
      props.sendEnrollmentStatusSuccess(newLeadInfo, props.productItemIndex, props.productEnrollmentItemIndex);
      notification.success({
        message: 'Send enrollment request success',
        placement: 'bottomRight',
      });
    } catch (error) {
      notification.error({
        message: 'Send enrollment request failed',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelEnrollmentRequest = async () => {
    try {
      setLoading(true);

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      const newLeadInfo = await serviceProxy.cancelEnrollmentRequest(props.leadInfo._id, props.productItemId, props.productEnrollmentItemId);
      props.sendEnrollmentStatusSuccess(newLeadInfo, props.productItemIndex, props.productEnrollmentItemIndex);
      notification.success({
        message: 'Cancel enrollment request success',
        placement: 'bottomRight',
      });
    } catch (error) {
      notification.error({
        message: 'Cancel enrollment request failed',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const addProductEnrollmentItem = async () => {
    try {
      setLoading(true);

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      const newLeadInfo = await serviceProxy.addProductEnrollmentItem(props.leadInfo._id, props.productItemId, {
        course: props.courseId,
        class: props.classId,
      });
      props.sendEnrollmentStatusSuccess(newLeadInfo, props.productItemIndex, props.productEnrollmentItemIndex);
      notification.success({
        message: 'Add course success',
        placement: 'bottomRight',
      });
    } catch (error) {
      notification.error({
        message: 'Add course failed',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProductEnrollmentItem = async () => {
    try {
      setLoading(true);

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      const newLeadInfo = await serviceProxy.updateProductEnrollmentItem(props.leadInfo._id, props.productItemId, props.productEnrollmentItemId, {
        course: props.courseId,
        class: props.classId,
      });
      props.sendEnrollmentStatusSuccess(newLeadInfo, props.productItemIndex, props.productEnrollmentItemIndex);
      notification.success({
        message: 'Update course success',
        placement: 'bottomRight',
      });
    } catch (error) {
      notification.error({
        message: 'Update course failed',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Icon type='loading' />
    );
  }

  const productEnrollments = _.mapKeys(_.get(props.leadInfo, 'order.productItems', []), '_id')[props.productItemId].enrollments || [];
  const productEnrollmentsById = _.mapKeys(productEnrollments, '_id');
  const initialProductEnrollmentItem = productEnrollmentsById[props.productEnrollmentItemId] || {};

  switch (props.status) {
    case ProductEnrollmentItemStatus.Not_Enrolled:
      if (props.classId && props.courseId) {
        return (
          <Tag color='#108ee9' onClick={props.productEnrollmentItemId ? updateProductEnrollmentItem : addProductEnrollmentItem}>
            <Icon type='double-right' /> Enroll request
          </Tag>
        );
      } else {
        return (
          <Tag color='#108ee9' onClick={props.productEnrollmentItemId ? updateProductEnrollmentItem : addProductEnrollmentItem}>
            <Icon type='save' /> Save
          </Tag>
        );
      }
    case ProductEnrollmentItemStatus.Waiting:
      return (
        <>
          <Tag color='#faad14'>
            <Icon type='clock-circle' /> Waiting for confirm
          </Tag>
          <Tag onClick={cancelEnrollmentRequest}>
            <Icon type='close' /> Cancel
          </Tag>
        </>
      );
    case ProductEnrollmentItemStatus.Rejected:
      const showEnrollmentRequestButton = Boolean(_.get(initialProductEnrollmentItem, 'class._id') !== props.classId || _.get(initialProductEnrollmentItem, 'course._id') !== props.courseId);
      return (
        <>
          {showEnrollmentRequestButton ? (
            <Tag color='#108ee9' onClick={updateProductEnrollmentItem}>
              <Icon type='double-right' /> Enroll request
            </Tag>
          ) : (
            <>
              <Tag color='#f5222d'>
                <Icon type='close' /> Rejected
              </Tag>
              <Tag color='#108ee9' onClick={sendEnrollmentRequest}>
                <Icon type='double-right' /> Re-enroll
              </Tag>
            </>
          )}
        </>
      );
    case ProductEnrollmentItemStatus.Approved:
      return (
        <Tag color='#52c41a'>
          <Icon type='check' /> Approved
        </Tag>
      );
    default:
      return null;
  }
};
