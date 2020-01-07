import React from 'react';
import './EmailTemplate.less';
import { Authorize, BorderWrapper } from '@client/components';
import { message, Row, Col, Button } from 'antd';
import { Main } from './Main';
import { PERMISSIONS } from '@common/permissions';
import { EmailTemplateModal } from './EmailTemplateModal';
import { EmailTemplate } from '@client/services/service-proxies';
import firebase from 'firebase/app';
import { getServiceProxy } from '@client/services';
import { translate } from '@client/i18n';

interface State {
  search: string;
  data: EmailTemplate[];
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
    update?: EmailTemplate;
  };
}

interface Props {
}

export const EmailTemplateScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    search: '',
    data: [],
    before: undefined,
    after: undefined,
    sortBy: 'name|asc',
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
      const result = await serviceProxy.findEmailTemplates(
        params.search || '',
        undefined,
        this.state.pageSize,
        params.sortBy || this.state.sortBy,
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
        sortBy: params.sortBy || this.state.sortBy,
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
      const result = await serviceProxy.findEmailTemplates(
        '',
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

  loadPreviousPage = async () => {
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const result = await serviceProxy.findEmailTemplates(
        '',
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

  openModal = (item?: any) => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: item ? undefined : {},
        update: item ? item : undefined,
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
  removeItem = async (_id: string) => {
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      await serviceProxy.removeEmailTemplate(_id);
      message.success(translate('lang:deleteSuccess'));
      this.setState({
        data: this.state.data.filter((item: any) => {
          return item._id !== _id;
        }),
      });
    } catch (error) {
      message.error(JSON.parse(error.response).message);
    }
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
        result = await serviceProxy.createEmailTemplate({
          ...values,
        });
      } else {
        const newInfo = {
          ...this.state.modal.update,
          ...values,
        };
        await serviceProxy.updateEmailTemplate(this.state.modal.update!._id, {
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
          <Col xs={12}>
            <h2 style={{ marginBottom: 24 }}>{translate('lang:allTemplates')}</h2>
          </Col>
          <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {/*<Button type='primary' onClick={() => Router.push('/add-centre')}>Add centre</Button>*/}
            <Button type='primary' onClick={() => this.openModal()}>{translate('lang:addTemplate')}</Button>
          </Col>
        </Row>
        {(this.state.modal.create || this.state.modal.update) && (
          <EmailTemplateModal
            title={this.state.modal.update ? translate('lang:updateTemplate') : translate('lang:createTemplate')}
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
            remove={this.removeItem}
            before={this.state.before}
            after={this.state.after}
            loadNextPage={this.loadNextPage}
            loadPreviousPage={this.loadPreviousPage}
            data={this.state.data}
            openModal={this.openModal}
            handleSearch={this.handleSearch}
            loading={this.state.loading.table}>
          </Main>
        </BorderWrapper>
      </div>
    );
  }
}, [PERMISSIONS.EMAIL_TEMPLATES.VIEW], true, 'admin');
