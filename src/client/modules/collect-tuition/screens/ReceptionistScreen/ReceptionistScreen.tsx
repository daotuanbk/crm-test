import React from 'react';
import { User, Role } from '@client/services/service-proxies';
import './ReceptionistScreen.less';
import { Table, Tag, Dropdown, Icon, Menu, Col, Row, Input, Button, message } from 'antd';
import moment from 'moment';
import firebase from 'firebase/app';
import 'firebase/auth';
import { getServiceProxy } from '@client/services';
import { ReceptionistModal } from './components/ReceptionistModal';
import { Authorize } from '@client/components';
import { PERMISSIONS } from '@common/permissions';
import { translate } from '@client/i18n';

interface State {
  search: string;
  role: Role | undefined;
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
}
interface Props { }
export const ReceptionistScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    search: '',
    role: undefined,
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
  };

  async componentDidMount() {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const role = await serviceProxy.getRoleByName('receptionist');
    if (role) {
      this.setState({
        role,
      });
      await this.handleSearch('');
    }
  }

  handleSearch = async (value: string) => {
    if (this.state.role) {
      this.setState({
        loading: {
          ...this.state.loading,
          table: true,
        },
      });

      try {
        const idToken = await firebase.auth().currentUser!.getIdToken();
        const serviceProxy = getServiceProxy(idToken);
        const result = await serviceProxy.findUsers(
          value,
          [this.state.role._id],
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
      message.success(translate('lang:activateSuccess'));
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
      message.success(translate('lang:deactivateSuccess'));
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
    if (this.state.role) {
      this.setState({
        modal: {
          ...this.state.modal,
          create: user ? undefined : {},
          update: user ? user : undefined,
        },
        rolesData: [this.state.role],
      });
    }
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
    if (this.state.role) {
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
          result = await serviceProxy.createUser({
            ...values,
            roles: [this.state.role._id],
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
            roles: [this.state.role._id],
          };

          await serviceProxy.updateUser(this.state.modal.update!._id, {
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
              fullName: [values.familyName, values.givenName].join(' '),
              loginDetail: { provider: 'email', email: values },
              roles: [this.state.role],
              createdAt: new Date().getTime(),
              isActive: true,
            },
            ...this.state.data,
          ] : this.state.data.map((item) => {
            if (item._id === this.state.modal.update!._id) {
              return {
                ...this.state.modal.update,
                ...values,
                fullName: [values.familyName, values.givenName].join(' '),
                roles: [this.state.role],
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
  }

  loadPrevisousPage = async () => {
    if (this.state.role) {
      this.setState({
        loading: {
          ...this.state.loading,
          table: true,
        },
      });

      try {
        const idToken = await firebase.auth().currentUser!.getIdToken();
        const serviceProxy = getServiceProxy(idToken);
        const result = await serviceProxy.findUsers(
          this.state.search,
          [this.state.role._id],
          undefined,
          this.state.pageSize,
          this.state.sortBy,
          this.state.before,
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
  }

  loadNextPage = async () => {
    if (this.state.role) {
      this.setState({
        loading: {
          ...this.state.loading,
          table: true,
        },
      });

      try {
        const idToken = await firebase.auth().currentUser!.getIdToken();
        const serviceProxy = getServiceProxy(idToken);
        const result = await serviceProxy.findUsers(
          this.state.search,
          [this.state.role._id],
          undefined,
          undefined,
          undefined,
          this.state.pageSize,
          this.state.sortBy,
          undefined,
          this.state.after,
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
  }

  render() {
    const actionsDropdown = (user: User) => (
      <Menu>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => this.openUserModal(user)}>{translate('lang:edit')}</a>
        </Menu.Item>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => this.activateUser(user._id)}>{translate('lang:activate')}</a>
        </Menu.Item>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => this.deactivateUser(user._id)}>{translate('lang:deactivate')}</a>
        </Menu.Item>
      </Menu>
    );

    const userColumns = [{
      title: translate('lang:name'),
      key: 'fullName',
      dataIndex: 'fullName',
    }, {
      title: translate('lang:email'),
      key: 'email',
      dataIndex: 'email',
    }, {
      title: translate('lang:roles'),
      key: 'roles',
      dataIndex: 'roles',
      render: (_text: any, record: User) => (
        <div>
          {record.roles.map((item, index) => <Tag key={index} color='magenta'>{(item as any).name}</Tag>)}
        </div>
      ),
    }, {
      title: translate('lang:status'),
      key: 'isActive',
      dataIndex: 'isActive',
      render: (_text: any, record: User) => <Tag key={record._id} color={record.isActive ? 'green' : 'red'}>{record.isActive ? 'Active' : 'In-Active'}</Tag>,
    }, {
      title: translate('lang:createdAt'),
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: (_text: any, record: User) => moment(new Date(record.createdAt)).format('DD/MM/YYYY HH:mm'),
    }, {
      title: translate('lang:actions'),
      key: 'actions',
      dataIndex: 'actions',
      render: (_text: any, record: User) => (
        <Dropdown overlay={actionsDropdown(record)} trigger={['click']}>
          <a className='ant-dropdown-link'>
            {translate('lang:actions')} <Icon type='down' />
          </a>
        </Dropdown>
      ),
    }];

    return (
      <div>
        <h2 style={{ marginBottom: 24 }}>{translate('lang:receptionist')}</h2>
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
              <Button type='primary' onClick={() => this.openUserModal()}>{translate('lang:create')}</Button>
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
                rowKey={(record: any) => record._id}
              />
              {this.state.before || this.state.after
                ? <div className='pagination' style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                  {this.state.before && (
                    <Button onClick={this.loadPrevisousPage}><Icon type='left' /> {translate('lang:prev')}</Button>
                  )}
                  {this.state.after && (
                    <Button onClick={this.loadNextPage}>{translate('lang:next')} <Icon type='right' /></Button>
                  )}
                </div> : null
              }

            </Col>
          </Row>

          {(this.state.modal.create || this.state.modal.update) && (
            <ReceptionistModal
              title={this.state.modal.update ? translate('lang:updateReceptionist') : translate('lang:createReceptionist')}
              visible={Boolean(this.state.modal.update) || Boolean(this.state.modal.create)}
              handleSubmit={this.handleSubmit}
              closeModal={this.closeUserModal}
              initialValue={this.state.modal.update ? {
                ...this.state.modal.update,
                roles: this.state.modal.update.roles.map((item: any) => item.name),
              } : this.state.modal.create}
              rolesData={this.state.rolesData}
              loading={this.state.loading.modal}
            />
          )}
        </div>
      </div>
    );
  }
}, [PERMISSIONS.USERS.VIEW], true, 'admin');
