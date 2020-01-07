import React, { useState } from 'react';
import { Drawer, Upload, Spin, Icon, Typography, notification, Table, Button } from 'antd';
import { config } from '@client/config';
import { UploadFile } from 'antd/lib/upload/interface';
import firebase from 'firebase';
import _ from 'lodash';

interface ImportLeadsResult {
  totalRow: number;
  success: number;
  errors: {row: number; message: string}[];
}

interface Props {
  visible: boolean;
  closeImportLeadDetailDrawer: () => void;
  loadLeadData: () => Promise<void>;
}

export const ImportLeadsDrawer = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [importLeadsResult, setImportLeadsResult] = useState<ImportLeadsResult|undefined>(undefined);

  if (loading) {
    window.onbeforeunload = () => {
      return 'All changes will not be saved, are you sure want to exit?';
    };
  } else {
    window.onbeforeunload = () => null;
    notification.close('1');
  }

  const handleDrawerClose = () => {
    if (!loading) {
      props.closeImportLeadDetailDrawer();
    }
  };

  const beforeUploadExcelFile = async (file: UploadFile) => {
    if (!config.upload.allowExcelExt.test(file.name)) {
      notification.error({
        message: 'Invalid file type',
        description: 'Only excel files are allowed',
        placement: 'bottomRight',
      });
    } else {
      try {
        setLoading(true);

        const excelFormData = new FormData();
        excelFormData.append('leads', file as any);

        const idToken = await firebase.auth().currentUser!.getIdToken();
        const response = await fetch(`${config.url.api}/leads/import-leads`, {
          method: 'POST',
          headers: {
            authorization: idToken,
          },
          body: excelFormData,
        });
        const uploadExcelFileResult = await response.json();
        setImportLeadsResult(uploadExcelFileResult);
        props.loadLeadData();
      } catch (error) {
        notification.error({
          message: 'Error',
          description: error.message,
          placement: 'bottomRight',
        });
      } finally {
        setLoading(false);
      }
    }

    return false;
  };

  const errorColumns = [{
    title: 'Error message',
    dataIndex: 'message',
    key: 'message',
  },
  {
    title: 'Row',
    dataIndex: 'row',
    key: 'row',
  }];

  return (
    <Drawer
      placement='right'
      closable={false}
      width={1000}
      onClose={handleDrawerClose}
      visible={props.visible}
      keyboard={false}
    >
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <Typography.Title level={2}>Import Leads</Typography.Title>
        <div>
          <a href={`${config.url.api}/leads/excel-template`} target='_blank'>
            <Button type='primary' icon='download'>Download excel template</Button>
          </a>
        </div>
      </div>

      <Upload.Dragger beforeUpload={beforeUploadExcelFile as any} showUploadList={false}>
        <Spin spinning={loading}>
          <p className='ant-upload-drag-icon'>
            <Icon type='inbox' />
          </p>
          <p className='ant-upload-text'>
            Click or drag file to this area to upload
          </p>
        </Spin>
      </Upload.Dragger>

      {importLeadsResult && !loading ? (
        <div style={{marginTop: '24px'}}>
          <Typography.Title level={3}>Result</Typography.Title>

          <div>
            <div>Total rows: <b>{_.get(importLeadsResult, 'totalRow', 0)}</b></div>
            <div>Success: <b>{_.get(importLeadsResult, 'success', 0)}</b></div>
            <div>Failed: <b>{_.get(importLeadsResult, 'totalRow', 0) - _.get(importLeadsResult, 'success', 0)}</b></div>
          </div>

          {_.get(importLeadsResult, 'errors.length') && (
            <Table
              columns={errorColumns}
              dataSource={_.get(importLeadsResult, 'errors', [])}
              pagination={false}
              scroll={{x: 1000}}
              style={{marginBottom: '24px'}}
              rowKey={(record: any) => record._id}
            />
          )}
        </div>
      ) : null}
    </Drawer>
  );
};
