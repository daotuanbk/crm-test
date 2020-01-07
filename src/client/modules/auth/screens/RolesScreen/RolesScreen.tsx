import React from 'react';
import { Role } from '@client/services/service-proxies';
import './RolesScreen.less';
import { Table, Tag, Dropdown, Icon, Menu, Col, Row, Input, Button, message } from 'antd';
import moment from 'moment';
import firebase from 'firebase/app';
import 'firebase/auth';
import { getServiceProxy } from '@client/services';
import { RoleModal } from './components/RoleModal';
import { buildPermissionsTree } from '@client/core';
import { PERMISSIONS } from '@common/permissions';
import { ProfileState, ProfileReducers, ProfileEffects } from '@client/store';
import { Authorize } from '@client/components';

interface State {
  search: string;
  permissions: string[];
  data: Role[];
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
    update?: Role;
  };
  permissionsData?: any;
  selectedPermissions: string[];
}
interface Props {
  data: Role[];
  before?: string;
  after?: string;
  profileState: ProfileState;
  profileReducers: ProfileReducers & ProfileEffects;
}
export const RolesScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    search: '',
    permissions: [],
    data: this.props.data,
    before: this.props.before,
    after: this.props.after,
    sortBy: 'createdAt|desc',
    pageSize: 5,
    loading: {
      table: false,
      modal: false,
    },
    modal: {
      create: undefined,
      update: undefined,
    },
    permissionsData: undefined,
    selectedPermissions: [],
  };

  componentDidMount() {
    this.handleSearch('');
  }

  openRoleModal = async (role?: any) => {
    let permissionsData: any = this.state.permissionsData;
    if (!permissionsData) {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      permissionsData = await serviceProxy.findPermissions();

      this.setState({
        modal: {
          ...this.state.modal,
          create: role ? undefined : {},
          update: role ? role : undefined,
        },
        permissionsData: permissionsData ? buildPermissionsTree(permissionsData) : [],
        selectedPermissions: role && role.permissions ? role.permissions : [],
      });
    } else {
      this.setState({
        modal: {
          ...this.state.modal,
          create: role ? undefined : {},
          update: role ? role : undefined,
        },
        permissionsData,
        selectedPermissions: role && role.permissions ? role.permissions : [],
      });
    }
  }

  activateRole = async (roleId: string) => {
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      await serviceProxy.updateRole(roleId, { operation: 'activate' });

      this.setState({
        data: this.state.data.map((item) => {
          if (item._id === roleId) {
            return {
              ...item,
              isActive: true,
            };
          } else {
            return item;
          }
        }),
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
      message.success('Activate role success');
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

  deactivateRole = async (roleId: string) => {
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      await serviceProxy.updateRole(roleId, { operation: 'deactivate' });

      this.setState({
        data: this.state.data.map((item) => {
          if (item._id === roleId) {
            return {
              ...item,
              isActive: false,
            };
          } else {
            return item;
          }
        }),
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
      message.success('Deactivate role success');
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
      const result = await serviceProxy.findRoles(
        value,
        this.state.permissions,
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

  closeRoleModal = () => {
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
      this.state.modal.create ? result = await serviceProxy.createRole(values) : await serviceProxy.updateRole(this.state.modal.update!._id, { operation: 'updateDetail', payload: values });

      message.success(this.state.modal.create ? 'Create role success' : 'Update role success');
      this.setState({
        data: this.state.modal.create ? [{ ...result, ...values, isActive: true }, ...this.state.data] : this.state.data.map((item) => {
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
      message.error(error.message);
      this.setState({
        loading: {
          ...this.state.loading,
          modal: false,
        },
      });
    }
  }

  loadPrevisousPage = async () => {
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const result = await serviceProxy.findRoles(
        this.state.search,
        this.state.permissions,
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

  loadNextPage = async () => {
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const result = await serviceProxy.findRoles(
        this.state.search,
        this.state.permissions,
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

  selectedPermissionsChange = (selectedPermissions: string[]) => {
    this.setState({
      selectedPermissions,
    });
  }

  render() {
    const actionsDropdown = (role: Role) => (
      <Menu>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => this.openRoleModal(role)}>Edit</a>
        </Menu.Item>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => this.activateRole(role._id)}>Activate</a>
        </Menu.Item>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => this.deactivateRole(role._id)}>Deactivate</a>
        </Menu.Item>
      </Menu>
    );

    const roleColumns = [{
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
    }, {
      title: 'Description',
      key: 'description',
      dataIndex: 'description',
    }, {
      title: 'Permissions',
      key: 'permissions',
      dataIndex: 'permissions',
      width: '400px',
      render: (_text: any, record: Role) => (
        <div>
          {record.permissions.slice(0, 3).map((item, index) => <Tag key={index} color='magenta'>{item}</Tag>)}
          {record.permissions.length > 3 ? '...' : ''}
        </div>
      ),
    }, {
      title: 'Status',
      key: 'isActive',
      dataIndex: 'isActive',
      render: (_text: any, record: Role) => <Tag key={record._id} color={record.isActive ? 'green' : 'red'}>{record.isActive ? 'Active' : 'In-Active'}</Tag>,
    }, {
      title: 'Created At',
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: (_text: any, record: Role) => moment((record as any).createdAt ? new Date((record as any).createdAt) : new Date()).format('DD/MM/YYYY HH:mm'),
    }, {
      title: 'Actions',
      key: 'actions',
      dataIndex: 'actions',
      render: (_text: any, record: Role) => (
        <Dropdown overlay={actionsDropdown(record)} trigger={['click']}>
          <a className='ant-dropdown-link'>
            Actions <Icon type='down' />
          </a>
        </Dropdown>
      ),
    }];

    return (
      <div>
        <h2 style={{ marginBottom: 24 }}>Roles</h2>
        <div className='roles-container'>
          <Row type='flex' style={{ marginBottom: '24px' }} justify='space-between'>
            <Col xs={12} xl={8}>
              <Input.Search
                enterButton={true}
                placeholder='Search name'
                onSearch={this.handleSearch}
              />
            </Col>
            <Col xs={10} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type='primary' onClick={() => this.openRoleModal()}>Create</Button>
            </Col>
          </Row>
          <Row type='flex'>
            <Col xs={24}>
              <Table
                bordered={true}
                columns={roleColumns}
                dataSource={this.state.data}
                loading={this.state.loading.table}
                pagination={false}
                scroll={{ x: 1000 }}
                rowKey={(record: any) => record._id}
              />
              {this.state.before || this.state.after
                ? <div className='pagination' style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                  {this.state.before && (
                    <Button onClick={this.loadPrevisousPage}><Icon type='left' /> Prev</Button>
                  )}
                  {this.state.after && (
                    <Button onClick={this.loadNextPage}>Next <Icon type='right' /></Button>
                  )}
                </div>
                : null}
            </Col>
          </Row>

          {(this.state.modal.create || this.state.modal.update) && (
            <RoleModal
              title={this.state.modal.update ? 'Update role' : 'Create role'}
              visible={Boolean(this.state.modal.update) || Boolean(this.state.modal.create)}
              handleSubmit={this.handleSubmit}
              closeModal={this.closeRoleModal}
              initialValue={this.state.modal.update || this.state.modal.create}
              permissionsData={this.state.permissionsData}
              selectedPermissions={this.state.selectedPermissions}
              selectedPermissionsChange={this.selectedPermissionsChange}
              loading={this.state.loading.modal}
            />
          )}
        </div>
      </div>
    );
  }
}, [PERMISSIONS.ROLES.VIEW], true, 'admin');
