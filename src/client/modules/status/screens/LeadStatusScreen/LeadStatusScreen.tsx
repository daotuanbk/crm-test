import React from 'react';
import './LeadStatusScreen.less';
import { Authorize, BorderWrapper, Pagination } from '@client/components';
import { message, Row, Col, Button } from 'antd';
import { Main } from './Main';
import { PERMISSIONS } from '@common/permissions';
import { LEAD_STAGE_STATUS } from '@client/core';
import { LeadStatusModal } from './LeadStatusModal';
import firebase from 'firebase/app';
import { getServiceProxy } from '@client/services';
import { translate } from '@client/i18n';

interface State {
  search: string;
  emailConfigs: any;
  stages: any;
  data: any;
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
    update?: any;
  };
}

interface Props {
}

export const LeadStatusScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    search: '',
    emailConfigs: [],
    stages: [],
    data: [],
    before: undefined,
    after: undefined,
    sortBy: '',
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
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const emailConfigsData = await serviceProxy.findAllEmailTemplateConfig();
    if (emailConfigsData) {
      this.setState({
        emailConfigs: emailConfigsData.data,
      });
    }
    const stages = await serviceProxy.findSystemConfigs('getAllStages', undefined, undefined, undefined, undefined, undefined, undefined) as any;
    if (stages) {
      this.setState({
        stages: stages.data,
      });
    }
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
      const defaultFilter = 'option|' + LEAD_STAGE_STATUS;
      const result = await serviceProxy.findSystemConfigs(
        undefined,
        params.search || '',
        [{ defaultFilter }],
        this.state.pageSize,
        params.sortBy || this.state.sortBy,
        undefined,
        undefined,
      );
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
  }
  openCentreModal = (centre?: any) => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: centre ? undefined : {},
        update: centre && centre.value ? {
          _id: centre._id,
          ...centre.value,
        } : undefined,
      },
    });
  }
  closeCentreModal = () => {
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
        result = await serviceProxy.createSystemConfig({
          option: LEAD_STAGE_STATUS,
          value: {
            ...values,
          },
        });
      } else {
        const newInfo = {
          option: LEAD_STAGE_STATUS,
          value: {
            ...this.state.modal.update,
            ...values,
          },
        };
        await serviceProxy.updateSystemConfig(this.state.modal.update._id, {
          operation: 'updateDetail',
          payload: newInfo,
        });
      }

      message.success(this.state.modal.create ? translate('lang:createSuccess') : translate('lang:updateSuccess'));
      this.setState({
        data: this.state.modal.create ? [
          {
            ...result,
            option: LEAD_STAGE_STATUS,
            value: {
              ...values,
            },
            createdAt: new Date().getTime(),
          },
          ...this.state.data,
        ] : this.state.data.map((item: any) => {
          if (item._id === this.state.modal.update._id) {
            return {
              _id: this.state.modal.update._id,
              option: LEAD_STAGE_STATUS,
              value: {
                ...this.state.modal.update,
                ...values,
              },
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
      const defaultFilter = 'option|' + LEAD_STAGE_STATUS;
      const result = await serviceProxy.findSystemConfigs(
        undefined,
        this.state.search,
        [{ defaultFilter }],
        this.state.pageSize,
        this.state.sortBy,
        next ? undefined : this.state.before,
        next ? this.state.after : undefined,
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
  render() {
    return (
      <div>
        <Row>
          <Col xs={12}>
            <h2 style={{ marginBottom: 24 }}>{translate('lang:allLeadStatuses')}</h2>
          </Col>
          <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type='primary' onClick={() => this.openCentreModal()}>{translate('lang:addLeadStatus')}</Button>
          </Col>
        </Row>
        {(this.state.modal.create || this.state.modal.update) && (
          <LeadStatusModal
            title={this.state.modal.update ? translate('lang:updateLeadStatus') : translate('lang:createLeadStatus')}
            visible={Boolean(this.state.modal.update) || Boolean(this.state.modal.create)}
            handleSubmit={this.handleSubmit}
            closeModal={this.closeCentreModal}
            initialValue={this.state.modal.update ? {
              ...this.state.modal.update,
            } : this.state.modal.create}
            loading={this.state.loading.modal}
            eventConfigs={this.state.emailConfigs}
            stages={this.state.stages}
          />
        )}
        <BorderWrapper>
          <Main
            data={this.state.data}
            openModal={this.openCentreModal}
            loading={this.state.loading.table}
            handleSearch={this.handleSearch}
            eventConfigs={this.state.emailConfigs}
            stages={this.state.stages}
          ></Main>
          {this.state.before || this.state.after
            ? <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination before={this.state.before} after={this.state.after} loadPreviousPage={() => { this.loadOtherPage(false); }}
                loadNextPage={() => { this.loadOtherPage(true); }} />
            </div> : null}

        </BorderWrapper>
      </div>
    );
  }
}, [PERMISSIONS.SYSTEM_CONFIGS.VIEW], true, 'admin');
