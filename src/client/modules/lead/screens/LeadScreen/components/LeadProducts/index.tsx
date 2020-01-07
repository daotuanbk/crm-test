import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Select, Typography, notification, AutoComplete } from 'antd';
import { Lead, LeadProduct, Contact, Product, Customer } from '@client/services/service-proxies';
import _ from 'lodash';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { produce } from 'immer';
import { getErrorMessage } from '@client/core';

interface Props {
  leadInfo: Lead;
  changeInput: (values: (Customer|Lead)) => void;
}

export const LeadProducts = (props: Props) => {
  if (!props.leadInfo) {
    return (
      <div>N/A</div>
    );
  }

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMakeOrder, setLoadingMakeOrder] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [candidateProducts, setCandidateProducts] = useState<(LeadProduct|undefined)[]>(_.get(props, 'leadInfo.products', []));

  useEffect(() => {
    searchProducts('');
  }, []);

  const candidates: any = [props.leadInfo.customer._id];
  _.get(props.leadInfo, 'customer.family', []).forEach((familyMember: any) => candidates.push(familyMember._id));

  const selectedProducts: any[] = candidateProducts.filter((candidateProduct) => candidateProduct && candidateProduct.product).map((candidateProduct) => _.get(candidateProduct, 'product'));
  const renderProducts = [...selectedProducts, ...products];
  const renderProductsByIds = _.mapKeys(renderProducts, '_id');
  const productsDataSource = _.values(renderProductsByIds).map((course) => {
    return {
      value: course._id,
      text: course.name,
    };
  });

  const addEmptyCandidateProduct = () => {
    setCandidateProducts([...candidateProducts, undefined]);
  };

  const deleteCandidateProduct = (index: number) => {
    setCandidateProducts(candidateProducts.filter((_item, i) => i !== index));
  };

  const searchProducts = async (searchKeyword: string) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);

    const searchProductsResult = await serviceProxy.findProducts(
      searchKeyword,
      undefined,
      undefined,
      undefined,
      true,
      10,
      1,
      'createdAt|desc',
    );

    setProducts(searchProductsResult.data);
  };

  const handleCandidateChange = (newCandidateId: string, index: number) => {
    const selectedCandidate = _.mapKeys(candidates, '_id')[newCandidateId];

    setCandidateProducts(produce(candidateProducts, (draftState) => {
      if (draftState[index]) {
        draftState[index]!.candidate = selectedCandidate;
      } else {
        draftState[index] = {
          candidate: selectedCandidate,
        } as any;
      }
    }));
  };

  const handleProductChange = (newProductId: string, index: number) => {
    const selectedProduct = _.mapKeys(renderProducts, '_id')[newProductId];

    setCandidateProducts(produce(candidateProducts, (draftState) => {
      if (draftState[index]) {
        draftState[index]!.product = selectedProduct;
      } else {
        draftState[index] = {
          product: selectedProduct,
        } as any;
      }
    }));
  };

  const saveLeadProducts = async () => {
    try {
      setLoading(true);

      const updateCandidateProducts: any = [];
      candidateProducts.forEach((candidateProduct) => {
        if (candidateProduct && candidateProduct.candidate && candidateProduct.product) {
          updateCandidateProducts.push({
            candidate: candidateProduct.candidate._id,
            product: candidateProduct.product._id,
          });
        }
      });
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      const newLeadInfo = await serviceProxy.updateLeadProducts(props.leadInfo._id, {
        products: updateCandidateProducts,
      });
      props.changeInput(newLeadInfo);
      notification.success({
        message: 'Update lead product success',
        placement: 'bottomRight',
      });
    } catch (error) {
      notification.error({
        message: 'Update lead product failed',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const makeOrderFromProducts = async () => {
    try {
      setLoadingMakeOrder(true);

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      const orderItems = _.get(props, 'leadInfo.products', []).map((leadProduct: LeadProduct) => {
        return {
          product: leadProduct.product._id,
          candidate: leadProduct.candidate._id,
        };
      });
      const newLeadInfo = await serviceProxy.createLeadOrder(props.leadInfo._id, {
        orderItems,
      });
      props.changeInput(newLeadInfo);
      notification.success({
        message: 'Make order from product success',
        placement: 'bottomRight',
      });
    } catch (error) {
      notification.error({
        message: 'Make order failed',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      setLoadingMakeOrder(false);
    }
  };

  const disabledMakeOrder = !!_.get(props.leadInfo, 'order');
  return (
    <>
      <Row gutter={16}>
        <Col xs={2}></Col>
        <Col xs={11}>
          <Typography.Title level={4}>Candidates</Typography.Title>
        </Col>
        <Col xs={11}>
          <Typography.Title level={4}>Products</Typography.Title>
        </Col>
      </Row>

      {candidateProducts.map((candidateProduct, index) => {
        return (
          <Row gutter={16} style={{marginBottom: '24px'}}>
            <Col xs={2}>
              <Button type='danger' size='small' icon='delete' onClick={() => deleteCandidateProduct(index)} />
            </Col>
            <Col xs={11}>
              <Select
                value={_.get(candidateProduct, 'candidate._id')}
                style={{ width: '100%' }}
                onChange={(value: string) => handleCandidateChange(value, index)}
              >
                {candidates.map((candidate: Contact) => {
                  return (
                    <Select.Option value={candidate._id}>{candidate.fullName}</Select.Option>
                  );
                })}
              </Select>
            </Col>
            <Col xs={11}>
              <AutoComplete
                dataSource={productsDataSource}
                style={{ width: '100%' }}
                onSelect={((value: string) => handleProductChange(value, index)) as any}
                onSearch={searchProducts}
                defaultValue={_.get(candidateProduct, 'product._id')}
                placeholder=''
              />
            </Col>
          </Row>
        );
      })}

      <Row gutter={16}>
        <Col xs={2}>
          <Button type='primary' size='small' icon='plus' onClick={addEmptyCandidateProduct} />
        </Col>
        <Col xs={11}></Col>
        <Col xs={11}></Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} style={{marginTop: '24px', textAlign: 'right'}}>
          {/* {_.get(props.leadInfo, 'products.length', 0) > 0 ? (
            <Button type='primary' style={{marginRight: '24px'}} onClick={makeOrderFromProducts} loading={loadingMakeOrder} disabled={loading || disabledMakeOrder}>
              Make order
            </Button>
          ) : null} */}
          <Button type='primary' loading={loading} onClick={saveLeadProducts} disabled={loadingMakeOrder}>
            Save changes
          </Button>
        </Col>
      </Row>
    </>
  );
};
