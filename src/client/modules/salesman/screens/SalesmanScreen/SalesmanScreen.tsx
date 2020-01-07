import React from 'react';
import './SalesmanScreen.less';
import { Authorize, BorderWrapper } from '@client/components';
import { message, Row, Col, Button } from 'antd';
import { Main } from './Main';
import { PERMISSIONS } from '@common/permissions';
import { SalesmanModal } from './SalesmanModal';
import { EditSalesmanModal } from './EditSalesmanModal';
import { CreateSalesmanModal } from './CreateSalesmanModal';
import { User, Centre } from '@client/services/service-proxies';
import firebase from 'firebase/app';
import { getServiceProxy } from '@client/services';
import _ from 'lodash';
import { translate } from '@client/i18n';

interface State {
  search: string;
  salesmen: User[];
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
    edit: boolean;
    add: boolean;
    create: boolean;
  };
  selectedUser: User | any;
  roles: any[];
}

interface Props {
  centres: Centre[];
  salesmen: User[];
  users: User[];
  roles: any[];
}

export const SalesmanScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    search: '',
    salesmen: this.props.salesmen || [],
    users: _.differenceBy(this.props.users, this.props.salesmen, '_id'),
    before: undefined,
    after: undefined,
    sortBy: 'createdAt|des',
    pageSize: 10,
    loading: {
      table: false,
      modal: false,
    },
    modal: {
      edit: false,
      add: false,
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
        salesmen: this.state.salesmen.map((item: User) => {
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
  createSalesman = async (centreId?: string, users: string[], formikBag: any) => {
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
    const salesmanRole = this.state.roles.find((item: any) => {
      return item.name === 'salesman';
    });
    if (!salesmanRole) {
      message.error(translate('lang:cannotFindSalesmanRole'));
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
          centreId: centreId || undefined,
          roles: [
            ...user.roles,
            salesmanRole._id,
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
        const salesmen = this.state.users.filter((item: User) => {
          const existed = users.find((id: string) => item._id === id);
          return !!existed;
        }).map((item: User) => {
          if (centreId) item.centreId = centreId;
          return item;
        });
        nextState.users = _.differenceBy(this.state.users, salesmen, '_id');
        nextState.salesmen = this.state.salesmen.concat(salesmen);
        formikBag.resetForm({});
        message.success(translate('lang:updateSuccess'));
      } catch (e) {
        delete nextState.modal;
      }
      this.setState(nextState);
    });
  };

  removeRole = async (id: string) => {
    const salesmanRole = this.state.roles.find((item: any) => {
      return item.name === 'salesman';
    });
    if (!salesmanRole) {
      message.success(translate('lang:cannotFindSalesmanRole'));
      return;
    }
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const user = this.state.salesmen.find((item: User) => item._id === id) as any;
    try {
      await serviceProxy.updateUser(id, {
        operation: 'updateDetail',
        payload: {
          unset: {
            centreId: '',
          },
          ...user,
          centreId: undefined,
          roles: user.roles && user.roles.filter((item: string) => {
            return item !== salesmanRole._id;
          }) || [],
        },
      });
      const salesmen = this.state.salesmen.find((item: User) => {
        return item._id === id;
      }) as any;
      if (!salesmen) return;
      salesmen.centreId = undefined;
      this.setState({
        users: this.state.users.concat([salesmen]),
        salesmen: this.state.salesmen.filter((item: User) => {
          return item.id !== id;
        }),
      });
      message.success(translate('lang:deleteSuccess'));
    } catch (e) {
      message.error(translate('lang:internalError'));
    }
  };

  handleSubmit = async (centreId: string, removedSalesmanIds: string[], selectedSalesmanIds: string[], formikBag: any) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const promises: Promise<any>[] = [];
    const salesmen = this.state.salesmen;
    removedSalesmanIds.forEach((id: string) => {
      const salesman = this.state.salesmen.find((item: User) => item._id === id);
      if (salesman) {
        promises.push(serviceProxy.updateUser(id, {
          operation: 'updateDetail',
          payload: {
            unset: {
              centreId: '',
            },
          },
        }));
        salesman.centreId = '';
      }
    });
    selectedSalesmanIds.forEach((id: string) => {
      const salesman = this.state.salesmen.find((item: User) => item._id === id);
      if (salesman) {
        salesman.centreId = centreId;
        promises.push(serviceProxy.updateUser(id, {
          operation: 'updateDetail',
          payload: {
            ...salesman,
            centreId,
          },
        }));
      }
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
        salesmen,
      };
      try {
        await Promise.all(promises);
        formikBag.resetForm({});
        message.success(translate('lang:updateSuccess'));
      } catch (e) {
        delete nextState.modal;
      }
      this.setState(nextState);
    });
  };
  render() {
    return (
      <div >

        <Row>
          <Col xs={12}>
            <h2 style={{ marginBottom: 24 }}>{translate('lang:allSalesmen')}</h2>
          </Col>
          <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type='primary' onClick={() => this.openCreateModal()} style={{ marginRight: '10px' }}>{translate('lang:createSalesman')}</Button>
            <Button type='primary' onClick={() => this.openModal()}>{translate('lang:addSalesmanToCentre')}</Button>
          </Col>
        </Row>
        {this.state.modal.create && (
          <CreateSalesmanModal
            users={this.state.users}
            centres={this.props.centres}
            title={translate('lang:createSalesman')}
            visible={this.state.modal.create}
            handleSubmit={this.createSalesman}
            closeModal={this.closeModal}
            loading={this.state.loading.modal}
          />
        )}
        {this.state.modal.add && (
          <SalesmanModal
            salesmen={this.state.salesmen}
            centres={this.props.centres}
            title={translate('lang:addSalesmanToCentre')}
            visible={this.state.modal.add}
            handleSubmit={this.handleSubmit}
            closeModal={this.closeModal}
            loading={this.state.loading.modal}
          />
        )}
        {this.state.modal.edit && (
          <EditSalesmanModal
            centreId={this.state.selectedUser && this.state.selectedUser.centreId}
            centres={this.props.centres}
            title={translate('lang:addSalesmanToCentre')}
            visible={this.state.modal.edit}
            handleSubmit={(centreId, formikBag) => {
              this.handleSubmit(centreId, [], [this.state.selectedUser && this.state.selectedUser._id], formikBag);
            }}
            closeModal={this.closeModal}
            loading={this.state.loading.modal}
          />
        )}
        <BorderWrapper>
          <Main
            removeRole={this.removeRole}
            centres={this.props.centres}
            salesmen={this.state.salesmen}
            openModal={this.openModal}
            openEditModal={this.openEditModal}
            changeStatus={this.changeStatus}
            loading={this.state.loading.table} />
        </BorderWrapper>
      </div>
    );
  }
}, [PERMISSIONS.SALESMAN.VIEW], true, 'admin');
