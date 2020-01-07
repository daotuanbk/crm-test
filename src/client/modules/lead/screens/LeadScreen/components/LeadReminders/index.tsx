import React, { useState } from 'react';
import { Lead, LeadReminder, LeadReminderStatus } from '@client/services/service-proxies';
import { Table, Select, Button, notification } from 'antd';
import moment from 'moment';
import { config } from '@client/config';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { get } from 'lodash';
import { CreateReminderModal } from '../CreateReminderModal';
import { getErrorMessage, calculateLefttime } from '@client/core';

interface Props {
  leadInfo: Lead;
  changeInput: (payload: any, callback?: () => void) => void;
}

export const LeadReminders = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [addReminderModalVisible, setAddReminderModalVisible] = useState<boolean>(false);

  const changeReminderStatus = async (reminderId: string, newStatus: string) => {
    try {
      setLoading(true);
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      await serviceProxy.updateLeadReminder(props.leadInfo._id, reminderId, {
        status: newStatus,
      });
      props.changeInput({
        reminders: get(props, ['leadInfo', 'reminders'], []).map((item: any) => {
          return item._id === reminderId ? {...item, status: newStatus} : item;
        }),
      });
      notification.success({
        message: 'Update reminder success',
        placement: 'bottomRight',
      });
    } catch (error) {
      notification.error({
        message: 'Update reminder failed',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const reminderColumns = [{
    title: 'Created date',
    key: 'createdAt',
    dataIndex: 'createdAt',
    render: (_text: any, record: LeadReminder) => moment(record.createdAt).format(config.stringFormat.dateTime),
    sorter: (a: LeadReminder, b: LeadReminder) => moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf(),
  }, {
    title: 'Reminder time',
    key: 'dueAt',
    dataIndex: 'createdAt',
    render: (_text: any, record: LeadReminder) => moment(record.dueAt).format(config.stringFormat.dateTime),
    sorter: (a: LeadReminder, b: LeadReminder) => moment(a.dueAt).valueOf() - moment(b.dueAt).valueOf(),
  }, {
    title: 'Status',
    key: 'status',
    dataIndex: 'status',
    sorter: (a: LeadReminder, b: LeadReminder) => {
      if (a.status > b.status) {
        return 1;
      } else if (a.status < b.status) {
        return -1;
      }
      return 0;
    },
  }, {
    title: 'Left time',
    key: 'leftTime',
    dataIndex: 'leftTime',
    render: (_text: any, record: LeadReminder) => calculateLefttime(record.dueAt),
    sorter: (a: LeadReminder, b: LeadReminder) => {
      const reminderA = moment(a.dueAt).valueOf();
      const reminderB = moment(b.dueAt).valueOf();
      return reminderA - reminderB;
    },
  }, {
    title: 'Actions',
    key: 'actions',
    dataIndex: 'actions',
    render: (_text: any, record: LeadReminder) => {
      const enabled = [LeadReminderStatus.Active].indexOf(record.status) > -1;
      return (
        <Select
          value={record.status}
          style={{ width: 120 }}
          onChange={(value: string) => changeReminderStatus(record._id, value)}
          disabled={!enabled}
        >
          <Select.Option value={LeadReminderStatus.Active}>Active</Select.Option>
          <Select.Option value={LeadReminderStatus.Completed}>Completed</Select.Option>
          <Select.Option value={LeadReminderStatus.Canceled}>Cancelled</Select.Option>
        </Select>
      );
    },
  }];

  return (
    <>
      <div style={{marginBottom: '24px'}}>
        <Button type='primary' onClick={() => setAddReminderModalVisible(true)}>+ Add reminder</Button>
      </div>

      <Table
        bordered={true}
        columns={reminderColumns}
        dataSource={props.leadInfo.reminders}
        loading={loading}
        pagination={false}
        scroll={{ x: 700, y: 500 }}
        style={{ marginBottom: '24px' }}
        rowKey={(record: any) => record._id}
      />

      <CreateReminderModal
        leadInfo={props.leadInfo}
        visible={addReminderModalVisible}
        closeModal={() => setAddReminderModalVisible(false)}
        changeInput={props.changeInput}
      />
    </>
  );
};
