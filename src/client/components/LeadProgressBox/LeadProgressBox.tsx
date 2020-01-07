import React from 'react';
import { createUseStyles } from 'react-jss';
import { STAGES, STATUSES } from '@common/stages';
import { getServiceProxy } from '@client/services';
import { getErrorMessage, checkAllowedUpdateStatus } from '@client/core';
import firebase from 'firebase';
import { Select, notification } from 'antd';
import _ from 'lodash';

interface Props {
  _id: string;
  status?: string;
  onChange: (update: { v2Status: string }) => void;
}

const useStyles = createUseStyles({
  stageContainer: {
    display: 'flex',
    width: '100%',
  },
  stageBox: {
    width: `${ 1 / STAGES.length * 100}%`,
    padding: '0.3rem',
    '&.L1': {
      backgroundColor: '#e0e0e0',
      '&:hover, &.active': {
        color: '#ffffff',
        backgroundColor: '#4b2c20',
      },
    },
    '&.L2': {
      backgroundColor: '#e0e0e0',
      '&:hover, &.active': {
        color: '#ffffff',
        backgroundColor: '#004ba0',
      },
    },
    '&.L3': {
      backgroundColor: '#e0e0e0',
      '&:hover, &.active': {
        color: '#ffffff',
        backgroundColor: '#c25e00',
      },
    },
    '&.L4': {
      backgroundColor: '#e0e0e0',
      '&:hover, &.active': {
        color: '#ffffff',
        backgroundColor: '#ba000d',
      },
    },
    '&.L5': {
      backgroundColor: '#e0e0e0',
      '&:hover, &.active': {
        color: '#ffffff',
        backgroundColor: '#00600f',
      },
    },
    '&.L0': {
      backgroundColor: '#e0e0e0',
      '&:hover, &.active': {
        color: '#ffffff',
        backgroundColor: '#000000',
      },
    },
  },
  statusSelect: {
    cursor: 'pointer',
    width: '100%',
    outline: 'none',
    color: '#ffffff',
    '& .ant-select-selection, & .ant-select-selection:focus': {
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
    },
    '& .ant-select-arrow': {
      color: '#ffffff',
    },
  },
});

const proxyChangeStatus = async (id: string, statusName: string, done: () => void) => {
  const idToken = await firebase.auth().currentUser!.getIdToken();
  const serviceProxy = getServiceProxy(idToken);
  try {
    await serviceProxy.updateLead(id, {
      operation: 'updateStatus',
      payload: {
        statusName,
      },
    });
    done();
  } catch (error) {
    notification.error({
      message: 'Change status failed',
      description: getErrorMessage(error),
      placement: 'bottomRight',
    });
  }
};

interface LeadStageBoxProps {
  _id: string;
  currentStatusShortName: string;
  stageShortName: string;
  onChange: (update: { v2Status: string }) => void;
}

const LeadStageBox = (props: LeadStageBoxProps) => {
  const {
    currentStatusShortName,
    stageShortName,
    onChange,
    _id,
  } = props;

  const classes = useStyles();
  const currentStage = _(STATUSES).mapKeys('shortName').get(`${currentStatusShortName}.stage`);
  const active = currentStage.shortName ===  stageShortName;
  const activeClassName = active ? 'active' : '';
  const callProxyAndOnChange = async (newStatusName: string) => {
    await proxyChangeStatus(_id, newStatusName, () => {
      onChange({ v2Status: newStatusName });
      notification.success({
        message: 'Change status successed',
        placement: 'bottomRight',
      });
    });
  };

  return (
    <div
      className={`
        ${classes.stageBox}
        ${stageShortName}
        ${activeClassName}
      `}
    >
      <div>{stageShortName}</div>
      <Select
        className={classes.statusSelect}
        dropdownMatchSelectWidth={false}
        value={active ? currentStatusShortName : ''}
        onChange={callProxyAndOnChange}
      >
        {
          _.mapKeys(STAGES, 'shortName')[stageShortName].statuses.map((status: any) => (
            <Select.Option
              value={status.shortName}
              disabled={!checkAllowedUpdateStatus(currentStatusShortName, status.shortName)}
            >
              {status.name}
            </Select.Option>
          ))
        }
      </Select>
    </div>
  );
};

export const LeadProgressBox = (props: Props) => {
  const {
    status,
    _id,
    onChange,
  } = props;
  const classes = useStyles();
  const currentStatusShortName = status || 'L1A';
  return (
    <div className={classes.stageContainer}>
      {
        STAGES.map((stage: any) => {
          return (
            <LeadStageBox
              _id={_id}
              stageShortName={stage.shortName}
              currentStatusShortName={currentStatusShortName}
              onChange={onChange}
            />
          );
        })
      }
    </div>
  );
};
