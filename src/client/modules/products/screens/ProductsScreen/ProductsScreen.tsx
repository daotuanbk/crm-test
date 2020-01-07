import React from 'react';
import { Authorize, TableSort, BorderWrapper } from '@client/components';
import { withRematch, initStore } from '@client/store';
import { PERMISSIONS } from '@common/permissions';
import { Row, Col, notification, Button } from 'antd';
import { ProductsSearchBar } from './components/ProductsSearchBar/ProductsSearchBar';
import { ProductsFilter } from './components/ProductsFilter/ProductsFilter';
import { ProductsTable } from './components/ProductsTable/ProductsTable';
import { ProductsPagination } from './components/ProductsPagination/ProductsPagination';
import { ProductDetailDrawer } from './components/ProductDetailDrawer/ProductDetailDrawer';
import { Pagination, toSortBy, getErrorMessage } from '@client/core';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import _ from 'lodash';
import { Product, UpdateProductPayloadOperation } from '@client/services/service-proxies';
import { FormikActions } from 'formik';

interface Props {}

interface State {
  search: string;
  sort: TableSort;
  data: {
    products: any;
    total: number;
  };
  pagination: Pagination;
  filter: ProductFilters;
  loading: {
    modal: boolean;
    table: boolean;
  };
  selectedProduct?: Product;
  productDetailDrawerVisible: boolean;
}

export interface ProductFilters {
  type: string[];
  category: string[];
  productLine: string[];
  isActive: boolean|undefined;
}

class Screen extends React.Component<Props, State> {
  state: State = {
    search: '',
    sort: {
      field: 'createdAt',
      order: 'descend',
    },
    data: {
      products: {},
      total: 0,
    },
    pagination: {
      page: 1,
      pageSize: 20,
    },
    filter: {
      type: [],
      category: [],
      productLine: [],
      isActive: undefined,
    },
    loading: {
      modal: false,
      table: false,
    },
    selectedProduct: undefined,
    productDetailDrawerVisible: false,
  };

  componentDidMount() {
    this.loadProductsData();
  }

