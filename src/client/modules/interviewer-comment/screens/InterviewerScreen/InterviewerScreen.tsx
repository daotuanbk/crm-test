import React from 'react';
import './InterviewerScreen.less';
import { Authorize, BorderWrapper, Pagination } from '@client/components';
import { message } from 'antd';
import { Main } from './Main';
import { PERMISSIONS } from '@common/permissions';
import { Lead } from '@client/services/service-proxies';
import firebase from 'firebase/app';
import { getServiceProxy } from '@client/services';
import { translate } from '@client/i18n';

interface State {
  search: string;
  data: Lead[];
  before: any;
  after: any;
  sortBy: string;
  pageSize: number;
  loading: {
    table: boolean;
    modal: boolean;
  };
}

interface Props {
  //
}

export const InterviewerScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    search: '',
    data: [],
    before: undefined,
    after: undefined,
    sortBy: 'createdAt|des',
    pageSize: 10,
    loading: {
      table: false,
      modal: false,
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
      // TODO: get stages by api and fill value to $in
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const result = await serviceProxy.findLeads(
        'getArrangedRecords',
        undefined,
        undefined,
        1,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ) as any;
      this.setState({
        search: params.search || '',
        data: result.data,
        before: result.before,
        sortBy: params.sortBy || this.state.sortBy,
        after: result.after,
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

  updateCourse = async (leadId: string, productOrderId: string, index: string, payload: any) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      this.setState({
        data: this.state.data.map((item: any) => {
          if (item._id === leadId) {
            item.productOrder.courses = item.productOrder.courses.map((course: any) => {
              if (course.index === index) {
                return { ...course, ...payload };
              }
              return course;
            });
          }
          return item;
        }),
      });
      await serviceProxy.updateLeadProductOrder(productOrderId, {
        operation: 'updateCourses',
        payload: {
          index,
          ...payload,
        },
      });
    } catch (e) {
      message.error(e.response);
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
      const result = await serviceProxy.findLeads(
        undefined,
        this.state.search,
        [{
          'productOrder.courses.stage': `productOrder.courses.stage|Arranged`,
        }],
        this.state.pageSize,
        undefined,
        this.state.sortBy,
        next ? undefined : this.state.before,
        next ? this.state.after : undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      this.setState({
        data: result.data,
        before: result.before,
        after: result.after,
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
  render() {
    return (
      <div >
        <h2 style={{ marginBottom: 24 }}>{translate('lang:allLeadsWithArrangedCourse')}</h2>
        <BorderWrapper>
          <Main
            updateCourse={this.updateCourse}
            data={this.state.data}
            loading={this.state.loading.table}
            handleSearch={this.handleSearch}
          />
          {this.state.after || this.state.before
            ? <Pagination before={this.state.before} after={this.state.after} loadPreviousPage={() => { this.loadOtherPage(false); }}
              loadNextPage={() => { this.loadOtherPage(true); }} /> : null}
        </BorderWrapper>
      </div>
    );
  }
}, [PERMISSIONS.ROLES.INTERVIEWER], true, 'admin');
