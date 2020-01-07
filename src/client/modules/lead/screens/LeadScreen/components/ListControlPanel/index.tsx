import React from 'react';
import { Button } from 'antd';
import { translate } from '@client/i18n';
import { Lead } from '@client/services/service-proxies';

interface Props {
  userId: string;
  hideImport?: boolean;
  onAddLeadClick: (lead?: Lead) => void;
  onImportLeadClick: () => void;
}

const ListControlPanel = (props: Props) => {
  const { hideImport } = props;
  return (
    <React.Fragment>
      {
        !hideImport && (
          <Button
            className='export-btn'
            type='primary'
            icon='upload'
            onClick={() => props.onImportLeadClick()}
          >
            {translate('lang:import')}
          </Button>
        )
      }
      <Button
        type='primary'
        icon='plus'
        onClick={() => props.onAddLeadClick()}
      >
        {translate('lang:addLead')}
      </Button>
  </React.Fragment>
  );
};

export default ListControlPanel;
