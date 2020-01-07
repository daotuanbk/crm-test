import React from 'react';
import './ProductComboScreen.less';
import { Authorize, BorderWrapper, Pagination } from '@client/components';
import { message, Row, Col, Button } from 'antd';
import { Main } from './Main';
import { PERMISSIONS } from '@common/permissions';
import { ProductComboModal } from './ProductComboModal';
import { ProductCombo } from '@client/services/service-proxies';
import firebase from 'firebase/app';
import { getServiceProxy } from '@client/services';
import { translate } from '@client/i18n';

interface State {
  search: string;
  data: ProductCombo[];
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
    update?: ProductCombo;
  };
}

interface Props {
}

export const ProductComboScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    search: '',
    data: [],
    before: undefined,
    after: undefined,
    sortBy: 'order|asc',
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
      const result = await serviceProxy.findProductCombo(
        undefined,
        params.search || '',
        [],
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
  openProductComboModal = (productCombo?: any) => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: productCombo ? undefined : {},
        update: productCombo ? {
          ...productCombo,
          field: productCombo.field === 'courseCount' && productCombo.condition === 'gt' && productCombo.conditionValue === -1 ? 'noCriteria' : productCombo.field,
        } : undefined,
      },
    });
  }
  closeProductComboModal = () => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: undefined,
        update: undefined,
      },
    });
  }
  handleSubmit = async (values: any, formikBag: any) => {
    if (values.field === 'noCriteria') {
      values.field = 'courseCount';
      values.condition = 'gt';
      values.conditionValue = -1;
    }

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
        result = await serviceProxy.createProductCombo({
          ...values,
        });
      } else {
        const newInfo = {
          ...this.state.modal.update,
          ...values,
        };
        result = await serviceProxy.updateProductCombo(this.state.modal.update!._id, {
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
            return result;
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
      const result = await serviceProxy.findProductCombo(
        undefined,
        this.state.search,
        [],
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

  deleteCombo = async (payload: string) => {
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      await serviceProxy.deleteProductCombo(payload);
      this.setState({
        data: this.state.data.filter((val: any) => val._id !== payload),
      });
      message.success(translate('lang:deleteSuccess'));
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  }

  render() {
    return (
      <div>

        <Row>
          <Col xs={12}>
            <h2 style={{ marginBottom: 24 }}>{translate('lang:allProductCombos')}</h2>
          </Col>
          <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type='primary' onClick={() => this.openProductComboModal()}>{translate('lang:addProductCombo')}</Button>
          </Col>
        </Row>
        {(this.state.modal.create || this.state.modal.update) && (
          <ProductComboModal
            title={this.state.modal.update ? translate('lang:updateProductCombo') : translate('lang:createProductCombo')}
            visible={Boolean(this.state.modal.update) || Boolean(this.state.modal.create)}
            handleSubmit={this.handleSubmit}
            closeModal={this.closeProductComboModal}
            initialValue={this.state.modal.update ? {
              ...this.state.modal.update,
            } : this.state.modal.create}
            loading={this.state.loading.modal}
          />
        )}
        <BorderWrapper>
          <Main
            data={this.state.data}
            openModal={this.openProductComboModal}
            loading={this.state.loading.table}
            handleSearch={this.handleSearch}
            deleteCombo={this.deleteCombo}
          ></Main>
          {this.state.before || this.state.after
            ? <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Pagination before={this.state.before} after={this.state.after} loadPreviousPage={() => { this.loadOtherPage(false); }}
                loadNextPage={() => { this.loadOtherPage(true); }} />
            </div>
            : null}
        </BorderWrapper>
      </div>
    );
  }
}, [PERMISSIONS.PRODUCT_COMBOS.VIEW], true, 'admin');
