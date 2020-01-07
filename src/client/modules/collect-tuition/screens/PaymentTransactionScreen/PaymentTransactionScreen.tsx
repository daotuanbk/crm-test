import React from 'react';
import './PaymentTransactionScreen.less';
import { Authorize, BorderWrapper } from '@client/components';
import { message, Row, Col, Button, Modal } from 'antd';
import { Main } from './Main';
import { PERMISSIONS } from '@common/permissions';
import { CREATE_TRANSACTION_TEMPLATE } from '@client/core';
import { PaymentTransactionModal } from './PaymentTransactionModal';
import { LeadPaymentTransaction } from '@client/services/service-proxies';
import firebase from 'firebase/app';
import { getServiceProxy } from '@client/services';
import moment from 'moment';
import { config } from '@client/config';
import axios from 'axios';
import { translate } from '@client/i18n';

interface State {
  data: LeadPaymentTransaction[];
  lead: any;
  loading: {
    table: boolean;
    modal: boolean;
  };
  modal: {
    create?: any;
    update?: LeadPaymentTransaction;
  };
}

interface Props {
  id: string;
}

export const PaymentTransactionScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    data: [],
    lead: {},
    loading: {
      table: false,
      modal: false,
    },
    modal: {
      create: false,
    },
  };

  async componentDidMount() {
    this.handleSearch();
  }

  updateRemainingAndTuitionAD = async () => {
    const tuitionAD = this.state.lead && this.state.lead.tuition ? this.state.lead.tuition.totalAfterDiscount || 0 : 0;
    const totalPayment = this.state.data.reduce((sum: number, val: any) => sum + Number(val.amount), 0);
    const remaining = Number(tuitionAD) - Number(totalPayment);
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      await serviceProxy.updateLead(this.props.id, {
        operation: 'updateDetail',
        payload: {
          tuition: {
            totalAfterDiscount: tuitionAD,
            remaining,
          },
        },
      });
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  };

  handleSearch = async () => {
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
      const result = await serviceProxy.findLeadPaymentTransaction(this.props.id) as any;
      const lead = await serviceProxy.findLeadById(this.props.id) as any;
      this.setState({
        lead,
        data: result,
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
  openPaymentTransactionModal = (paymentTransaction?: any) => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: paymentTransaction ? undefined : {},
        update: paymentTransaction ? paymentTransaction : undefined,
      },
    });
  }
  closePaymentTransactionModal = () => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: undefined,
        update: undefined,
      },
    });
  }
  handleSubmit = async (values: any, formikBag: any) => {
    if (values && values.paymentType === 'Change') {
      values.amount = Number(values.amount || 0) * -1;
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
        // result = await serviceProxy.createLeadPaymentTransaction({
        //   ...values,
        //   leadId: this.props.id,
        // });
        // send to google sheets
        if (this.state.lead) {
          const payDay = values.payDay ? moment(values.payDay).format('DD/MM/YYYY') :
            moment().format('DD/MM/YYYY');
          const center = this.state.lead.centre && this.state.lead.centre.name ? this.state.lead.centre.name : 'N/A';
          const owner = this.state.lead.owner && this.state.lead.owner.fullName ? this.state.lead.owner.fullName : 'N/A';
          const fullName = this.state.lead.contact ? ((this.state.lead.contact.lastName ? this.state.lead.contact.lastName : '') +
            (this.state.lead.contact.lastName ? ' ' : '') + (this.state.lead.contact.firstName ? this.state.lead.contact.firstName : '')) : 'N/A';
          const phone = this.state.lead.contact && this.state.lead.contact.phone ? this.state.lead.contact.phone : 'N/A';
          const email = this.state.lead.contact && this.state.lead.contact.email ? this.state.lead.contact.email : 'N/A';
          const courses = this.state.lead.productOrder.courses && this.state.lead.productOrder.courses.length ?
            this.state.lead.productOrder.courses.reduce((sum: any, val: any, index: number) => {
              return sum + val.shortName + (index === (this.state.lead.productOrder.courses.length - 1) ? '' : ', ');
            }, '') : 'N/A';
          const classes = this.state.lead.productOrder.courses && this.state.lead.productOrder.courses.length ?
            this.state.lead.productOrder.courses.reduce((sum: any, val: any, index: number) => {
              return sum + (val.class ? (val.class + (index === (this.state.lead.productOrder.courses.length - 1) ? '' : ', ')) : '');
            }, '') : 'N/A';
          const amount = values.amount ? values.amount : 'N/A' as any;
          const note = values.note ? values.note : 'N/A';
          const bodyFormData = new FormData();
          bodyFormData.set('entry.677062095', payDay);
          bodyFormData.set('entry.981060713', center);
          bodyFormData.set('entry.1416139988', owner);
          bodyFormData.set('entry.1994009877', fullName);
          bodyFormData.set('entry.703646014', phone);
          bodyFormData.set('entry.736627392', email);
          bodyFormData.set('entry.28142038', courses);
          bodyFormData.set('entry.1566217804', classes);
          bodyFormData.set('entry.1599346859', amount);
          bodyFormData.set('entry.1465645229', note);
          // const googleFormData = {
          //   'entry.677062095': payDay,
          //   'entry.981060713': center,
          //   'entry.1416139988': owner,
          //   'entry.1994009877': fullName,
          //   'entry.703646014': phone,
          //   'entry.736627392': email,
          //   'entry.28142038': courses,
          //   'entry.1566217804': classes,
          //   'entry.1599346859': amount,
          //   'entry.1465645229': note,
          // };
          axios.post(`${config.googleFormUrl}`, bodyFormData, { headers: { 'Content-Type': 'multipart/form-data' } });
          // fetch(GOOGLE_SHEET_URL, {
          //   method: 'POST',
          //   body: JSON.stringify(googleFormData),
          // });
        }

        const templateConfig = await serviceProxy.findEmailTemplateConfigByName(CREATE_TRANSACTION_TEMPLATE) as any;
        if (templateConfig && templateConfig.data) {
          const dataEmail = templateConfig.data.data && templateConfig.data.data.length ? templateConfig.data.data.map((val: any) => {
            const studentName = this.state.lead.contact ? this.state.lead.contact.fullName : '';
            const html = val.template && val.template.text ? val.template.text.replace(/@student_name/g, studentName)
              .replace(/@transaction_type/g, values.paymentType)
              .replace(/@transaction_amount/g, `${Math.abs(Number(values.amount)).toLocaleString()} VND`) : '';
            const subject = val.template && val.template.subject ? val.template.subject.replace(/@student_name/g, studentName)
              .replace(/@transaction_type/g, values.paymentType)
              .replace(/@transaction_amount/g, `${Math.abs(Number(values.amount)).toLocaleString()} VND`) : '';
            let recipient = '';
            if (val.recipient === 'student') {
              recipient = this.state.lead.contact ? this.state.lead.contact.email : '';
            } else if (val.recipient === 'saleman') {
              recipient = this.state.lead.owner && this.state.lead.owner.id ? this.state.lead.owner.id.email : '';
            }
            return {
              recipient,
              html,
              subject,
            };
          }) : [];
          if (dataEmail && dataEmail.length && templateConfig.data.data.filter((value: any) => value.template).length !== 0) {
            Modal.confirm({
              title: translate('lang:confirmAutomailModal'),
              width: '900px',
              content: <div>
                <h3>{translate('lang:confirmSendAutomail')}</h3>
                <hr></hr>
                <div>
                  {dataEmail.map((val: any) => {
                    return <div>
                      <h4>{translate('lang:subject')}: {val.subject}</h4>
                      <h4>{translate('lang:recipient')}: {val.recipient}</h4>
                      <h4>{translate('lang:content')}: </h4>
                      <div dangerouslySetInnerHTML={{ __html: val.html }} />
                      <hr></hr>
                    </div>;
                  })}
                </div>
              </div>,
              okText: translate('lang:send'),
              onOk: async () => {
                result = await serviceProxy.createLeadPaymentTransaction({
                  ...values,
                  tuition: {
                    totalAfterDiscount: this.state.lead.tuition ? (this.state.lead.tuition.totalAfterDiscount || 0) : 0,
                    remaining: this.state.lead.tuition ? ((this.state.lead.tuition.remaining || 0) - values.amount) : 0,
                  },
                  leadId: this.props.id,
                  sendAutoMail: true,
                });
                message.success(this.state.modal.create ? translate('lang:createSuccess') : translate('lang:updateSuccess'));
                this.setState({
                  data: this.state.modal.create ? [
                    {
                      ...result,
                      ...values,
                      tuition: {
                        totalAfterDiscount: this.state.lead.tuition ? (this.state.lead.tuition.totalAfterDiscount || 0) : 0,
                        remaining: this.state.lead.tuition ? ((this.state.lead.tuition.totalAfterDiscount || 0) - values.amount) : 0,
                      },
                      createdAt: new Date().getTime(),
                    },
                    ...this.state.data,
                  ] : this.state.data.map((item) => {
                    if (item._id === this.state.modal.update!._id) {
                      return {
                        ...item,
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
                }, async () => await this.updateRemainingAndTuitionAD());
                formikBag.resetForm({});
              },
              onCancel: async () => {
                result = await serviceProxy.createLeadPaymentTransaction({
                  ...values,
                  tuition: {
                    totalAfterDiscount: this.state.lead.tuition ? (this.state.lead.tuition.totalAfterDiscount || 0) : 0,
                    remaining: this.state.lead.tuition ? ((this.state.lead.tuition.remaining || 0) - values.amount) : 0,
                  },
                  leadId: this.props.id,
                  sendAutoMail: false,
                });
                message.success(this.state.modal.create ? translate('lang:createSuccess') : translate('lang:updateSuccess'));
                this.setState({
                  data: this.state.modal.create ? [
                    {
                      ...result,
                      ...values,
                      tuition: {
                        totalAfterDiscount: this.state.lead.tuition ? (this.state.lead.tuition.totalAfterDiscount || 0) : 0,
                        remaining: this.state.lead.tuition ? ((this.state.lead.tuition.remaining || 0) - values.amount) : 0,
                      },
                      createdAt: new Date().getTime(),
                    },
                    ...this.state.data,
                  ] : this.state.data.map((item) => {
                    if (item._id === this.state.modal.update!._id) {
                      return {
                        ...item,
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
                }, async () => await this.updateRemainingAndTuitionAD());
                formikBag.resetForm({});
              },
            });
          } else {
            result = await serviceProxy.createLeadPaymentTransaction({
              ...values,
              leadId: this.props.id,
              tuition: {
                totalAfterDiscount: this.state.lead.tuition ? (this.state.lead.tuition.totalAfterDiscount || 0) : 0,
                remaining: this.state.lead.tuition ? ((this.state.lead.tuition.totalAfterDiscount || 0) - values.amount) : 0,
              },
              sendAutoMail: false,
            });
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
                    ...item,
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
            }, async () => await this.updateRemainingAndTuitionAD());
            formikBag.resetForm({});
          }
        } else {
          result = await serviceProxy.createLeadPaymentTransaction({
            ...values,
            tuition: {
              totalAfterDiscount: this.state.lead.tuition ? (this.state.lead.tuition.totalAfterDiscount || 0) : 0,
              remaining: this.state.lead.tuition ? ((this.state.lead.tuition.remaining || 0) - values.amount) : 0,
            },
            leadId: this.props.id,
            sendAutoMail: false,
          });
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
                  ...item,
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
          }, async () => await this.updateRemainingAndTuitionAD());
          formikBag.resetForm({});
        }
      } else {
        const newInfo = {
          ...this.state.modal.update,
          ...values,
        };
        result = await serviceProxy.updateLeadPaymentTransaction(this.state.modal.update!._id, {
          operation: 'updateDetail',
          payload: newInfo,
        });
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
                ...item,
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
        }, async () => await this.updateRemainingAndTuitionAD());
        formikBag.resetForm({});
      }
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

  deleteTransaction = async (payload: string) => {
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      await serviceProxy.deleteLeadPaymentTransaction(payload);
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
            <h2 style={{ marginBottom: 24 }}>{translate('lang:transactions')}</h2>
          </Col>
          <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type='primary' onClick={() => this.openPaymentTransactionModal()}>{translate('lang:addNewTransaction')}</Button>
          </Col>
        </Row>
        {(this.state.modal.create || this.state.modal.update) && (
          <PaymentTransactionModal
            title={this.state.modal.update ? translate('lang:updateTransaction') : translate('lang:createTransaction')}
            visible={Boolean(this.state.modal.update) || Boolean(this.state.modal.create)}
            handleSubmit={this.handleSubmit}
            closeModal={this.closePaymentTransactionModal}
            initialValue={this.state.modal.update ? {
              ...this.state.modal.update,
            } : this.state.modal.create}
            loading={this.state.loading.modal}
          />
        )}
        <BorderWrapper>
          <Main
            data={this.state.data}
            openModal={this.openPaymentTransactionModal}
            loading={this.state.loading.table}
            handleSearch={this.handleSearch}
            deleteTransaction={this.deleteTransaction}
          ></Main>
        </BorderWrapper>
      </div>
    );
  }
}, [PERMISSIONS.PRODUCT_COMBOS.VIEW], true, 'admin');
