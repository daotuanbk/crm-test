import React, { useState } from 'react';
import { BorderWrapper } from '@client/components';
import { Row, Col, Input, notification, Typography } from 'antd';
import { translate } from '@client/i18n';
import { Lead } from '@client/services/service-proxies';
import moment from 'moment';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { get } from 'lodash';
import { getErrorMessage } from '@client/core';

interface Props {
  leadInfo: Lead;
  changeInput: (payload: any, callback?: () => void) => void;
}

export const LeadNotes = (props: Props) => {
  const [newNote, setNewNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const createNewNote = async () => {
    if (newNote) {
      try {
        setLoading(true);
        const idToken = await firebase.auth().currentUser!.getIdToken();
        const serviceProxy = getServiceProxy(idToken);

        const newLeadNote = await serviceProxy.addLeadNote(props.leadInfo._id, {
          content: newNote,
        });

        props.changeInput({
          notes: [...get(props, 'leadInfo.notes', []), newLeadNote],
        });
        setNewNote('');
        notification.success({
          message: 'Create note success',
          placement: 'bottomRight',
        });
      } catch (error) {
        notification.error({
          message: 'Create note failed',
          description: getErrorMessage(error),
          placement: 'bottomRight',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <Row>
        <Col xs={24}>
          <Typography.Title level={4}>Notes</Typography.Title>
        </Col>
        <Col xs={24}>
          {get(props, 'leadInfo.notes', []).map((val: any, index: number) => {
            return (
              <div key={index} style={{margin: '12px 0px'}}>
                <div style={{fontWeight: 'bold'}}>{val.content}</div>
                <div>{moment(val.createdAt).format('HH:mm, DD/MM/YYYY')} | {val.createdBy.fullName}</div>
              </div>
            );
          })}
          <div style={{marginTop: '24px'}}>
            <Input.Search
              placeholder={translate('lang:enterNewNote')}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onPressEnter={createNewNote}
              onSearch={createNewNote}
              enterButton='Create'
              loading={loading}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};
