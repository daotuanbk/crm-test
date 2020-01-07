import React from 'react';
import { Popover, Select, notification } from 'antd';
import { STAGES } from '@common/stages';
import { getServiceProxy } from '@client/services';
import { translate } from '@client/i18n';
import { checkAllowedUpdateStatus } from '@client/core';
import firebase from 'firebase';
import _ from 'lodash';

const STATUSES = _(STAGES).map((stage: any) => ({
  ...stage,
  statuses: stage.statuses.map((status: any) => ({ ...status, stageShortName: stage.shortName })),
}))
  .flatMap('statuses')
  .value();

const STATUSES_MAPKEY = _.mapKeys(STATUSES, 'shortName');

interface Lead {
  _id: string;
  currentStatus: string;
  currentStage: string;
  v2Status: string;
}

const StatusPopover = (props: any) => {
  const { record } = props;
  const statusName = _.get(STATUSES_MAPKEY, `${record.v2Status || 'L1A'}.name`) || STATUSES_MAPKEY['L1A'].name;

  return (
    <div>
      <h4>{statusName}</h4>
    </div>
  );
};

const proxyChangeStatus = async (lead: Lead, statusName: string, done: () => void) => {
  const idToken = await firebase.auth().currentUser!.getIdToken();
  const serviceProxy = getServiceProxy(idToken);
  try {
    await serviceProxy.updateLead(lead._id, {
      operation: 'updateStatus',
      payload: {
        statusName,
      },
    });
    done();
  } catch (error) {
    notification.error({
      message: error.message || translate('lang:internalError'),
      placement: 'bottomRight',
    });
  }
};

interface Props {
  onLeadChange: (lead: Lead) => void;
  currentStageWithEdit?: string;
  record: Lead;
}

export const StatusCell = (props: Props) => {
  const { record, onLeadChange } = props;
  const callProxyAndUpdate = async (statusName: any) => {
    await proxyChangeStatus(record, statusName, () => {
      notification.success({
        message: translate('lang:updateSuccess'),
        placement: 'bottomRight',
      });
      onLeadChange({
        ...record,
        currentStatus: statusName,
        v2Status: statusName,
      });
    });
  };
  return (
    <Popover title='' trigger='hover' content={<StatusPopover record={record} />}>
      <Select
        style={{ width: '100%' }}
        dropdownMatchSelectWidth={false}
        value={record.v2Status || 'L1A'}
        onChange={callProxyAndUpdate}
      >
        {
          STATUSES.map((status: any, i: number) => {
            return (
              <Select.Option
                style={{ background: 'transparent' }}
                value={status.shortName}
                key={i.toString()}
                disabled={!checkAllowedUpdateStatus(record.v2Status, status.shortName)}
              >
                {status.name}
              </Select.Option>
            );
          })
        }
      </Select>
    </Popover>
  );
};
