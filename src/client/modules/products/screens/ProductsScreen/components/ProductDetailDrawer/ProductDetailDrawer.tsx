import React, { useState, useEffect } from 'react';
import { Drawer, Typography, Form, Input, Row, Col, InputNumber, Select, Button } from 'antd';
import { Formik, FormikActions, FormikContext } from 'formik';
import _ from 'lodash';
import * as yup from 'yup';
import { Product, ProductCategory, ProductLine, ProductType, LmsCourse } from '@client/services/service-proxies';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';

interface Props {
  visible: boolean;
  loading: boolean;
  productInfo?: Product;
  closeProductDetailDrawer: () => void;
  handleProductFormSubmit: (values: any, formikBag: FormikActions<any>) => void;
}

export const ProductDetailDrawer = (props: Props) => {
  const [courses, setCourses] = useState<LmsCourse[]>(_.get(props, 'productInfo.single.course') ? [_.get(props, 'productInfo.single.course')] : []);

  useEffect(() => {
    findCourses('');
  }, []);

  const findCourses = async (searchKeyword: string) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);

    const getCoursesResult = await serviceProxy.findLmsCourses(
      searchKeyword,
      undefined,
      100,
      1,
      'createdAt|desc',
    );

    if (_.get(props, 'productInfo._id') && _.get(props, 'productInfo.single.course')) {
      setCourses([..._.get(getCoursesResult, 'data', []), _.get(props, 'productInfo.single.course')]);
    } else {
      setCourses(getCoursesResult.data);
    }
  };

  const initialValues = {
    name: _.get(props.productInfo, 'name', ''),
    code: _.get(props.productInfo, 'code', ''),
    price: _.get(props.productInfo, 'price', 0),
    category: _.get(props.productInfo, 'category', ''),
    productLine: _.get(props.productInfo, 'productLine', ''),
    type: _.get(props.productInfo, 'type', ''),
    course: _.get(props.productInfo, 'single.course._id', ''),
    maxCourses: _.get(props.productInfo, 'combo.maxCourses', 0),
    maxDuration: _.get(props.productInfo, 'special.maxDuration', 0),
    isActive: _.get(props.productInfo, 'isActive', true),
    selectableCourses: _.get(props.productInfo, 'type', '') === ProductType.Combo
      ? _.get(props.productInfo, 'combo.selectableCourses', []).map((item: Product) => item._id)
      : _.get(props.productInfo, 'special.selectableCourses', []).map((item: Product) => item._id),
  };

  const productValidationSchema = yup.object().shape({
    name: yup.string().required('Product name must be specified'),
    code: yup.string().required('Product code must be specified'),
    price: yup.number().required('Product price must be specified')
      .min(1000, 'Invalid price (>= 1000 VND)'),
    category: yup.string().required('Category must be specifeid')
      .oneOf([ProductCategory.Kids, ProductCategory.Teens, '18+'], 'Invalid product category'),
    productLine: yup.string().nullable(true)
      .oneOf([
        ProductLine.App,
        ProductLine.C4E,
        ProductLine.Data,
        ProductLine.Game,
        ProductLine.Other,
        ProductLine.Web,
      ], 'Invalid product line'),
    type: yup.string().required('Product type must be specified')
      .oneOf([ProductType.Combo, ProductType.Single, ProductType.Special], 'Invalid product type'),
    course: yup.string()
      .when('type', {
        is: (type) => type === ProductType.Single,
        then: yup.string()
          .required('Product course must be specified'),
      }),
    maxCourses: yup.number()
      .when('type', {
        is: (type) => type === ProductType.Combo,
        then: yup.number()
          .required('Number of course in combo must be specified')
          .min(0, 'Invalid max number of courses (> 0)'),
      }),
    maxDuration: yup.number()
      .when('type', {
        is: (type) => type === ProductType.Special,
        then: yup.number()
          .required('Duration must be specified')
          .min(0, 'Invalid max number of duration (> 0)'),
      }),
    isActive: yup.bool().nullable(true),
    selectableCourses: yup.array().nullable(true)
      .when('type', {
        is: (type) => type === ProductType.Special || type === ProductType.Combo,
        then: yup.array()
          .required('Selectable courses must be specified')
          .test('Min length', 'Invalid selectable courses (> 0)', (value: string[]) => {
            return value.length > 0;
          }),
    }),
  });

  const isEdit = !!_.get(props, 'productInfo._id');

  return (
    <Drawer
      placement='right'
      closable={false}
      width={1000}
      onClose={props.closeProductDetailDrawer}
      visible={props.visible}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={productValidationSchema}
        onSubmit={props.handleProductFormSubmit}
      >
        {(context: FormikContext<any>) => {
          const { errors, values, handleChange, setFieldValue, handleSubmit } = context;

          const over18Lines = [ProductLine.C4E, ProductLine.App, ProductLine.Web, ProductLine.Data, ProductLine.Other];
          const otherCategoriesLines = [ProductLine.Game, ProductLine.Web, ProductLine.Other];
          let productLineOptions: any = [];
          if (values.category === '18+') {
            productLineOptions = over18Lines;
          } else if (values.category === ProductCategory.Kids || values.category === ProductCategory.Teens) {
            productLineOptions = otherCategoriesLines;

          }

          const renderProductTypeChildren = () => {
            if (values.type === ProductType.Single) {
              return (
                <Form.Item
                  label='Course'
                  validateStatus={errors.course ? 'error' : undefined}
                  help={errors.course}
                >
                  <Select
                    showSearch={true}
                    disabled={isEdit}
                    style={{ width: '100%' }}
                    onSelect={((value: string) => setFieldValue('course', value)) as any}
                    onSearch={(value: string) => findCourses(value)}
                    value={values.course}
                    filterOption={() => true}
                    placeholder=''
                  >
                    {courses.map((courseInfo) => {
                      return (
                        <Select.Option value={courseInfo._id} key={courseInfo._id}>{courseInfo.title}</Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              );
            } else if (values.type === ProductType.Combo) {
              return (
                <Form.Item
                  label='Limited course'
                  validateStatus={errors.maxCourses ? 'error' : undefined}
                  help={errors.maxCourses}
                >
                  <InputNumber
                    disabled={isEdit}
                    style={{width: '100%'}}
                    name='maxCourses'
                    value={values.maxCourses}
                    onChange={((value: number) => setFieldValue('maxCourses', value)) as any}
                  />
                </Form.Item>
              );
            } else if (values.type === ProductType.Special) {
              return (
                <Form.Item
                  label='Limited duration'
                  validateStatus={errors.maxDuration ? 'error' : undefined}
                  help={errors.maxDuration}
                >
                  <InputNumber
                    disabled={isEdit}
                    style={{width: '100%'}}
                    name='maxDuration'
                    value={values.maxDuration}
                    onChange={((value: number) => setFieldValue('maxDuration', value)) as any}
                  />
                </Form.Item>
              );
            }
            return null;
          };

          return (
            <Form onSubmit={handleSubmit}>
              <Typography.Title level={2}>Infomation</Typography.Title>

              <Form.Item
                label='Product name'
                validateStatus={errors.name ? 'error' : undefined}
                help={errors.name}
              >
                <Input
                  disabled={isEdit}
                  name='name'
                  value={values.name}
                  onChange={handleChange}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={12}>
                  <Form.Item
                    label='Code'
                    validateStatus={errors.code ? 'error' : undefined}
                    help={errors.code}
                  >
                    <Input
                      disabled={isEdit}
                      name='code'
                      value={values.code}
                      onChange={handleChange}
                    />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item
                    label='Price'
                    validateStatus={errors.price ? 'error' : undefined}
                    help={errors.price}
                  >
                    <InputNumber
                      style={{width: '100%'}}
                      name='price'
                      value={values.price}
                      onChange={((value: number) => setFieldValue('price', value)) as any}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={12}>
                  <Form.Item
                    label='Category'
                    validateStatus={errors.category ? 'error' : undefined}
                    help={errors.category}
                  >
                    <Select
                      disabled={isEdit}
                      value={values.category}
                      onChange={(value: string) => {
                        setFieldValue('category', value);
                        setFieldValue('productLine', '');
                      }}
                    >
                      <Select.Option value={ProductCategory.Kids}>{ProductCategory.Kids}</Select.Option>
                      <Select.Option value={ProductCategory.Teens}>{ProductCategory.Teens}</Select.Option>
                      <Select.Option value={'18+'}>{'18+'}</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item
                    label='Line'
                    validateStatus={errors.productLine ? 'error' : undefined}
                    help={errors.productLine}
                  >
                    <Select
                      disabled={isEdit}
                      value={values.productLine}
                      onChange={(value: string) => setFieldValue('productLine', value)}
                    >
                      {productLineOptions.map((line: any) => {
                        return (
                          <Select.Option value={line}>{line}</Select.Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Typography.Title level={2} style={{marginTop: '24px'}}>Criteria</Typography.Title>

              <Row gutter={16}>
                <Col xs={12}>
                  <Form.Item
                    label='Type'
                    validateStatus={errors.type ? 'error' : undefined}
                    help={errors.type}
                  >
                    <Select
                      value={values.type}
                      disabled={isEdit}
                      onChange={(value: string) => setFieldValue('type', value)}
                    >
                      <Select.Option value={ProductType.Single}>{ProductType.Single}</Select.Option>
                      <Select.Option value={ProductType.Combo}>{ProductType.Combo}</Select.Option>
                      <Select.Option value={ProductType.Special}>{ProductType.Special}</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item
                    label='Status'
                    validateStatus={errors.isActive ? 'error' : undefined}
                    help={errors.isActive}
                  >
                    <Select
                      value={values.isActive}
                      onChange={(value: string) => setFieldValue('isActive', value)}
                    >
                      <Select.Option value={true as any}>Active</Select.Option>
                      <Select.Option value={false as any}>Detactive</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={12}>
                  {renderProductTypeChildren()}
                </Col>
                <Col xs={12}>
                  {values.type === ProductType.Combo || values.type === ProductType.Special ? (
                    <Form.Item
                      label='Selectable courses'
                      validateStatus={errors.selectableCourses ? 'error' : undefined}
                      help={errors.selectableCourses}
                    >
                      <Select
                        showSearch={true}
                        mode='multiple'
                        style={{ width: '100%' }}
                        onSelect={((value: string) => setFieldValue('selectableCourses', [..._.get(values, 'selectableCourses', []), value])) as any}
                        onDeselect={(value: string) => {
                          const newSelectableCourses = _.get(values, 'selectableCourses', []).filter((course: string) => course !== value);
                          setFieldValue('selectableCourses', newSelectableCourses);
                        }}
                        onSearch={(value: string) => findCourses(value)}
                        value={_.get(values, 'selectableCourses', [])}
                        filterOption={() => true}
                        placeholder=''
                      >
                        {courses.map((courseInfo) => {
                          return (
                            <Select.Option value={courseInfo._id} key={courseInfo._id}>{courseInfo.title}</Select.Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  ) : null}
                </Col>
              </Row>

              <Row>
                <Col xs={24} style={{textAlign: 'right'}}>
                  <Button type='primary' htmlType='submit' loading={props.loading}>
                    {_.get(props, 'productInfo._id') ? 'Save' : 'Create'}
                  </Button>
                </Col>
              </Row>
            </Form>
          );
        }}
      </Formik>
    </Drawer>
  );
};
