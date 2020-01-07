import React, { useState } from 'react';
import _ from 'lodash';
import { AuthUser } from '@client/store';
import { Button, notification } from 'antd';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { UpdateLeadOwnerPayloadOperation, Customer, Lead } from '@client/services/service-proxies';

interface Props {
  errorMessage: string;
  authUser: AuthUser;
  existedActiveLead: Lead;
  getExistedActiveLead?: () => Promise<void>;
  onChange: (values: (Customer|Lead)) => void;
  setValues: (values: (Customer|Lead)) => void;
}

export const UnassignLeadErrorMessage = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);

  const { errorMessage, existedActiveLead, authUser, setValues, onChange, getExistedActiveLead } = props;

  const copyUnassignedLead = async () => {
    try {
      setLoading(true);

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const response = await serviceProxy.updateLead(_.get(existedActiveLead, '_id'), {
        operation: UpdateLeadOwnerPayloadOperation.UpdateOwner,
        payload: {
          ids: [_.get(existedActiveLead, '_id')],
          newOwnerId: _.get(authUser, 'id'),
        },
      });

      const result = _.get(response, 'data.0');
      if (!result || !result.status) {
        throw new Error('Server did not provide valid response');
      } else if (result.status !== 'Succeeded') {
        throw new Error('Change owner failed');
      }

      if (getExistedActiveLead) {
        await getExistedActiveLead();
      }

      setValues({
        ..._.get(existedActiveLead, 'customer._id', {}),
        channel: _.get(existedActiveLead, 'channel'),
        source: _.get(existedActiveLead, 'source'),
        campaign: _.get(existedActiveLead, 'campaign'),
        medium: _.get(existedActiveLead, 'medium'),
        content: _.get(existedActiveLead, 'content'),
      });
      onChange(existedActiveLead);
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.message,
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  // If lead not belong to any centre / lead centre === salesman centre
  const allowSelfAssigned = !_.get(existedActiveLead, 'centre._id') || _.get(authUser, 'centreId', '1') === _.get(existedActiveLead, 'centre._id', '2');

  return (
    <div>
      {errorMessage}
      <div style={{color: 'rgba(0, 0, 0, 0.65)'}}>
        <div>
          Lead status: <b>{_.get(existedActiveLead, 'v2Status')}</b>
        </div>
        <div>
          Lead owner: <b>Un-assigned</b>
        </div>
      </div>
      {allowSelfAssigned ? (
        <>
          <div style={{color: 'rgba(0, 0, 0, 0.65)'}}>
            <i>An active lead linked with this contact already exists and is un-assigned</i>
          </div>
          <div style={{margin: '8px 0px', textAlign: 'right'}}>
            <Button
              type='primary'
              loading={loading}
              onClick={copyUnassignedLead}
            >
              Copy
            </Button>
          </div>
        </>
      ) : (
        <>
          <div style={{color: 'rgba(0, 0, 0, 0.65)'}}>
            <i>An active lead linked with this contact already exists and is in different centre</i>
          </div>
        </>
      )}
    </div>
  );
};
