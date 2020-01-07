import React from 'react';
import { SectionBox, TableList } from '@client/components';
import { Row, Col, Icon, Switch, message, Modal, Input, Button } from 'antd';
import { translate } from '@client/i18n';
import { get } from 'lodash';
import moment from 'moment';
import { PaymentTransactionModal } from '@client/modules/collect-tuition';
import { EditTuitionModal } from '../EditTuitionModal';
import { EditPaymentDueDateModal } from '../EditPaymentDueDateModal';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { CREATE_TRANSACTION_TEMPLATE } from '@client/core';

interface Props {
  tuitionAD: number;
  data: any;
  transactions: any;
  createPaymentTransaction: (payload: any) => Promise<void>;
  checkComboConditionForCourse: (index: number, combo: any, courses: any) => string;
  changeInput: (payload: any, callback?: any) => void;
  updateLead: (payload: any) => Promise<void>;
  updateRemainingAndTuitionAD: () => Promise<void>;
  updateCourse: (payload: any, noMessage?: boolean) => Promise<void>;
  editPaymentTransaction: (id: string, payload: any) => Promise<void>;
  changeTransaction: (payload: any) => void;
  addTransaction: (payload: any) => void;
}

interface State {
  loading: boolean;
  newPayment: any;
  displayPayment: boolean;
  displayTuition: boolean;
  editTuitionModal: boolean;
  editTuitionData: any;
  editPaymentModal: boolean;
  editPaymentData: any;
  paymentDueDateModal: boolean;
  updatedDueDate: any;
  createPaymentModal: boolean;
}

let transactionEditor = {};
let transactionSubject = {};
export class TuitionInfo extends React.Component<Props, State> {
  state: State = {
    loading: false,
    newPayment: {
      paymentType: undefined,
      amount: 0,
      note: undefined,
    },
    displayPayment: true,
    displayTuition: true,
    editTuitionModal: false,
    editTuitionData: {
      discountType: 'PERCENT',
      discountValue: 0,
    },
    editPaymentModal: false,
    editPaymentData: {
      paymentType: undefined,
      amount: 0,
      note: undefined,
    },
    paymentDueDateModal: false,
    updatedDueDate: undefined,
    createPaymentModal: false,
  };

  toggleDisplayTuition = () => {
    this.setState({
      displayTuition: !this.state.displayTuition,
    });
  }

  toggleEditTuitionModal = (visible: boolean, record?: any, index?: number) => {
    this.setState({
      editTuitionModal: visible,
      loading: false,
      editTuitionData: record ? {
        ...record,
        indexInTable: index,
      } : {
          discountType: 'PERCENT',
          discountValue: 0,
        },
    });
  }

  toggleDisplayPayment = () => {
    this.setState({
      displayPayment: !this.state.displayPayment,
    });
  }

  toggleEditPaymentTransactionModal = (visible: boolean, record?: any) => {
    this.setState({
      editPaymentModal: visible,
      editPaymentData: record ? record : {
        paymentType: undefined,
        amount: 0,
        note: undefined,
      },
    });
  }

  togglePaymentDueDateModal = (visible: boolean) => {
    this.setState({
      paymentDueDateModal: visible,
    });
  }

  changeKeepBadDepts = async (checked: boolean) => {
    this.props.changeInput({
      keepBadDepts: checked,
    });
    await this.props.updateLead({
      keepBadDepts: checked,
    });
  }

  editTuition = async () => {
    this.setState({
      loading: true,
    });

    const courses = this.props.data.productOrder.courses.map((val: any) => {
      if (val._id === this.state.editTuitionData._id) {
        return {
          ...val,
          ...this.state.editTuitionData,
        };
      } else {
        return val;
      }
    });
    this.props.changeInput({
      productOrder: {
        courses,
      },
    }, async () => {
      await this.props.updateRemainingAndTuitionAD();
    });
    await this.props.updateCourse({
      courseId: this.state.editTuitionData._id,
      discountType: this.state.editTuitionData.discountType,
      discountValue: this.state.editTuitionData.discountValue,
    });
    this.toggleEditTuitionModal(false);
  }

  changeEditTuitionInput = async (payload: any) => {
    this.setState({
      editTuitionData: {
        ...this.state.editTuitionData,
        ...payload,
      },
    });
  }

