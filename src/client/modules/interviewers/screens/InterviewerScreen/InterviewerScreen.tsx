import React from 'react';
import { Authorize, BorderWrapper } from '@client/components';
import { message, Row, Col, Button } from 'antd';
import { Main } from './Main';
import { PERMISSIONS } from '@common/permissions';
import { CreateInterviewerModal } from './CreateInterviewerModal';
import { User, Centre } from '@client/services/service-proxies';
import firebase from 'firebase/app';
import { getServiceProxy } from '@client/services';
import _ from 'lodash';
import { translate } from '@client/i18n';

interface State {
  search: string;
  interviewers: User[];
  users: User[];
  before: any;
  after: any;
  sortBy: string;
  pageSize: number;
  loading: {
    table: boolean;
    modal: boolean;
  };
  modal: {
    create: boolean;
    add?: boolean;
    edit?: boolean;
  };
  selectedUser: User | any;
  roles: any[];
}

interface Props {
  centres: Centre[];
  interviewers: User[];
  users: User[];
  roles: any[];
}

export const InterviewerScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    search: '',
    interviewers: this.props.interviewers || [],
    users: _.differenceBy(this.props.users, this.props.interviewers, '_id'),
    before: undefined,
    after: undefined,
    sortBy: 'createdAt|des',
    pageSize: 10,
    loading: {
      table: false,
      modal: false,
    },
    modal: {
      create: false,
    },
    selectedUser: null,
    roles: [],
  };

  async componentDidMount() {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const result = await serviceProxy.getAllRoles();
    this.setState({
      roles: result.roles,
    });
  }

  openModal = () => {
    this.setState({
      modal: {
        ...this.state.modal,
        add: true,
      },
    });
  };

  openCreateModal = () => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: true,
      },
    });
  };

  openEditModal = (user: User) => {
    this.setState({
      modal: {
        ...this.state.modal,
        edit: true,
      },
      selectedUser: user,
    });
  };

  closeModal = () => {
    this.setState({
      modal: {
        add: false,
        edit: false,
        create: false,
      },
    });
  };

  changeStatus = async (id: string, isActive: boolean) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      await serviceProxy.updateUser(id, {
        operation: isActive ? translate('lang:activate') : translate('lang:deactivate'),
      });
      this.setState({
        interviewers: this.state.interviewers.map((item: User) => {
          if (item._id === id) item.isActive = isActive;
          return item;
        }),
      });
      message.success(translate('lang:updateSuccess'));
    } catch (error) {
      message.error(JSON.parse(error.response).message);
    }
  };

  // @ts-ignore
  createInterviewer = async (users: string[], formikBag: any) => {
    if (!users.length) {
      this.setState({
        modal: {
          add: false,
          edit: false,
          create: false,
        },
      });
      return;
    }
    const interviewerRole = this.state.roles.find((item: any) => {
      return item.name === 'interviewer';
    });
    if (!interviewerRole) {
      message.error(translate('lang:cannotFindInterviewerRole'));
      return;
    }
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const promises = users.map((id: any) => {
      const user = this.state.users.find((item: User) => item._id === id) as any;
      return serviceProxy.updateUser(id, {
        operation: 'updateDetail',
        payload: {
          ...user,
          roles: [
            ...user.roles,
            interviewerRole._id,
          ],
        },
      });
    });
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    }, async () => {
      const nextState = {
        loading: {
          modal: false,
          table: false,
        },
        modal: {
          add: false,
          edit: false,
          create: false,
        },
      } as any;
      try {
        await Promise.all(promises);
        const interviewers = this.state.users.filter((item: User) => {
          const existed = users.find((id: string) => item._id === id);
          return !!existed;
        }).map((item: User) => {
          return item;
        });
        nextState.users = _.differenceBy(this.state.users, interviewers, '_id');
        nextState.interviewers = this.state.interviewers.concat(interviewers);
        formikBag.resetForm({});
        message.success('Update success');
      } catch (e) {
        delete nextState.modal;
      }
      this.setState(nextState);
    });
  };

  removeRole = async (id: string) => {
    const interviewerRole = this.state.roles.find((item: any) => {
      return item.name === 'interviewer';
    });
    if (!interviewerRole) {
      message.success(translate('lang:cannotFindInterviewerRole'));
      return;
    }
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const user = this.state.interviewers.find((item: User) => item._id === id) as any;
    try {
      await serviceProxy.updateUser(id, {
        operation: 'updateDetail',
        payload: {
          ...user,
          roles: user.roles && user.roles.filter((item: string) => {
            return item !== interviewerRole._id;
          }) || [],
        },
      });
      const interviewers = this.state.interviewers.find((item: User) => {
        return item._id === id;
      }) as any;
      if (!interviewers) return;
      this.setState({
        users: this.state.users.concat([interviewers]),
        interviewers: this.state.interviewers.filter((item: User) => {
          return item.id !== id;
        }),
      });
      message.success(translate('lang:deleteSuccess'));
    } catch (e) {
      message.error(e.message || translate('lang:internalError'));
    }
  };
  render() {
    return (
      <div>
        <Row>
          <Col xs={12}>
            <h2 style={{ marginBottom: 24 }}>{translate('lang:allInterviewers')}</h2>
          </Col>
          <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type='primary' onClick={() => this.openCreateModal()} >{translate('lang:create')}</Button>
          </Col>
        </Row>
        {this.state.modal.create && (
          <CreateInterviewerModal
            users={this.state.users}
            centres={this.props.centres}
            title={translate('lang:createInterviewer')}
            visible={this.state.modal.create}
            handleSubmit={this.createInterviewer}
            closeModal={this.closeModal}
            loading={this.state.loading.modal}
          />
        )}
        <BorderWrapper>
          <Main
            removeRole={this.removeRole}
            interviewers={this.state.interviewers}
            openModal={this.openModal}
            openEditModal={this.openEditModal}
            changeStatus={this.changeStatus}
            loading={this.state.loading.table} />
        </BorderWrapper>
      </div>
    );
  }
}, [PERMISSIONS.INTERVIEWER.VIEW], true, 'admin');
