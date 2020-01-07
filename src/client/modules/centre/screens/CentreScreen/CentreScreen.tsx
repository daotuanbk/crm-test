import React from 'react';
import './CentreScreen.less';
import { Authorize, BorderWrapper, Pagination } from '@client/components';
import { message, Row, Col, Button } from 'antd';
import { Main } from './Main';
import { PERMISSIONS } from '@common/permissions';
import { Centre } from '@client/services/service-proxies';
import firebase from 'firebase/app';
import { getServiceProxy } from '@client/services';
import { translate } from '@client/i18n';

interface State {
  search: string;
  data: Centre[];
  before: any;
  after: any;
  sortBy: string;
  pageSize: number;
  loading: {
    table: boolean;
  };
}

interface Props {
}

export const CentreScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    search: '',
    data: [],
    before: undefined,
    after: undefined,
    sortBy: 'order|asc',
    pageSize: 10,
    loading: {
      table: false,
    },
  };

  async componentDidMount() {
    this.handleSearch({ search: '' });
  }
  handleSearch = async (params: any) => {
    if (this.state.loading.table) return;
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const result = await serviceProxy.getCentres(false);
      this.setState({
        search: params.search || '',
        data: result.data,
        before: '',
        sortBy: params.sortBy || this.state.sortBy,
        after: '',
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    } catch (error) {
      message.error(error.response);
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  };

  loadOtherPage = async (next?: boolean) => {
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const result = await serviceProxy.getCentres(false);
      this.setState({
        data: result.data,
        before: '',
        after: '',
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    } catch (error) {
      message.error(error.response);
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  };

  synchronize = async () => {
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      await serviceProxy.synchronizeCentre();
      window.location.reload();
    } catch (error) {
      message.error(error.message || 'Internal server error.');
    }
  };

  render() {
    return (
      <div>
        <Row>
          <Col xs={12}>
            <h2 style={{ marginBottom: 24 }}>{translate('lang:allCentresManagement')}</h2>
          </Col>
          <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type='primary' onClick={this.synchronize}>{translate('lang:synchronizeCentre')}</Button>
          </Col>
        </Row>
        <BorderWrapper>
          <Main
            data={this.state.data}
            loading={this.state.loading.table}
            handleSearch={this.handleSearch}
          ></Main>
          {this.state.before || this.state.after
            ? <Pagination before={this.state.before} after={this.state.after} loadPreviousPage={() => { this.loadOtherPage(false); }}
              loadNextPage={() => { this.loadOtherPage(true); }} /> : null}
        </BorderWrapper>
      </div>
    );
  }
}, [PERMISSIONS.CENTRES.VIEW], true, 'admin');