  editNewPayment = async (data: any) => {
    this.setState({
      loading: true,
    });

    if (data && data.paymentType === 'Change') {
      data.amount = Number(data.amount || 0) * -1;
    }
    await this.props.editPaymentTransaction(this.state.editPaymentData._id, {
      ...this.state.editPaymentData,
      ...data,
    });
    this.props.changeTransaction({
      ...this.state.editPaymentData,
      ...data,
    });
    await this.props.updateRemainingAndTuitionAD();
    this.setState({
      editPaymentData: {
        paymentType: undefined,
        amount: 0,
        note: undefined,
      },
      editPaymentModal: false,
      loading: false,
    });
  }

  updatePaymentDueDate = async () => {
    this.setState({
      loading: true,
    });

    try {
      if (this.state.updatedDueDate) {
        this.props.changeInput({
          paymentDueAt: this.state.updatedDueDate,
        });
        await this.props.updateLead({
          paymentDueAt: this.state.updatedDueDate,
        });
        this.togglePaymentDueDateModal(false);
        message.success('Updated successfully!');
      }
    } catch (error) {
      message.error(error.message || 'Internal server error');
    } finally {
      this.setState({
        loading: true,
      });
    }
  }

  changeDueDate = (date: any) => {
    this.setState({
      updatedDueDate: date,
    });
  }

  toggleCreatePaymentTransactionModal = (visible: boolean) => {
    this.setState({
      createPaymentModal: visible,
    });
  }

  createNewPayment = async (data: any) => {
    this.setState({
      loading: true,
    });

    if (data && data.paymentType === 'Change') {
      data.amount = Number(data.amount || 0) * -1;
    }
    this.props.addTransaction({
      ...this.state.newPayment,
      ...data,
      createdAt: new Date(),
    });

    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);

    const templateConfig = await serviceProxy.findEmailTemplateConfigByName(CREATE_TRANSACTION_TEMPLATE) as any;

