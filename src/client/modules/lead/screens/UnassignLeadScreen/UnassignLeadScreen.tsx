import React from 'react';
import './UnassignLeadScreen.less';
import { Authorize, Import, Export, BorderWrapper } from '@client/components';
import { Tabs, message, Row, Col, Button } from 'antd';
import { Main } from './Main';
import Router from 'next/router';
import { PERMISSIONS } from '@common/permissions';

const TabPane = Tabs.TabPane;

interface State {
  //
}
interface Props { }
export const UnassignLeadScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    //
  };

  render() {
    return (
      <div>
        <Row>
          <Col span={12}>
            <h2 style={{ marginBottom: 24 }}>Unassigned leads</h2>
          </Col>
          <Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Import import={() => message.success('Import')}></Import>
            <Export export={() => message.success('Export')}></Export>
            <Button type='primary' icon='plus' onClick={() => Router.push('/add-lead')}>Add lead</Button>
          </Col>
        </Row>
        <BorderWrapper>
          <Tabs defaultActiveKey='all'>
            <TabPane tab='All' key='all'>
              <Main></Main>
            </TabPane>
          </Tabs>
        </BorderWrapper>
      </div>
    );
  }
}, [PERMISSIONS.LEADS.VIEW_UNASSIGNED_SCREEN], true, 'admin');
