import React from 'react';
import './DefaultTask.less';
import { Authorize, BorderWrapper } from '@client/components';
import { message, Row, Col, Button } from 'antd';
import { Main } from './Main';
import { PERMISSIONS } from '@common/permissions';
import { DefaultTaskModal } from './DefaultTaskModal';
import { DefaultTask } from '@client/services/service-proxies';
import firebase from 'firebase/app';
import { getServiceProxy } from '@client/services';
import { translate } from '@client/i18n';

interface State {
  search: string;
  data: DefaultTask[];
  before: any;
  after: any;
  sortBy: string;
  pageSize: number;
  loading: {
    table: boolean;
    modal: boolean;
  };
  modal: {
    create?: any;
    update?: DefaultTask;
  };
}

interface Props {
}

export const DefaultTaskScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    search: '',
    data: [],
    before: undefined,
    after: undefined,
    sortBy: 'createdAt|desc',
    pageSize: 10,
    loading: {
      table: false,
      modal: false,
    },
    modal: {
      create: false,
    },
  };

  async componentDidMount() {
    this.handleSearch({});
  }
  handleSearch = async (params: any) => {
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const result = await serviceProxy.findDefaultTasks(
        params.search || '',
        undefined,
        this.state.pageSize,
        this.state.sortBy,
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
  }
  openTaskModal = (task?: any) => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: task ? undefined : {},
        update: task ? task : undefined,
      },
    });
  }
  closeUserModal = () => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: undefined,
        update: undefined,
      },
    });
  }
  handleSubmit = async (values: any, formikBag: any) => {
    this.setState({
      loading: {
        ...this.state.loading,
        modal: true,
      },
    });
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      let result: any;
      if (this.state.modal.create) {
        result = await serviceProxy.createDefaultTask({
          ...values,
        });
      } else {
        const newInfo = {
          ...this.state.modal.update,
          ...values,
        };
        await serviceProxy.updateDefaultTask(this.state.modal.update!._id, {
          operation: 'updateDetail',
          payload: newInfo,
        });
      }

      message.success(this.state.modal.create ? translate('lang:createSuccess') : translate('lang:updateSuccess'));
      this.setState({
        data: this.state.modal.create ? [
          {
            ...result,
            ...values,
            createdAt: new Date().getTime(),
          },
          ...this.state.data,
        ] : this.state.data.map((item) => {
          if (item._id === this.state.modal.update!._id) {
            return {
              ...this.state.modal.update,
              ...values,
            };
          } else {
            return item;
          }
        }),
        loading: {
          ...this.state.loading,
          modal: false,
        },
        modal: {
          ...this.state.modal,
          create: undefined,
          update: undefined,
        },
      });
      formikBag.resetForm({});
    } catch (error) {
      message.error(JSON.parse(error.response).message);
      this.setState({
        loading: {
          ...this.state.loading,
          modal: false,
        },
      });
    }
  }

  render() {
    return (
      <div>
        <Row>
          <Col xs={12}><h2 style={{ marginBottom: 24 }}>{translate('lang:allTasks')}</h2></Col>
          <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {/*<Button type='primary' onClick={() => Router.push('/add-centre')}>Add centre</Button>*/}
            <Button type='primary' onClick={() => this.openTaskModal()}>Add task</Button>
          </Col>
        </Row>
        {(this.state.modal.create || this.state.modal.update) && (
          <DefaultTaskModal
            title={this.state.modal.update ? translate('lang:updateTask') : translate('lang:createTask')}
            visible={Boolean(this.state.modal.update) || Boolean(this.state.modal.create)}
            handleSubmit={this.handleSubmit}
            closeModal={this.closeUserModal}
            initialValue={this.state.modal.update ? {
              ...this.state.modal.update,
            } : this.state.modal.create}
            loading={this.state.loading.modal}
          />
        )}
        <BorderWrapper>
          <Main
            data={this.state.data}
            openModal={this.openTaskModal}
            handleSearch={this.handleSearch}
            loading={this.state.loading.table}>
          </Main>
        </BorderWrapper>
      </div>
    );
  }
}, [PERMISSIONS.DEFAULT_TASKS.VIEW], true, 'admin');