    if (templateConfig && templateConfig.data) {
      const dataEmail = templateConfig.data.data && templateConfig.data.data.length ? templateConfig.data.data.map((val: any) => {
        const studentName = this.props.data.contact ? this.props.data.contact.fullName : '';
        const html = val.template && val.template.text ? val.template.text.replace(/@student_name/g, studentName)
          .replace(/@transaction_type/g, data.paymentType)
          .replace(/@transaction_amount/g, `${Math.abs(Number(data.amount)).toLocaleString()} VND`) : '';
        const subject = val.template && val.template.subject ? val.template.subject.replace(/@student_name/g, studentName)
          .replace(/@transaction_type/g, data.paymentType)
          .replace(/@transaction_amount/g, `${Math.abs(Number(data.amount)).toLocaleString()} VND`) : '';
        let recipient = '';
        if (val.recipient === 'student') {
          recipient = this.props.data.contact ? this.props.data.contact.email : '';
        } else if (val.recipient === 'saleman') {
          recipient = this.props.data.owner ? this.props.data.owner.email : '';
        }
        if (recipient && html && subject) {
          transactionEditor[recipient] = null;
          return {
            recipient,
            html,
            subject,
          };
        } else {
          return null;
        }
      }).filter((v: any) => v) : [];

      const updateTemplate = async (editor: any, editorSubject: any) => {
        try {
          const promises = templateConfig.data.data && templateConfig.data.data.length ? templateConfig.data.data.map((val: any) => {
            let recipient = '';
            if (val.recipient === 'student') {
              recipient = this.props.data.contact ? this.props.data.contact.email : '';
            } else if (val.recipient === 'saleman') {
              recipient = this.props.data.owner ? this.props.data.owner.email : '';
            }
            if (recipient) {
              let templateHtml = editor[recipient] && editor[recipient].innerHTML ? editor[recipient].innerHTML : val.template.text;
              let subject = editorSubject[recipient] || val.template.subject;
              const studentName = this.props.data.contact ? this.props.data.contact.fullName : '';
              const transactionAmount = `${Math.abs(Number(data.amount)).toLocaleString()} VND`;
              const transactionType = data.paymentType;
              if (studentName) {
                const regex = new RegExp(studentName, 'g');
                templateHtml = templateHtml.replace(regex, '@student_name');
                subject = subject.replace(regex, '@student_name');
              }
              if (transactionAmount) {
                const regex = new RegExp(transactionAmount, 'g');
                templateHtml = templateHtml.replace(regex, '@transaction_amount');
                subject = subject.replace(regex, '@transaction_amount');
              }
              if (transactionType) {
                const regex = new RegExp(transactionType, 'g');
                templateHtml = templateHtml.replace(regex, '@transaction_type');
                subject = subject.replace(regex, '@transaction_type');
              }
              if (val.template && val.template._id) {
                return serviceProxy.updateEmailTemplate(val.template._id, {
                  operation: 'updateDetail',
                  payload: {
                    text: templateHtml,
                    subject,
                  },
                });
              }
            }
            return null;
          }) : [];

          await Promise.all(promises);
          message.success(translate('lang:updateSuccess'), 3);
        } catch (err) {
          message.error(err.message || translate('lang:internalError'));
        }
      };

      const confirmUpdateTemplate = (editor: any, subjectEditor: any) => {
        Modal.confirm({
          title: translate('lang:updateTemplateConfirm'),
          okText: 'Confirm',
          onOk: async () => await updateTemplate(editor, subjectEditor),
        });
      };

      if (dataEmail && dataEmail.length) {
        Modal.confirm({
          title: translate('lang:automailConfirmTitle'),
          width: '900px',
          content: <div>
            <h3>{translate('lang:automailConfirm')}</h3>
            <hr></hr>
            <div>
              {dataEmail.map((val: any) => {
                return <div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h4 style={{ marginRight: '10px' }}>{translate('lang:subject')}:</h4>
                    <Input
                      defaultValue={val.subject}
                      onChange={(e: any) => {
                        transactionSubject[val.recipient] = e.target.value;
                      }} />
                  </div>
                  <h4>{translate('lang:recipient')}: {val.recipient}</h4>
                  <h4> {translate('lang:content')}: </h4>
                  <div ref={(ele: any) => transactionEditor[val.recipient] = ele} dangerouslySetInnerHTML={{ __html: val.html }} contentEditable={true} />
                  <hr></hr>
                </div>;
              })}
            </div>
            <Row>
              <Col xs={12}>
                <Button style={{ minHeight: '32px', position: 'absolute', bottom: '-56px' }} type='default' onClick={() => confirmUpdateTemplate(transactionEditor, transactionSubject)}>
                  {translate('lang:updateTemplate')}
                </Button>
              </Col>
            </Row>
          </div>,
          onOk: async () => {
            for (const property in transactionEditor) {
              if (transactionEditor.hasOwnProperty(property)) {
                transactionEditor[property] = transactionEditor[property].innerHTML;
              }
            }
            await this.props.createPaymentTransaction({
              ...this.state.newPayment,
              ...data,
              sendAutoMail: true,
              html: transactionEditor,
            });
            await this.props.updateRemainingAndTuitionAD();
            this.setState({
              newPayment: {
                paymentType: undefined,
                amount: 0,
                note: undefined,
              },
              createPaymentModal: false,
            });
            transactionEditor = {};
            transactionSubject = {};
          },
          onCancel: async () => {
            await this.props.createPaymentTransaction({
              ...this.state.newPayment,
              ...data,
              sendAutoMail: false,
            });
            await this.props.updateRemainingAndTuitionAD();
            this.setState({
              newPayment: {
                paymentType: undefined,
                amount: 0,
                note: undefined,
              },
              createPaymentModal: false,
            });
            transactionEditor = {};
            transactionSubject = {};
          },
        });
      } else {
        await this.props.createPaymentTransaction({
          ...this.state.newPayment,
          ...data,
          sendAutoMail: false,
        });
        await this.props.updateRemainingAndTuitionAD();
        this.setState({
          newPayment: {
            paymentType: undefined,
            amount: 0,
            note: undefined,
          },
          createPaymentModal: false,
          loading: false,
        });
      }
    } else {
      await this.props.createPaymentTransaction({
        ...this.state.newPayment,
        ...data,
        sendAutoMail: false,
      });
      await this.props.updateRemainingAndTuitionAD();
      this.setState({
        newPayment: {
          paymentType: undefined,
          amount: 0,
          note: undefined,
        },
        createPaymentModal: false,
        loading: false,
      });
    }
  }

  render() {
    // Table data source
    let dataSource = [{ isTotal: true, total: `${this.props.tuitionAD.toLocaleString()} VND` }];
    if (get(this.props, ['data', 'productOrder', 'courses', 'length'], 0)) {
      dataSource = [...this.props.data.productOrder.courses, { isTotal: true, total: `${this.props.tuitionAD.toLocaleString()} VND` }];
    }

    // Combo discount
    const combo = get(this.props, ['data', 'productOrder', 'comboId'], undefined);
    const courses = get(this.props, ['data', 'productOrder', 'courses'], []);
    const numberOfCourse = combo ? combo.field === 'courseCount' ? Number(combo.conditionValue) || 1 : courses.length : 1;
    const comboDiscount = combo ?
    combo.discountValue && combo.discountType ?
      combo.discountType !== 'FIXED' ? `${combo.discountType === 'PERCENT' ? combo.discountValue : (Number(combo.discountValue) / numberOfCourse).toLocaleString()}
        ${combo.discountType === 'PERCENT' ? '%' : 'VND'}` : `Combo ${combo.name}`
      : ''
    : '';

    // Total tuition payment
    const totalPayment = this.props.transactions.reduce((sum: number, val: any) => {
      return sum + Number(val.amount || 0);
    }, 0);

    // Tuition table columns
    const tuitionColumns = [{
      title: translate('lang:course'),
      key: 'course',
      dataIndex: 'course',
      render: (_value: any, record: any) => {
        return record.isTotal ? (
          <div><b>{translate('lang:totalAfterDiscount')}</b></div>
        ) : (
          <div style={{ color: record.shortName === 'UNK' ? 'red' : '#1890ff' }}>{record.shortName}</div>
        );
      },
    }, {
      title: translate('lang:tuitionBeforeDiscount'),
      key: 'beforeDiscount',
      dataIndex: 'beforeDiscount',
      render: (_value: any, record: any) => {
        return record.isTotal ? (
          <div style={{ color: 'red' }}>{record.total}</div>
        ) : (
          <div>{record.tuitionBeforeDiscount ? Number(record.tuitionBeforeDiscount).toLocaleString() + ' VND' : 0}</div>
        );
      },
    }, {
      title: translate('lang:discount'),
      key: 'discount',
      dataIndex: 'discount',
      render: (_value: any, record: any, index: number) => {
        return !record.isTotal ? (
          <div>{comboDiscount ? (this.props.checkComboConditionForCourse(index, combo, courses) !== 'NONE' ? comboDiscount : 0) +
          ' + ' : ''}{record.discountValue && record.discountType ? record.discountValue + ' ' + (record.discountType === 'PERCENT' ? '%' : 'VND') : 0}</div>
        ) : null;
      },
    }, {
      title: translate('lang:actions'),
      key: 'action',
      dataIndex: 'action',
      render: (_text: any, _record: any, index: number) => _record.isTotal ? <div></div> : (
        <a className='ant-dropdown-link' onClick={() => this.toggleEditTuitionModal(true, _record, index)}>
          <Icon className='hover-icon' type='edit' />
        </a>
      ),
    }];

    // Payment table columns
    const paymentColumns = [{
      title: translate('lang:date'),
      key: 'date',
      dataIndex: 'date',
      render: (_value: any, record: any) => record.isTotal ? <div><b>{translate('lang:total')}</b></div> : record.payDay ? <div>{moment(record.payDay).format('DD MMM YYYY')}</div>
      : <div>{moment(record.createdAt).format('DD MMM YYYY')}</div>,
    }, {
      title: translate('lang:type'),
      key: 'type',
      dataIndex: 'type',
      render: (_value: any, record: any) => record.isTotal ? <div></div> : <div>{record.paymentType === 'Change' ? 'Refund' : 'Payment'}</div>,
    }, {
      title: translate('lang:note'),
      key: 'note',
      dataIndex: 'note',
      render: (_value: any, record: any) => record.isTotal ? <div></div> : <div>{record.note}</div>,
    }, {
      title: translate('lang:amount'),
      key: 'amount',
      dataIndex: 'amount',
      render: (_value: any, record: any) => record.isTotal ? <div style={{ color: 'red' }}>{record.total}</div> : <div>{`${Number(record.amount || 0).toLocaleString()} VND`}</div>,
    }, {
      title: translate('lang:actions'),
      key: 'action',
      dataIndex: 'action',
      render: (_text: any, record: any) => record.isTotal ? null
        : (
          <a className='ant-dropdown-link' onClick={() => this.toggleEditPaymentTransactionModal(true, record)}>
            <Icon className='hover-icon' type='edit' />
          </a>
        ),
    }];

    return (
      <>
        <SectionBox>
          <div style={{ marginTop: '24px' }}>
            <Row>
              <Col xs={12}>
                <h3>{translate('lang:tuition')}</h3>
              </Col>
              <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '50%' }}>
                  <Icon
                    type={this.state.displayTuition ? 'up-square' : 'down-square'}
                    style={{ color: '#aaa', fontSize: '18px', cursor: 'pointer' }}
                    onClick={this.toggleDisplayTuition}
                  />
                </div>
              </Col>
              {this.state.displayTuition && (
                <Col xs={24}>
                  <TableList columns={tuitionColumns} dataSource={dataSource} />
                </Col>
              )}
            </Row>
          </div>
        </SectionBox>

        <SectionBox>
          <div style={{marginTop: '24px'}}>
            <Row>
              <Col xs={12}>
                <h3>{translate('lang:paymentHistory')}</h3>
              </Col>
              <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '50%' }}>
                  <Icon
                    className='hover-icon'
                    type={this.state.displayPayment ? 'up-square' : 'down-square'}
                    style={{ color: '#aaa', fontSize: '18px', cursor: 'pointer' }}
                    onClick={this.toggleDisplayPayment}
                  />
                </div>
              </Col>
              {this.state.displayPayment ? (
                <Col xs={24}>
                  <Col xs={24} style={{marginBottom: '10px'}}>
                    <TableList columns={paymentColumns} dataSource={[...this.props.transactions, {
                      isTotal: true,
                      total: `${Number(totalPayment || 0).toLocaleString()} VND`,
                    }]}></TableList>
                  </Col>
                  <Col xs={24}>
                    <Col xs={12}>
                      <h4>{translate('lang:remaining')}</h4>
                    </Col>
                    <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <h4 className='text-red'>{this.props.data && this.props.data.tuition && !isNaN(this.props.data.tuition.remaining) ?
                        `${Number(this.props.data.tuition.remaining).toLocaleString()} VND` : `${(Number(this.props.tuitionAD) - Number(totalPayment)).toLocaleString()} VND`}</h4>
                    </Col>
                  </Col>
                  <Col xs={24}>
                    <Col xs={12}>
                      <h4>{translate('lang:dueDate')} <span className='text-red'>{this.props.data.paymentDueAt ? moment(this.props.data.paymentDueAt).format('DD MMM YYYY') :
                        translate('lang:notSet')}</span></h4>
                    </Col>
                    <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div>
                        <Icon className='hover-icon'
                          type='edit' style={{ color: '#aaa', fontSize: '18px', marginRight: '10px', cursor: 'pointer' }} onClick={() => this.togglePaymentDueDateModal(true)}></Icon>
                        <Icon type='lock' style={{ color: '#aaa', fontSize: '18px' }}></Icon>
                      </div>
                    </Col>
                  </Col>
                  <Col xs={24}>
                    <Col xs={12}>
                      <h4>{translate('lang:keepingTheBadDepts')}</h4>
                    </Col>
                    <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Switch checked={this.props.data.keepBadDepts} onChange={this.changeKeepBadDepts} style={{ marginRight: '5px' }} />
                        <Icon type='lock' style={{ color: '#aaa', fontSize: '18px' }}></Icon>
                      </div>
                    </Col>
                  </Col>
                </Col>
              ) : null}
            </Row>
          </div>
        </SectionBox>

        <PaymentTransactionModal
          loading={this.state.loading}
          title={translate('lang:createNewPaymentTransaction')}
          visible={this.state.createPaymentModal}
          handleSubmit={this.createNewPayment}
          closeModal={() => this.toggleCreatePaymentTransactionModal(false)}
          initialValue={this.state.newPayment}
          productOrder={this.props.data.productOrder}
        />

        <EditPaymentDueDateModal
          loading={this.state.loading}
          visible={this.state.paymentDueDateModal}
          updatedDueDate={this.state.updatedDueDate}
          changeDueDate={this.changeDueDate}
          updatePaymentDueDate={this.updatePaymentDueDate}
          togglePaymentDueDateModal={this.togglePaymentDueDateModal}
        />

        <PaymentTransactionModal
          loading={this.state.loading}
          key={new Date().getTime()}
          title={translate('lang:editPaymentTransaction')}
          visible={this.state.editPaymentModal}
          handleSubmit={this.editNewPayment}
          closeModal={() => this.toggleEditPaymentTransactionModal(false)}
          initialValue={this.state.editPaymentData}
          productOrder={this.props.data.productOrder}
        />

        <EditTuitionModal
          loading={this.state.loading}
          visible={this.state.editTuitionModal}
          editTuitionData={this.state.editTuitionData}
          combo={combo}
          courses={courses}
          comboDiscount={comboDiscount}
          editTuition={this.editTuition}
          toggleEditTuitionModal={this.toggleEditTuitionModal}
          changeEditTuitionInput={this.changeEditTuitionInput}
          checkComboConditionForCourse={this.props.checkComboConditionForCourse}
        />
      </>
    );
  }
}
