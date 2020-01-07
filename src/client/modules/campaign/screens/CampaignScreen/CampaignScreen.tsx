import React from 'react';
import './CampaignScreen.less';
import { Authorize, Import, Export, BorderWrapper, Pagination } from '@client/components';
import { message, Row, Col, Button } from 'antd';
import { Main } from './Main';
import { PERMISSIONS } from '@common/permissions';
import { CampaignModal } from './CampaignModal';
import { Campaign } from '@client/services/service-proxies';
import firebase from 'firebase/app';
import { getServiceProxy } from '@client/services';
import axios from 'axios';
import { config } from '@client/config';
import { translate } from '@client/i18n';

interface State {
  search: string;
  data: Campaign[];
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
    update?: Campaign;
  };
  campaigns: any;
}

interface Props {
  sources: any[];
}

export const CampaignScreen = Authorize(class extends React.Component<Props, State> {
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
    modal: {
      create: false,
    },
    campaigns: {},
  };

  async componentDidMount() {
    let campaignFb = {} as any;
    try {
      campaignFb = (await axios({
        url: `${config.url.api}/prospecting-list/campaigns`,
        method: 'get',
      })).data;
    } catch (e) {
      //
    }
    if (campaignFb) {
      this.setState({
        campaigns: campaignFb && campaignFb.data && campaignFb.data.data && campaignFb.data.data[0] && campaignFb.data.data[0].campaigns || {data: []},
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
    }, async () => {
      try {
        const idToken = await firebase.auth().currentUser!.getIdToken();
        const serviceProxy = getServiceProxy(idToken);
        const result = await serviceProxy.findCampaigns(
          undefined,
          undefined,
          params.search || '',
          undefined,
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
    });
  };
  removeCampaign = async (id: string) => {
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      await serviceProxy.removeCampaign(id);
      message.success(translate('lang:deleteSuccess'));
      this.setState({
        data: this.state.data.filter((item: any) => {
          return item._id !== id;
        }),
        modal: {
          ...this.state.modal,
          create: undefined,
          update: undefined,
        },
      });
    } catch (error) {
      message.error(JSON.parse(error.response).message);
    }
  };
  openCampaignModal = (campaign?: any) => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: campaign ? undefined : {},
        update: campaign ? campaign : undefined,
      },
    });
  };
  closeCampaignModal = () => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: undefined,
        update: undefined,
      },
    });
  };
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
        result = await serviceProxy.createCampaign({
          ...values,
        });
      } else {
        const newInfo = {
          ...this.state.modal.update,
          ...values,
        };
        await serviceProxy.updateCampaign(this.state.modal.update!._id, {
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
      const result = await serviceProxy.findCampaigns(
        undefined,
        undefined,
        this.state.search,
        undefined,
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
          <Col xs={12} >
            <h2 style={{ marginBottom: 24 }}>{translate('lang:allCampaignsManagement')}</h2>
          </Col>
          <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Import import={() => message.success('Import')}></Import>
            <Export export={() => message.success('Export')}></Export>
            <Button type='primary' onClick={() => this.openCampaignModal()}>{translate('lang:addCampaign')}</Button>
          </Col>
        </Row>
        {(this.state.modal.create || this.state.modal.update) && (
          <CampaignModal
            campaigns={this.state.campaigns}
            title={this.state.modal.update ? translate('lang:updateCampaign') : translate('lang:addCampaign')}
            visible={Boolean(this.state.modal.update) || Boolean(this.state.modal.create)}
            handleSubmit={this.handleSubmit}
            closeModal={this.closeCampaignModal}
            initialValue={this.state.modal.update ? {
              ...this.state.modal.update,
            } : this.state.modal.create}
            loading={this.state.loading.modal}
          />
        )}
        <BorderWrapper>
          <Main
            onDelete={this.removeCampaign}
            sources={this.props.sources}
            data={this.state.data}
            openModal={this.openCampaignModal}
            loading={this.state.loading.table}
            handleSearch={this.handleSearch} />
          {this.state.before || this.state.before
            ? <Pagination before={this.state.before} after={this.state.after} loadPreviousPage={() => { this.loadOtherPage(false); }}
              loadNextPage={() => { this.loadOtherPage(true); }} /> : null}
        </BorderWrapper>
      </div>
    );
  }
}, [PERMISSIONS.CAMPAIGNS.VIEW], true, 'admin');
