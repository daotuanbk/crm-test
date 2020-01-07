import React from 'react';
import { User, Role, Centre } from '@client/services/service-proxies';
import './UsersScreen.less';
import { Table, Tag, Dropdown, Icon, Menu, Col, Row, Input, Button, message } from 'antd';
import moment from 'moment';
import firebase from 'firebase/app';
import 'firebase/auth';
import { getServiceProxy } from '@client/services';
import { UserModal } from './components/UserModal';
import { Authorize } from '@client/components';
import { PERMISSIONS } from '@common/permissions';

interface State {
  search: string;
  roles: Role[];
  data: User[];
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
    update?: User;
  };
  rolesData?: Role[];
  isOpenSelectCenter: boolean;
  listCenters: Centre[];
  listCentersFilters: string[];
}
interface Props { }
export const UsersScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    search: '',
    roles: [],
    data: [],
    before: undefined,
    after: undefined,
    sortBy: 'createdAt|desc',
    pageSize: 5,
    loading: {
      table: false,
      modal: false,
    },
    modal: {
      create: false,
    },
    rolesData: undefined,
    isOpenSelectCenter: false,
    listCenters: [],
    listCentersFilters: [],
  };

  async componentDidMount() {
    this.handleSearch('');
  }

  handleSearch = async (value: string) => {
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const result = await serviceProxy.getAllUsers() as any;
      const listCenters = await serviceProxy.getAllCentres();
      const listCentersFilters = [];
      if (listCenters && listCenters.data && listCenters.data.length) {
        for (const i in listCenters.data) {
          const item = listCenters.data[i];
          const users = await serviceProxy.getAllUsers() as any;
          if (users && users.data && !users.data.length) {
            listCentersFilters.push(item);
          }
        }
      }

      const listCentersFiltersConvert = listCentersFilters && listCentersFilters.length ? listCentersFilters.map((item) => item._id) : [];
      this.setState({
        data: result.data,
        listCenters: listCenters.data,
        listCentersFilters: listCentersFiltersConvert,
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

  openSelectCenter = () => {
    this.setState({
      isOpenSelectCenter: true,
    });
  }

  closeSelectCenter = () => {
    this.setState({
      isOpenSelectCenter: false,
    });
  }

  activateUser = async (userId: string) => {
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      await serviceProxy.updateUser(userId, { operation: 'activate' });

      this.setState({
        data: this.state.data.map((item) => {
          return item._id === userId ? { ...item, isActive: true } : item;
        }),
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
      message.success('Activate user success');
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

  deactivateUser = async (userId: string) => {
    this.setState({
      data: this.state.data.map((item) => {
        return item._id === userId ? { ...item, isActive: false } : item;
      }),
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      await serviceProxy.updateUser(userId, { operation: 'deactivate' });

      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
      message.success('Deactivate user success');
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

  openUserModal = async (user?: any) => {
    let rolesData: any = this.state.rolesData;
    if (!rolesData) {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const result = await serviceProxy.getAllRoles();
      rolesData = result.roles;
    }

    this.setState({
      modal: {
        ...this.state.modal,
        create: user ? undefined : {},
        update: user ? user : undefined,
      },
      rolesData,
    });
  }

  closeUserModal = () => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: undefined,
        update: undefined,
      },
      isOpenSelectCenter: false,
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
        const selectedRoles: any = [];
        this.state.rolesData!.forEach((item) => {
          if (values.roles.indexOf(item.name) > -1) {
            selectedRoles.push(item._id);
          }
        });
        result = await serviceProxy.createUser({
          ...values,
          roles: selectedRoles,
        });
      } else {
        const selectedRoles: any = [];
        this.state.rolesData!.forEach((item) => {
          if (values.roles.indexOf(item.name) > -1) {
            selectedRoles.push(item._id);
          }
        });

        const newInfo = {
          ...this.state.modal.update,
          ...values,
          fullName: [values.familyName, values.givenName].join(' '),
          roles: selectedRoles,
        };

        await serviceProxy.updateUser(this.state.modal.update!._id, {
          operation: 'updateDetail',
          payload: newInfo,
        });
      }

      message.success(this.state.modal.create ? 'Create user success' : 'Update user success');
      this.setState({
        data: this.state.modal.create ? [
          {
            ...result,
            ...values,
            fullName: [values.familyName, values.givenName].join(' '),
            loginDetail: { provider: 'email', email: values },
            roles: this.state.rolesData!.filter((item) => values.roles.indexOf(item.name) > -1),
            createdAt: new Date().getTime(),
            centreId: values.centreId,
          },
          ...this.state.data,
        ] : this.state.data.map((item) => {
          if (item._id === this.state.modal.update!._id) {
            return {
              ...this.state.modal.update,
              ...values,
              fullName: [values.familyName, values.givenName].join(' '),
              roles: this.state.rolesData!.filter((ite) => values.roles.indexOf(ite.name) > -1),
              centreId: values.centreId,
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
    const actionsDropdown = (user: User) => (
      <Menu>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => this.openUserModal(user)}>Edit</a>
        </Menu.Item>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => this.activateUser(user._id)}>Activate</a>
        </Menu.Item>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => this.deactivateUser(user._id)}>Deactivate</a>
        </Menu.Item>
      </Menu>
    );

    const userColumns = [{
      title: 'Name',
      key: 'fullName',
      dataIndex: 'fullName',
    }, {
      title: 'Email',
      key: 'email',
      dataIndex: 'email',
    }, {
      title: 'Sign in method',
      key: 'loginDetail',
      dataIndex: 'loginDetail',
      render: (_text: any, record: User) => record.loginDetail ? <Tag color='cyan'>{record.loginDetail.provider}</Tag> : '',
    }, {
      title: 'Roles',
      key: 'roles',
      dataIndex: 'roles',
      render: (_text: any, record: User) => (
        <div>
          {record.roles.map((item, index) => <Tag key={index} color='magenta'>{(item as any).name}</Tag>)}
        </div>
      ),
    }, {
      title: 'Status',
      key: 'isActive',
      dataIndex: 'isActive',
      render: (_text: any, record: User) => <Tag key={record._id} color={record.isActive ? 'green' : 'red'}>{record.isActive ? 'Active' : 'In-Active'}</Tag>,
    }, {
      title: 'Created At',
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: (_text: any, record: User) => moment(new Date(record.createdAt)).format('DD/MM/YYYY HH:mm'),
    }, {
      title: 'Actions',
      key: 'actions',
      dataIndex: 'actions',
      render: (_text: any, record: User) => (
        <Dropdown overlay={actionsDropdown(record)} trigger={['click']}>
          <a className='ant-dropdown-link'>
            Actions <Icon type='down' />
          </a>
        </Dropdown>
      ),
    }];

    return (
      <div>
        <h2 style={{ marginBottom: 24 }}>Accounts</h2>
        <div className='users-container'>
          <Row type='flex' style={{ marginBottom: '24px' }} justify='space-between'>
            <Col xs={12} xl={8}>
              <Input.Search
                enterButton={true}
                placeholder='Search name/email/phone'
                onSearch={this.handleSearch}
              />
            </Col>
            <Col xs={10} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type='primary' onClick={() => this.openUserModal()}>Create</Button>
            </Col>
          </Row>
          <Row type='flex'>
            <Col xs={24}>
              <Table
                bordered={true}
                columns={userColumns}
                dataSource={this.state.data}
                loading={this.state.loading.table}
                pagination={false}
                scroll={{ x: 1000 }}
                className={this.state.after || this.state.before ? 'users-table' : ''}
                rowKey={(record: any) => record._id}
              />
            </Col>
          </Row>

          {(this.state.modal.create || this.state.modal.update) && (
            <UserModal
              title={this.state.modal.update ? 'Update user' : 'Create user'}
              visible={Boolean(this.state.modal.update) || Boolean(this.state.modal.create)}
              handleSubmit={this.handleSubmit}
              closeModal={this.closeUserModal}
              initialValue={this.state.modal.update ? {
                ...this.state.modal.update,
                roles: this.state.modal.update.roles.map((item: any) => item.name),
              } : this.state.modal.create}
              rolesData={this.state.rolesData}
              openSelectCenter={this.openSelectCenter}
              closeSelectCenter={this.closeSelectCenter}
              isOpenSelectCenter={this.state.isOpenSelectCenter}
              listCenters={this.state.listCenters}
              loading={this.state.loading.modal}
              listCentersFilters={this.state.listCentersFilters}
            />
          )}
        </div>
      </div>
    );
  }
}, [PERMISSIONS.USERS.VIEW], true, 'admin');
