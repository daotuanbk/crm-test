import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Typography, Button, Select, AutoComplete, InputNumber, notification } from 'antd';
import { Lead, LeadProduct, Product, Contact, PromotionDiscountType, PromotionType, Promotion, Customer } from '@client/services/service-proxies';
import _ from 'lodash';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { produce } from 'immer';
import { getErrorMessage } from '@client/core';

interface Props {
  visible: boolean;
  leadInfo: Lead;
  closeModal: () => void;
  changeInput: (values: (Customer|Lead)) => void;
}

type CandidateProduct = LeadProduct & {promotion: Promotion};

export const MakeOrderModal = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [candidateProducts, setCandidateProducts] = useState<(CandidateProduct|undefined)[]>(_.get(props, 'leadInfo.order.productItems', []));

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

  const handleDiscountTypeChange = (discountType: string, index: number) => {
    setCandidateProducts(produce(candidateProducts, (draftState) => {
      if (draftState[index]) {
        draftState[index]!.promotion = {
          ..._.get(draftState[index], 'promotion', {}),
          discountType,
        } as any;
      } else {
        draftState[index] = {
          promotion: {
            promotionType: PromotionType.SalesmanInput,
            discountType,
          },
        } as any;
      }
    }));
  };

  const handleDiscountValueChange = (discountValue: number, index: number) => {
    setCandidateProducts(produce(candidateProducts, (draftState) => {
      if (draftState[index]) {
        draftState[index]!.promotion = {
          ..._.get(draftState[index], 'promotion', {}),
          value: discountValue,
          percent: discountValue,
        } as any;
      } else {
        draftState[index] = {
          promotion: {
            promotionType: PromotionType.SalesmanInput,
            value: discountValue,
            percent: discountValue,
          },
        } as any;
      }
    }));
  };

  const makeOrder = async () => {
    try {
      setLoading(true);

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      const orderItems: any = [];
      candidateProducts.forEach((candidateProduct) => {
        if (candidateProduct && candidateProduct.candidate && candidateProduct.product) {
          const orderItemInfo: any = {
            candidate: candidateProduct.candidate._id,
            product: candidateProduct.product._id,
          };
          if (candidateProduct.promotion) {
            orderItemInfo.promotion = {
              ...candidateProduct.promotion,
              promotionType: PromotionType.SalesmanInput,
            };
          }
          orderItems.push(orderItemInfo);
        }
      });

      const newLeadInfo = await serviceProxy.createLeadOrder(props.leadInfo._id, {
        orderItems,
      });
      props.changeInput(newLeadInfo);
      props.closeModal();
      notification.success({
        message: 'Make order success',
        placement: 'bottomRight',
      });
    } catch (error) {
      notification.error({
        message: 'Make order failed',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const disabledSubmitButton = !!(candidateProducts.length <= 0);
  return (
    <Modal
      title='Order'
      width={1000}
      visible={props.visible}
      onCancel={props.closeModal}
      confirmLoading={loading}
      okButtonProps={{
        disabled: disabledSubmitButton,
      }}
      onOk={makeOrder}
    >
      <Row gutter={16}>
        <Col xs={2}></Col>
        <Col xs={7}>
          <Typography.Title level={4}>Candidates</Typography.Title>
        </Col>
        <Col xs={7}>
          <Typography.Title level={4}>Products</Typography.Title>
        </Col>
        <Col xs={8}>
          <Typography.Title level={4}>Discount</Typography.Title>
        </Col>
      </Row>

      {candidateProducts.map((candidateProduct, index) => {
        let discountValue = 0;
        if (_.get(candidateProduct, 'promotion.discountType') === PromotionDiscountType.Value) {
          discountValue = _.get(candidateProduct, 'promotion.value', 0);
        } else if (_.get(candidateProduct, 'promotion.discountType') === PromotionDiscountType.Percent) {
          discountValue = _.get(candidateProduct, 'promotion.percent', 0);
        }

        return (
          <Row gutter={16} style={{marginBottom: '24px'}}>
            <Col xs={2}>
              <Button type='danger' size='small' icon='delete' onClick={() => deleteCandidateProduct(index)} />
            </Col>
            <Col xs={7}>
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
            <Col xs={7}>
              <AutoComplete
                dataSource={productsDataSource}
                style={{ width: '100%' }}
                onSelect={((value: string) => handleProductChange(value, index)) as any}
                onSearch={searchProducts}
                defaultValue={_.get(candidateProduct, 'product._id')}
                placeholder=''
              />
            </Col>
            <Col xs={4}>
              <Select
                value={_.get(candidateProduct, 'promotion.discountType')}
                style={{ width: '100%' }}
                onChange={(value: string) => handleDiscountTypeChange(value, index)}
              >
                <Select.Option value={PromotionDiscountType.Percent}>{PromotionDiscountType.Percent}</Select.Option>
                <Select.Option value={PromotionDiscountType.Value}>{PromotionDiscountType.Value}</Select.Option>
              </Select>
            </Col>
            <Col xs={4}>
              <InputNumber
                style={{width: '100%'}}
                value={discountValue}
                onChange={((value: number) => handleDiscountValueChange(value, index)) as any}
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
    </Modal>
  );
};
