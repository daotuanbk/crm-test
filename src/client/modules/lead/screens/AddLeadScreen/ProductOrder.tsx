import React from 'react';
import { BorderWrapper } from '@client/components';
import { Row, Col, Input, Select, Icon, Button } from 'antd';
import uuid from 'uuid';
import { translate } from '@client/i18n';

interface State {
  //
}
interface Props {
  context: any;
  data: any;
  changeInput: (payload: any) => void;
  validateSchema: any;
  courses: any;
  combos: any;
  calculateTuitionBD: () => number;
  calculateTuitionAD: () => number;
  changeCombo: (payload: string) => void;
  unknownCourse: string | undefined;
}
export class ProductOrder extends React.Component<Props, State> {
  state: State = {
    //
  };

  addCourse = () => {
    this.props.changeInput({
      courses: [...this.props.data.courses, {
        index: uuid.v4(),
        courseId: this.props.unknownCourse,
        discountType: 'PERCENT',
        discountValue: 0,
        showDiscount: false,
      }],
    });
  }

  removeCourse = (id: string) => {
    this.props.changeInput({
      courses: this.props.data.courses.filter((val: any) => val.index !== id),
    });
  }

  selectCourse = (id: string, value: any) => {
    this.props.changeInput({
      courses: this.props.data.courses.map((val: any) => {
        if (val.index === id) {
          val.courseId = value;
          return val;
        } else {
          return val;
        }
      }),
    });
  }

  showDiscountCourse = (id: string) => {
    this.props.changeInput({
      courses: this.props.data.courses.map((val: any) => {
        if (val.index === id) {
          val.showDiscount = true;
          return val;
        } else {
          return val;
        }
      }),
    });
  }

  hideDiscountCourse = (id: string) => {
    this.props.changeInput({
      courses: this.props.data.courses.map((val: any) => {
        if (val.index === id) {
          val.showDiscount = false;
          val.discountValue = 0;
          val.discountType = 'PERCENT';
          return val;
        } else {
          return val;
        }
      }),
    });
  }

  changeDiscountValue = (id: string, value: any) => {
    this.props.changeInput({
      courses: this.props.data.courses.map((val: any) => {
        if (val.index === id) {
          val.discountValue = value;
          return val;
        } else {
          return val;
        }
      }),
    });
  }

  changeDiscountType = (id: string, value: any) => {
    this.props.changeInput({
      courses: this.props.data.courses.map((val: any) => {
        if (val.index === id) {
          val.discountType = value;
          return val;
        } else {
          return val;
        }
      }),
    });
  }

  render() {
    return (
      <div className='wrapper-relation'>
        <h3>{translate('lang:productOrder')}</h3>
        <BorderWrapper>
          <Row gutter={20} type='flex'>
            <Col xs={24} style={{ display: 'flex', padding: 0 }}>
              <Col xs={12}>
                <div>
                  <div style={{ marginBottom: 3 }}>{translate('lang:combo')} </div>
                  <Select style={{ width: '100%' }} onChange={(val: string) => this.props.changeCombo(val)}>
                    <Select.Option value={undefined} key={'0'}>{translate('lang:noCombo')}</Select.Option>
                    {this.props.combos.map((val: any) => {
                      return <Select.Option value={val._id} key={val._id}>{val.name}</Select.Option>;
                    })}
                  </Select>
                </div>
              </Col>
            </Col>
            <Col xs={24} style={{ padding: 0 }}>
              {this.props.data.courses.map((_val: any, _index: any) => {
                return (
                  <Col xs={24} style={{ display: 'flex' }} key={_val.index}>
                    <Col xs={12} style={{ marginTop: '20px', paddingLeft: '0px' }}>
                      <div>
                        <div style={{ marginBottom: 3 }}>{translate('lang:course')}</div>
                        <Select style={{ width: '100%' }} value={String(_val.courseId)} key={_val.index} onChange={(value) => this.selectCourse(_val.index, value)}>
                          {this.props.courses.map((val: any) => {
                            return <Select.Option value={String(val._id)} key={val._id}>{val.name}</Select.Option>;
                          })}
                        </Select>
                      </div>
                    </Col>
                    {/* <Col xs={5} style={{marginTop: '20px'}}>
                      <div>
                        <div>Discount from combo</div>
                        <Input type='text' disabled value={combo ? this.checkComboCondition(_index) !== 'NONE' ? (combo.discountValue && combo.discountType ?
                          (combo.discountType === 'PERCENT') ? combo.discountValue + ' %' : combo.discountValue + ' VND' : 0) : 0 : 0}></Input>
                      </div>
                    </Col> */}
                    {
                      _val.showDiscount ? <Col xs={12} style={{ marginTop: '20px', display: 'flex' }}>
                        <Col xs={12}>
                          <div style={{ marginBottom: 3 }}>{translate('lang:additionalDiscount')}</div>
                          <Input value={_val.discountValue} type='number' onChange={(e) => this.changeDiscountValue(_val.index, e.target.value)}></Input>
                        </Col>
                        <Col xs={9} style={{ display: 'flex', alignItems: 'flex-end' }}>
                          <Select style={{ width: '100%' }} value={_val.discountType} onChange={(value) => this.changeDiscountType(_val.index, value)}>
                            <Select.Option key='1' value='PERCENT'>%</Select.Option>
                            <Select.Option key='2' value='AMOUNT'>VND</Select.Option>
                          </Select>
                        </Col>
                        <Col xs={4} style={{ display: 'flex', alignItems: 'flex-end' }}>
                          <Icon type='close-circle' onClick={() => this.hideDiscountCourse(_val.index)} style={{ fontSize: '24px', cursor: 'pointer', marginBottom: '2px', color: '#1890ff' }} />
                          {_index >= 1 ? <Icon onClick={() => this.removeCourse(_val.index)} type='delete'
                            style={{ fontSize: '24px', marginLeft: '10px', cursor: 'pointer', marginBottom: '2px', color: '#1890ff' }}></Icon> : null}
                        </Col>
                      </Col> : <Col xs={12} style={{ marginTop: '20px', display: 'flex', alignItems: 'flex-end' }}>
                          <a onClick={() => this.showDiscountCourse(_val.index)}>Add discount</a>
                          {_index >= 1 ? <a onClick={() => this.removeCourse(_val.index)} type='delete'
                            style={{ marginLeft: '10px', cursor: 'pointer' }}>Delete</a> : null}
                        </Col>
                    }
                  </Col>
                );
              })}
            </Col>
            <Col xs={12} className='has-end-flex'>
              <Button
                type='primary' ghost
                icon='plus'
                onClick={() => this.addCourse()}
                style={{ marginTop: '24px', cursor: 'pointer' }}>
                Add more course</Button>
            </Col>
            <Col xs={24} style={{ marginTop: '20px', padding: 0 }}>
              <Col xs={12}>
                <div>{translate('lang:tuitionBeforeDiscount')}: {this.props.calculateTuitionBD().toLocaleString()} VND</div>
              </Col>
              <Col xs={12}>
                <div>{translate('lang:tuitionAfterDiscount')}: {this.props.calculateTuitionAD().toLocaleString()} VND</div>
              </Col>
            </Col>
          </Row>
        </BorderWrapper>
      </div>
    );
  }
}
