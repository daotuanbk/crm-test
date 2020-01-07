import React from 'react';
import './EmailTemplateConfig.less';
import { Authorize, BorderWrapper } from '@client/components';
import { message, Row, Col, Button } from 'antd';
import { Main } from './Main';
import { PERMISSIONS } from '@common/permissions';
import { EmailTemplateConfigModal } from './EmailTemplateConfigModal';
import { EmailTemplateConfig } from '@client/services/service-proxies';
import firebase from 'firebase/app';
import { getServiceProxy } from '@client/services';
import * as uuid from 'uuid';
import { translate } from '@client/i18n';

interface State {
  search: string;
  data: EmailTemplateConfig[];
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
  templates: any;
}

interface Props {
}

export const EmailTemplateConfigScreen = Authorize(class extends React.Component<Props, State> {
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
    templates: [],
  };

  async componentDidMount() {
    this.handleSearch({});
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const templates = await serviceProxy.findAllEmailTemplates() as any;
    if (templates && templates.data) {
      this.setState({
        templates: templates.data || [],
      });
    }
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
      const result = await serviceProxy.findEmailTemplateConfigs(
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
      const result = await serviceProxy.findEmailTemplateConfigs(
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
      const result = await serviceProxy.findEmailTemplateConfigs(
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

  openModal = (item?: any) => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: item ? undefined : {
          data: [{
            index: uuid.v4(),
            template: undefined,
            recipient: undefined,
            subject: undefined,
          }],
        },
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

  addRecipient = () => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: this.state.modal.create ? {
          ...this.state.modal.create,
          data: [...(this.state.modal.create && this.state.modal.create.data ? this.state.modal.create.data : []), {
            index: uuid.v4(),
            template: undefined,
            recipient: undefined,
            subject: undefined,
          }],
        } : undefined,
        update: this.state.modal.create ? undefined : {
          ...this.state.modal.update,
          data: [...(this.state.modal.update && this.state.modal.update.data ? this.state.modal.update.data : []), {
            index: uuid.v4(),
            template: undefined,
            recipient: undefined,
            subject: undefined,
          }],
        },
      },
    });
  }

  changeData = (payload: any) => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: this.state.modal.create ? {
          ...this.state.modal.create,
          ...payload,
        } : undefined,
        update: this.state.modal.create ? undefined : {
          ...this.state.modal.update,
          ...payload,
        },
      },
    });
  }

  changeRecipient = (payload: any) => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: this.state.modal.create ? {
          ...this.state.modal.create,
          data: this.state.modal.create && this.state.modal.create.data ? this.state.modal.create.data.map((val: any) => {
            if (val && val.index === payload.index) {
              return {
                ...val,
                ...payload,
              };
            } else {
              return val;
            }
          }) : [],
        } : undefined,
        update: this.state.modal.create ? undefined : {
          ...this.state.modal.update,
          data: this.state.modal.update && this.state.modal.update.data ? this.state.modal.update.data.map((val: any) => {
            if (val && val.index === payload.index) {
              return {
                ...val,
                ...payload,
              };
            } else {
              return val;
            }
          }) : [],
        },
      },
    });
  }

  removeRecipient = (index: string) => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: this.state.modal.create ? {
          ...this.state.modal.create,
          data: this.state.modal.create && this.state.modal.create.data ? this.state.modal.create.data.filter((val: any) => {
            return val.index !== index;
          }) : [],
        } : undefined,
        update: this.state.modal.create ? undefined : {
          ...this.state.modal.update,
          data: this.state.modal.update && this.state.modal.update.data ? this.state.modal.update.data.filter((val: any) => {
            return val.index !== index;
          }) : [],
        },
      },
    });
  }

  handleSubmit = async () => {
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      let result: any;
      if (this.state.modal.create) {
        if (!this.state.modal.create.eventName) {
          message.error(translate('lang:fillInEventName'));
          return;
        } else {
          if (this.state.modal.create.data && this.state.modal.create.data.length) {
            const validateRecipients = this.state.modal.create.data.filter((val: any) => !val.recipient);
            if (validateRecipients && validateRecipients.length) {
              message.error(translate('lang:fillInRequiredFields'));
              return;
            } else {
              this.setState({
                loading: {
                  ...this.state.loading,
                  modal: true,
                },
              });
              result = await serviceProxy.createEmailTemplateConfig(this.state.modal.create);
            }
          } else {
            message.error(translate('lang:specifyOneRecipient'));
            return;
          }
        }
      } else {
        if (this.state.modal.update) {
          if (!this.state.modal.update.eventName) {
            message.error(translate('lang:fillInEventName'));
            return;
          } else {
            if (this.state.modal.update.data && this.state.modal.update.data.length) {
              const validateRecipients = this.state.modal.update.data.filter((val: any) => !val.recipient);
              if (validateRecipients && validateRecipients.length) {
                message.error(translate('lang:fillInRequiredFields'));
                return;
              } else {
                this.setState({
                  loading: {
                    ...this.state.loading,
                    modal: true,
                  },
                });
                const updateData = this.state.modal.update.data.map((value: any) => {
                  if (!value.template) {
                    value.template = undefined;
                  }
                  return value;
                });
                const newInfo = {
                  ...this.state.modal.update,
                  data: updateData,
                };
                await serviceProxy.updateEmailTemplateConfig(this.state.modal.update._id, {
                  operation: 'updateDetail',
                  payload: newInfo,
                });
              }
            } else {
              message.error(translate('lang:specifyOneRecipient'));
              return;
            }
          }
        }
      }

      message.success(this.state.modal.create ? translate('lang:createSuccess') : translate('lang:updateSuccess'));
      this.setState({
        data: this.state.modal.create ? [
          {
            ...result,
            ...this.state.modal.create,
            createdAt: new Date().getTime(),
          },
          ...this.state.data,
        ] : this.state.data.map((item) => {
          if (item._id === (this.state.modal.update ? this.state.modal.update._id : '')) {
            return {
              ...this.state.modal.update,
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
      <div className='email-template-config-screen'>

        <Row>
          <Col xs={12}>
            <h2 style={{ marginBottom: 24 }}>All configs</h2>
          </Col>
          <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type='primary' onClick={() => this.openModal()}>{translate('lang:addConfig')}</Button>
          </Col>
        </Row>
        {(this.state.modal.create || this.state.modal.update) && (
          <EmailTemplateConfigModal
            title={this.state.modal.update ? translate('lang:updateConfig') : translate('lang:createConfig')}
            visible={Boolean(this.state.modal.update) || Boolean(this.state.modal.create)}
            handleSubmit={this.handleSubmit}
            closeModal={this.closeUserModal}
            initialValue={this.state.modal.update ? {
              ...this.state.modal.update,
            } : this.state.modal.create}
            data={this.state.modal.update ? {
              ...this.state.modal.update,
            } : this.state.modal.create}
            loading={this.state.loading.modal}
            templates={this.state.templates}
            addRecipient={this.addRecipient}
            changeRecipient={this.changeRecipient}
            removeRecipient={this.removeRecipient}
            changeData={this.changeData}
          />
        )}
        <BorderWrapper>
          <Main
            data={this.state.data}
            openModal={this.openModal}
            handleSearch={this.handleSearch}
            before={this.state.before}
            after={this.state.after}
            loadNextPage={this.loadNextPage}
            loadPreviousPage={this.loadPreviousPage}
            templates={this.state.templates}
            loading={this.state.loading.table}>
          </Main>
        </BorderWrapper>
      </div>
    );
  }
}, [PERMISSIONS.EMAIL_TEMPLATES.VIEW], true, 'admin');