  loadProductsData = async () => {
    const {
      search,
      filter: {
        type,
        category,
        productLine,
        isActive,
      },
      pagination: {
        page,
        pageSize,
      },
      sort,
    } = this.state;
    const sortBy = toSortBy(sort);

    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const products = await serviceProxy.findProducts(
        search,
        type,
        category,
        productLine,
        isActive,
        pageSize,
        page,
        sortBy,
      );

      this.setState({
        data: {
          products: _.mapKeys(products.data, '_id'),
          total: products.count,
        },
      });
    } catch (error) {
      notification.error({
        message: 'Error',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  };

  clearFilter = () => {
    this.setState({
      search: '',
      sort: {
        field: 'createdAt',
        order: 'descend',
      },
      pagination: {
        page: 1,
        pageSize: 20,
      },
      filter: {
        type: [],
        category: [],
        productLine: [],
        isActive: undefined,
      },
    }, () => this.loadProductsData());
  };

  onSearchChange = (newSearchValue: string) => {
    this.setState({
      search: newSearchValue,
    });
  };

  showProductFromAutocomplete = (product: any) => {
    this.setState({
      pagination: {
        ...this.state.pagination,
        page: 1,
      },
      data: {
        products: { [product._id]: product },
        total: 1,
      },
    });
  };

  updateSearchAndReload = (search: string) => {
    const { pagination } = this.state;
    this.setState({
      search,
      pagination: {
        ...pagination,
        page: 1,
      },
    }, () => this.loadProductsData());
  };

  handleFilterChange = (newFilterValue: Partial<ProductFilters>) => {
    this.setState({
      filter: {
        ...this.state.filter,
        ...newFilterValue,
      },
    }, () => this.loadProductsData());
  };

  openProductDetailDrawer = (selectedProduct?: Product) => {
    this.setState({
      selectedProduct,
      productDetailDrawerVisible: true,
    });
  };

  closeProductDetailDrawer = () => {
    this.setState({
      selectedProduct: undefined,
      productDetailDrawerVisible: false,
    });
  };

  updateSortAndReload = (sort: TableSort) => {
    let sortToChange: any = { field: 'createdAt', order: 'descend' };
    if (sort.order) {
      sortToChange =  { field: sort.field || (sort as any).column.field, order: sort.order };
    }
    this.setState({
      sort: sortToChange,
      pagination: {
        ...this.state.pagination,
        page: 1,
      },
    }, () => this.loadProductsData());
  };

  updatePaginationAndReload = (pagination: Pagination) => {
    this.setState({
      pagination,
    }, () => this.loadProductsData());
  };

  handleProductFormSubmit = async (values: any, _formikBag: FormikActions<any>) => {
    const isEdit = !!_.get(this.state, 'selectedProduct._id');
    this.setState({
      loading: {
        ...this.state.loading,
        modal: true,
      },
    });

    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);

    try {
      if (isEdit) {
        const newProductInfo = await serviceProxy.updateProduct(_.get(this.state, 'selectedProduct._id'), {
          operation: UpdateProductPayloadOperation.UpdateDetail,
          payload: {
            type: values.type,
            price: values.price,
            isActive: values.isActive,
            selectableCourses: values.selectableCourses,
          },
        });

        this.setState({
          data: {
            ...this.state.data.products,
            products: {
              ...this.state.data.products,
              [newProductInfo._id]: newProductInfo,
            },
          },
        });
        notification.success({
          message: 'Update product success',
          placement: 'bottomRight',
        });
      } else {
        const newProduct = await serviceProxy.createProduct(values);

        this.setState({
          data: {
            products: {
              [newProduct._id]: newProduct,
              ...this.state.data.products,
            },
            total: this.state.data.total + 1,
          },
          selectedProduct: newProduct,
        });
        notification.success({
          message: 'Create product success',
          placement: 'bottomRight',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error.message,
        placement: 'bottomRight',
      });
    } finally {
      this.setState({
        loading: {
          ...this.state.loading,
          modal: false,
        },
      });
    }
  };

  render() {
    return (
      <div>
        <Row>
          <Col xs={12} sm={16} >
            <h2 style={{ marginBottom: 24 }}>All Products</h2>
          </Col>
        </Row>

        <BorderWrapper>
          <Row style={{ width: '100%' }}>
            <Col xs={24}>
              <ProductsSearchBar
                search={this.state.search}
                selectFromAutocomplete={this.showProductFromAutocomplete}
                onSearchChange={this.onSearchChange}
                onSearch={this.updateSearchAndReload}
              />
            </Col>
          </Row>

          <Row style={{ width: '100%' }}>
            <Col xs={24}>
              <ProductsFilter
                filter={this.state.filter}
                handleFilterChange={this.handleFilterChange}
                clearFilter={this.clearFilter}
              />
            </Col>
          </Row>

          <Row style={{ width: '100%', marginBottom: '16px' }}>
            <Col xs={24} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type='primary' icon='plus' onClick={() => this.openProductDetailDrawer()}>
                Add product
              </Button>
            </Col>
          </Row>

          <Row style={{ width: '100%' }}>
            <Col xs={24}>
              <ProductsTable
                loading={this.state.loading.table}
                data={this.state.data}
                openProductDetailDrawer={this.openProductDetailDrawer}
                updateSortAndReload={this.updateSortAndReload}
              />

              <ProductsPagination
                pagination={this.state.pagination}
                total={this.state.data.total}
                onPaginationChange={this.updatePaginationAndReload}
              />
            </Col>
          </Row>

          {this.state.productDetailDrawerVisible && (
            <ProductDetailDrawer
              visible={this.state.productDetailDrawerVisible}
              loading={this.state.loading.modal}
              productInfo={this.state.selectedProduct}
              closeProductDetailDrawer={this.closeProductDetailDrawer}
              handleProductFormSubmit={this.handleProductFormSubmit}
            />
          )}
        </BorderWrapper>
      </div>
    );
  }
}

const mapState = (rootState: any) => {
  return {
    authUser: rootState.profileModel.authUser,
  };
};

const mapDispatch = (_rootReducer: any) => {
  return {};
};

const ProductsScreen = Authorize(withRematch(initStore, mapState, mapDispatch)(Screen), [PERMISSIONS.PRODUCTS.VIEW_SCREEN], true, 'admin');

export {
  ProductsScreen,
};
