import React from 'react';
import { Button } from 'antd';

interface Props {
  enabled: boolean;
  noAssign?: boolean;
  noBulkEmail?: boolean;
  onAction: (action: ActionType) => void;
}

export type ActionType = 'Reassign' | 'BulkEmail' | 'BulkSMS';

export const LeadBulkActionPanel = (props: Props) => {
  const { enabled, onAction, noAssign, noBulkEmail } = props;
  return (
    <div style={{ marginBottom: '16px', backgroundColor: '#fff' }}>
        { !noAssign && (
            <span style={{ marginRight: '10px' }}>
              <Button
                disabled={!enabled}
                type='primary'
                onClick={() => onAction('Reassign')}
              >
                Re-assign to
              </Button>
            </span>
          )
        }
      <span style={{ marginRight: '10px' }}>
        {
          !noBulkEmail && (
            <Button
              disabled={!enabled}
              type='primary'
              onClick={() => onAction('BulkEmail')}
            >
              Bulk Email
            </Button>
          )
        }
      </span>
      <span style={{ marginRight: '10px' }}>
        <Button
          disabled={!enabled}
          type='primary'
          onClick={() => onAction('BulkSMS')}
        >
          Bulk SMS
        </Button>
      </span>
    </div>
  );
};
