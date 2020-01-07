import React from 'react';
import { BorderWrapper } from '@client/components';
import { Tabs, Row, Col } from 'antd';

import {
  LAllDataTable,
  L3DataTable,
  L0DataTable,
  L1DataTable,
  L2DataTable,
  L4DataTable,
  L5DataTable,
} from './LeadDataTable';
import { AuthUser, withRematch, initStore } from '@client/store';

interface State {
  tabKey?: string;
}

interface Props {
  authUser: AuthUser;
  id?: string;
}

const TabPane = Tabs.TabPane;
const Screen = class extends React.Component<Props, State> {
  main: any;

  constructor(props: Props) {
    super(props);
    this.main = React.createRef();
  }

  state: State = {
    tabKey: 'all',
  };

  render() {
    return (
      <div>
        <Row>
          <Col xs={12} sm={16} >
            <h2 style={{ marginBottom: 24 }}>All Leads</h2>
          </Col>
        </Row>
        <BorderWrapper>
          <Tabs defaultActiveKey='ALL'>
            <TabPane tab='ALL' key='ALL'>
              <LAllDataTable
                authUser={this.props.authUser}
                id={this.props.id}
              />
            </TabPane>
            <TabPane tab='L1' key='L1'>
              <L1DataTable
                authUser={this.props.authUser}
                id={this.props.id}
              />
            </TabPane>
            <TabPane tab='L2' key='L2'>
              <L2DataTable
                authUser={this.props.authUser}
                id={this.props.id}
              />
            </TabPane>
            <TabPane tab='L3' key='L3'>
              <L3DataTable
                authUser={this.props.authUser}
                id={this.props.id}

              />
            </TabPane>
            <TabPane tab='L4' key='L4'>
              <L4DataTable
                authUser={this.props.authUser}
                id={this.props.id}
              />
            </TabPane>
            <TabPane tab='L5' key='L5'>
              <L5DataTable
                authUser={this.props.authUser}
                id={this.props.id}
              />
            </TabPane>
            <TabPane tab='L0' key='L0'>
              <L0DataTable
                authUser={this.props.authUser}
                id={this.props.id}
              />
            </TabPane>
          </Tabs>
        </BorderWrapper>
      </div>
    );
  }
};

const mapState = (rootState: any) => {
  return {
    authUser: rootState.profileModel.authUser,
  };
};

const mapDispatch = (_rootReducer: any) => {
  return {};
};

const LeadScreen = withRematch(initStore, mapState, mapDispatch)(Screen);

export {
  LeadScreen,
};
