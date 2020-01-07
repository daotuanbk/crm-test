import React, { useState, useEffect } from 'react';
import { Lead, LeadAppointment, LeadAppointmentCurrentStatus, Centre } from '@client/services/service-proxies';
import { Table, Select, Button, notification } from 'antd';
import { getLeadCustomerName, getErrorMessage, calculateLefttime } from '@client/core';
import moment from 'moment';
import { config } from '@client/config';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { get } from 'lodash';
import { CreateAppointmentModal } from '../CreateAppointmentModal';

interface Props {
  leadInfo: Lead;
  changeInput: (payload: any, callback?: () => void) => void;
}

export const LeadAppointments = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [addAppointmentModalVisible, setAddAppointmentModalVisible] = useState<boolean>(false);

  useEffect(() => {
    getCentres();
  }, []);

  const getCentres = async () => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);

    const allCentres = await serviceProxy.getAllCentres();
    setCentres(allCentres.data);
  };

  const changeAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      setLoading(true);
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      await serviceProxy.updateLeadAppointmentStatus(props.leadInfo._id, appointmentId, {
        currentStatus: newStatus,
      });
      props.changeInput({
        appointments: get(props, ['leadInfo', 'appointments'], []).map((item: any) => {
          return item._id === appointmentId ? {...item, currentStatus: newStatus} : item;
        }),
      });
      notification.success({
        message: 'Update successfully',
        placement: 'bottomRight',
      });
    } catch (error) {
      notification.error({
        message: 'Update lead appointment status failed',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderAppointmentStatus = (appointment: LeadAppointment) => {
    switch (appointment.currentStatus) {
      case LeadAppointmentCurrentStatus.WAITING:
        const appointmentTime = moment(appointment.time).valueOf();
        const now = moment().valueOf();
        if (now >= appointmentTime) {
          return 'Overdue';
        }
        return 'Waiting';
      case LeadAppointmentCurrentStatus.FAILED:
        return 'Failed test';
      case LeadAppointmentCurrentStatus.CANCEL:
        return 'Cancelled';
      case LeadAppointmentCurrentStatus.PASS:
        return 'Passed test';
      default:
        return '';
    }
  };

  const appointmentColumns = [{
    title: 'Candidates',
    key: 'candidates',
    dataIndex: 'candidates',
    render: (_text: any, _record: any) => getLeadCustomerName(props.leadInfo),
  }, {
    title: 'Title',
    key: 'title',
    dataIndex: 'title',
  }, {
    title: 'Appointment time',
    key: 'time',
    dataIndex: 'time',
    render: (_text: any, record: LeadAppointment) => moment(record.time).format(config.stringFormat.dateTime),
    sorter: (a: LeadAppointment, b: LeadAppointment) => moment(a.time).valueOf() - moment(b.time).valueOf(),
  }, {
    title: 'Status',
    key: 'status',
    dataIndex: 'status',
    render: (_text: any, record: LeadAppointment) => renderAppointmentStatus(record),
    sorter: (a: LeadAppointment, b: LeadAppointment) => {
      if (a.currentStatus > b.currentStatus) {
        return 1;
      } else if (a.currentStatus < b.currentStatus) {
        return -1;
      }
      return 0;
    },
  }, {
    title: 'Left time',
    key: 'leftTime',
    dataIndex: 'leftTime',
    render: (_text: any, record: LeadAppointment) => calculateLefttime(record.time),
    sorter: (a: LeadAppointment, b: LeadAppointment) => {
      const appointmentA = moment(a.time).valueOf();
      const appointmentB = moment(b.time).valueOf();
      return appointmentA - appointmentB;
    },
  }, {
    title: 'Actions',
    key: 'actions',
    dataIndex: 'actions',
    render: (_text: any, record: LeadAppointment) => {
      const enabled = [LeadAppointmentCurrentStatus.PASS, LeadAppointmentCurrentStatus.WAITING].indexOf(record.currentStatus) > -1;
      return (
        <Select
          value={record.currentStatus}
          style={{ width: 120 }}
          onChange={(value: string) => changeAppointmentStatus(record._id, value)}
          disabled={!enabled}
        >
          <Select.Option value={LeadAppointmentCurrentStatus.PASS}>Passed</Select.Option>
          <Select.Option value={LeadAppointmentCurrentStatus.FAILED}>Failed</Select.Option>
          <Select.Option value={LeadAppointmentCurrentStatus.CANCEL}>Cancelled</Select.Option>
          <Select.Option value={LeadAppointmentCurrentStatus.WAITING}>Waiting</Select.Option>
        </Select>
      );
    },
  }];

  return (
    <>
      <div style={{marginBottom: '24px'}}>
        <Button type='primary' onClick={() => setAddAppointmentModalVisible(true)}>+ Add appointment</Button>
      </div>

      <Table
        bordered={true}
        columns={appointmentColumns}
        dataSource={props.leadInfo.appointments}
        loading={loading}
        pagination={false}
        scroll={{ x: 700, y: 450 }}
        style={{ marginBottom: '24px' }}
        rowKey={(record: any) => record._id}
      />

      <CreateAppointmentModal
        leadInfo={props.leadInfo}
        centres={centres}
        visible={addAppointmentModalVisible}
        closeModal={() => setAddAppointmentModalVisible(false)}
        changeInput={props.changeInput}
      />
    </>
  );
};
