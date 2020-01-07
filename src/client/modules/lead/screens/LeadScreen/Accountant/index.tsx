import React from 'react';
import { BorderWrapper } from '@client/components';
import { Tabs, Row, Col } from 'antd';
import {
  L5DataTable,
} from './LeadDataTable';
import { AuthUser, withRematch, initStore } from '@client/store';

interface State {
  tabKey?: string;
}

interface Props {
  authUser: AuthUser;
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
          <Tabs defaultActiveKey='L5'>
            <TabPane tab='ALL' key='ALL' disabled />
            <TabPane tab='L1' key='L1' disabled />
            <TabPane tab='L2' key='L2' disabled />
            <TabPane tab='L3' key='L3' disabled />
            <TabPane tab='L4' key='L4' disabled />
            <TabPane tab='L5' key='L5'>
              <L5DataTable
                authUser={this.props.authUser}
              />
            </TabPane>
            <TabPane tab='L0' key='L0' disabled />
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
