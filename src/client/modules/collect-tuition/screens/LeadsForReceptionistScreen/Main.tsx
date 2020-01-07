import React from 'react';
import './LeadsForReceptionistScreen.less';
import { Icon, Col, Row, Popover, Progress, Tag, Modal, Form, Input, Tooltip, Avatar } from 'antd';
import { ToolbarWithSuggest, TableList, Pagination, DefaultAvatar } from '@client/components';
import moment from 'moment';
import { getServiceProxy } from '@client/services';
import 'firebase/auth';
import { Formik, FormikContext } from 'formik';
import * as yup from 'yup';
import { validateField, LEAD_CONVERSATION_EMAIL, LEAD_CONVERSATION_FBCHAT } from '@client/core';
import { PaymentTransactionModal } from '@client/modules/collect-tuition';
import firebase from 'firebase';
import { config } from '@client/config';
import axios from 'axios';
import { translate } from '@client/i18n';

const sortData = [
  { label: 'Created at (Descending)', value: 'createdAt|desc' },
  { label: 'Created at (Ascending)', value: 'createdAt|asc' },
  { label: 'Last updated at (Descending)', value: 'lastModifiedAt|desc' },
  { label: 'Last updated at (Ascending)', value: 'lastModifiedAt|asc' },
  { label: 'Last contacted at (Descending)', value: 'lastContactedAt|desc' },
  { label: 'Last contacted at (Ascending)', value: 'lastContactedAt|asc' },
];
interface State {
  selectedRowKeys: any;
  saveFilterModalVisible: boolean;
  modal: {
    email: boolean;
    message: boolean;
  };
  leadAssignmentModal: boolean;
  leadAssignmentData: any;
  paymentModal: boolean;
  paymentData: any;
  paymentSelected?: any;
  modalLoading: boolean;
}
interface Props {
  leads: any;
  leadConversations: any;
  filterTree: {
    label: string;
    value: string;
    children: { label: string; value: string }[];
  }[];
  filters: {
    key: {
      label: string; value: string
    };
    value: {
      label: string; value: string
    };
  }[];
  search: string;
  before?: string;
  after?: string;
  loading: {
    modal: boolean;
    table: boolean;
  };
  salesmen: any;
  centres: any;
  authUser: any;
  stages: any;
  autoCompleteSource: any;
  loadPreviousPage: () => void;
  loadNextPage: () => void;
  createLeadFilter: (payload: any) => Promise<boolean>;
  handleSearch: (payload: { search?: string; sortBy?: string }) => void;
  addFilter: (newFilter: any) => void;
  removeFilter: (newFilter: any) => void;
  updateLead: (payload: any) => Promise<void>;
  createPaymentTransaction: (id: string, payload: any) => Promise<void>;
  updateRemainingAndTuitionAD: (record: any) => Promise<void>;
  searchAutoCompleteSource: (payload: any) => Promise<any>;
  selectFromAutocomplete: (payload: string) => void;
}
export class Main extends React.Component<Props, State> {
  currentEmail: any;
  currentEmailConversation: any;
  currentFbConversation: any;
  state: State = {
    selectedRowKeys: [],
    saveFilterModalVisible: false,
    modal: {
      email: false,
      message: false,
    },
    leadAssignmentModal: false,
    leadAssignmentData: {},
    paymentModal: false,
    paymentData: {},
    paymentSelected: undefined,
    modalLoading: false,
  };

  changeSelectedRowKeys = (selectedRowKeys: any) => {
    this.setState({
      selectedRowKeys,
    });
  }

  openLeadFilterModal = () => {
    this.setState({
      saveFilterModalVisible: true,
    });
  }

  closeLeadFilterModal = () => {
    this.setState({
      saveFilterModalVisible: false,
    });
  }

  loadNextPage = async () => {
    //
  };

  syncEmailMessage = async (leadId: string) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    serviceProxy.syncEmailMessage({ leadId });
  };

  toggleModal = (type: string) => () => {
    this.setState({
      modal: {
        ...this.state.modal,
        [type]: !this.state.modal[type],
      },
    });
  };

  onOpenSendEmail = (email: string, leadId: string) => {
    this.currentEmail = email;
    this.currentEmailConversation = this.props.leadConversations.data.find((item: any) => {
      return item.leadId === leadId && item.channel === LEAD_CONVERSATION_EMAIL;
    });
    this.toggleModal('email')();
  };

  onOpenMessage = (record: any) => {
    this.currentFbConversation = this.props.leadConversations.data.find((item: any) => {
      return item.leadId === record._id && item.channel === LEAD_CONVERSATION_FBCHAT;
    });
    this.toggleModal('message')();
  };

  checkFbConversation = (leadId: string) => {
    const isExisted = this.props.leadConversations.data.find((item: any) => item.leadId === leadId && item.channel === LEAD_CONVERSATION_FBCHAT);
    return !!isExisted;
  };

  toggleReassignModal = (visible: boolean, record?: any) => {
    this.setState({
      leadAssignmentModal: visible,
      leadAssignmentData: record ? record : {},
    });
  }

  togglePaymentModal = (visible: boolean, record?: any) => {
    this.setState({
      paymentModal: visible,
      paymentData: visible ? this.state.paymentData : {},
      paymentSelected: record ? record : undefined,
    });
  }

  changeLeadAssigmentData = (payload: any) => {
    this.setState({
      leadAssignmentData: payload,
    });
  }

  changeNewPaymentInput = (payload: any) => {
    this.setState({
      paymentData: {
        ...this.state.paymentData,
        ...payload,
      },
    });
  }

  createNewPayment = async (data: any) => {
    this.setState({
      modalLoading: true,
    });
    if (data && data.paymentType === 'Change') {
      data.amount = Number(data.amount || 0) * -1;
    }
    await this.props.createPaymentTransaction(this.state.paymentSelected._id, {
      ...data,
      tuition: {
        totalAfterDiscount: this.state.paymentSelected.tuition ? (this.state.paymentSelected.tuition.totalAfterDiscount || 0) : 0,
        remaining: this.state.paymentSelected.tuition ? ((this.state.paymentSelected.tuition.remaining || 0) - data.amount) : 0,
      },
      sendAutoMail: true,
    });
    await this.props.updateRemainingAndTuitionAD({
      ...this.state.paymentSelected,
      ...data,
    });
    if (this.state.paymentSelected) {
      const payDay = data.payDay ? moment(data.payDay).format('DD/MM/YYYY') :
        moment().format('DD/MM/YYYY');
      const center = this.state.paymentSelected.centre && this.state.paymentSelected.centre.name ? this.state.paymentSelected.centre.name : 'N/A';
      const owner = this.state.paymentSelected.owner && this.state.paymentSelected.owner.fullName ? this.state.paymentSelected.owner.fullName : 'N/A';
      const fullName = this.state.paymentSelected.contact ? ((this.state.paymentSelected.contact.lastName ? this.state.paymentSelected.contact.lastName : '') +
        (this.state.paymentSelected.contact.lastName ? ' ' : '') + (this.state.paymentSelected.contact.firstName ? this.state.paymentSelected.contact.firstName : '')) : 'N/A';
      const phone = this.state.paymentSelected.contact && this.state.paymentSelected.contact.phone ? this.state.paymentSelected.contact.phone : 'N/A';
      const email = this.state.paymentSelected.contact && this.state.paymentSelected.contact.email ? this.state.paymentSelected.contact.email : 'N/A';
      const courses = this.state.paymentSelected.productOrder.courses && this.state.paymentSelected.productOrder.courses.length ?
        this.state.paymentSelected.productOrder.courses.reduce((sum: any, val: any, index: number) => {
          return sum + val.shortName + (index === (this.state.paymentSelected.productOrder.courses.length - 1) ? '' : ', ');
        }, '') : 'N/A';
      const classes = this.state.paymentSelected.productOrder.courses && this.state.paymentSelected.productOrder.courses.length ?
        this.state.paymentSelected.productOrder.courses.reduce((sum: any, val: any, index: number) => {
          return sum + (val.class ? (val.class + (index === (this.state.paymentSelected.productOrder.courses.length - 1) ? '' : ', ')) : '');
        }, '') : 'N/A';
      const amount = data.amount ? data.amount : 'N/A' as any;
      const note = data.note ? data.note : 'N/A';
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
    this.setState({
      paymentData: {},
      paymentModal: false,
      modalLoading: false,
    });
  }

  render() {
    const generateName = (name: string) => name.match(/\b\w/g)!.join('').toUpperCase();

    const namePopover = (_record: any) => (
      <div>
        <h5><span className='text-gray'>{translate('lang:firstName')}:</span> {_record.contact ? _record.contact.firstName : ''}</h5>
        <h5><span className='text-gray'>{translate('lang:lastName')}:</span> {_record.contact ? _record.contact.lastName : ''}</h5>
        <h5><span className='text-gray'>{translate('lang:phone')}:</span> <a className='no-cursor-pointer'>{_record.contact ? _record.contact.phone : ''}</a></h5>
        <h5><span className='text-gray'>{translate('lang:email')}:</span> <a className='no-cursor-pointer'>{_record.contact ? _record.contact.email : ''}</a></h5>
        <h5><span className='text-gray'>{translate('lang:fb')}:</span> <a className='no-cursor-pointer'>{_record.contact ? _record.contact.fb : ''}</a></h5>
      </div>
    );

    const ownerPopover = (_record: any) => (
      <div>
        <h4>{_record.centre ? _record.centre.name : <div>{translate('lang:noCentre')}</div>}</h4>
        <h4>{_record.owner && _record.owner.fullName ? _record.owner.fullName : translate('lang:unassigned')}</h4>
      </div>
    );

    const poPopover = (_record: any) => (
      <div>
        <h4>{_record.productOrder && _record.productOrder.comboName ? translate('lang:discountCombo') + ' ' + _record.productOrder.comboName + ':' : ''}</h4>
        {_record.productOrder && _record.productOrder.courses ? _record.productOrder.courses.map((val: any) => {
          return <h4>{val.description || val.name}</h4>;
        }) : ''}
      </div>
    );

    const tuitionPopover = (_record: any) => (
      <div>
        <h5><span className='text-gray'>{translate('lang:tuitionAfterDiscount')}:</span> {_record.tuition ? Number(_record.tuition.totalAfterDiscount).toLocaleString() + ' VND' : 0}</h5>
        <h5><span className='text-gray'>{translate('lang:collected')}:</span>
          {_record.tuition ? Number(_record.tuition.totalAfterDiscount - _record.tuition.remaining).toLocaleString() + ' VND' : 0}</h5>
        <h5><span className='text-red'>{translate('lang:remaining')}:</span> {_record.tuition ? Number(_record.tuition.remaining).toLocaleString() + ' VND' : 0}</h5>
      </div>
    );

    const statusPopover = (_record: any) => (
      <div>
        <h4>{_record.currentStatus ? _record.currentStatus : translate('lang:none')}</h4>
      </div>
    );

    const notePopover = (_record: any) => (
      <div>
        <h5><span className='text-gray'>{translate('lang:createdAt')}:</span> {moment(_record.createdAt).format('DD MMM, HH:mm')}</h5>
        <h5><span className='text-gray'>{translate('lang:lastUpdatedAt')}:</span> {moment(_record.lastModifiedAt ? _record.lastModifiedAt : _record.createdAt).format('DD MMM, HH:mm')}</h5>
      </div>
    );

    const leadColumns = [{
      title: translate('lang:createdAt'),
      key: 'note',
      dataIndex: 'note',
      width: '14%',
      render: (_value: any, _record: any, _index: number) => <Popover title='' trigger='hover' content={notePopover(_record)}>
        <div>
          <div>{_record.createdAt ? moment(_record.createdAt).format('DD/MM/YYYY') : ''}</div>
          <div>{_record.createdAt ? moment(_record.createdAt).format('HH:mm') : ''}</div>
        </div>
      </Popover>,
    }, {
      title: translate('lang:centre'),
      key: 'centre',
      dataIndex: 'centre',
      width: '15%',
      render: (_value: any, _record: any, _index: number) => <Popover title='' trigger='hover' content={ownerPopover(_record)}>
        <div>
          {
            _record.centre ? <span className='text-center'>{_record.centre.name}</span>
              : <span className='text-center' style={{ color: 'red' }}>{translate('lang:noCentre')}</span>
          }
        </div></Popover>,
    }, {
      title: translate('lang:owner'),
      key: 'owner',
      dataIndex: 'owner',
      width: '15%',
      render: (_value: any, _record: any, _index: number) => <Popover title='' trigger='hover' content={ownerPopover(_record)}>
        <div>
          {
            _record.owner ?
              <div>
                <DefaultAvatar name={generateName(_record.owner.fullName ? _record.owner.fullName : '')}></DefaultAvatar>
                <span style={{ marginLeft: 10 }}>{_record.owner.fullName ? _record.owner.fullName : ''}</span>
              </div>
              :
              <div>
                <Avatar style={{ backgroundColor: 'red' }} icon='exclamation' />
                <span style={{ marginLeft: 10, color: 'red' }}>{translate('lang:unassigned')}</span>
              </div>
          }
        </div></Popover>,
    }, {
      title: translate('lang:name'),
      key: 'name',
      dataIndex: 'name',
      width: '15%',
      render: (_value: any, _record: any, _index: number) => <Popover title='' trigger='hover' content={namePopover(_record)}>
        <a>
          {_record.contact ? ((_record.contact.lastName ? _record.contact.lastName : '') +
            (_record.contact.lastName ? ' ' : '') + (_record.contact.firstName ? _record.contact.firstName : '')) : ''}
        </a>
      </Popover>,
    }, {
      title: translate('lang:po'),
      key: 'po',
      dataIndex: 'po',
      width: '14%',
      render: (_value: any, _record: any, _index: number) => <Popover title='' trigger='hover' content={poPopover(_record)}>
        <div>{_record.productOrder.courses && _record.productOrder.courses.length ? _record.productOrder.courses.reduce((sum: any, val: any, index: number) => {
          return sum + val.shortName + (index === (_record.productOrder.courses.length - 1) ? '' : ', ');
        }, '') : ''}</div>
      </Popover>,
    }, {
      title: translate('lang:stage'),
      key: 'stage',
      dataIndex: 'stage',
      width: '12%',
      render: (_value: any, _record: any, _index: number) => {
        const selectedStage = this.props.stages.filter((v: any) => v.value && v.value.name === _record.currentStage).length ?
          this.props.stages.filter((v: any) => v.value && v.value.name === _record.currentStage)[0] : undefined;
        return <Tooltip title={selectedStage && selectedStage.value && selectedStage.value.description ? selectedStage.value.description : undefined}>
          <div>{_record.currentStage}</div>
        </Tooltip>;
      },
    }, {
      title: translate('lang:tuition'),
      key: 'tuition',
      dataIndex: 'tuition',
      width: '10%',
      render: (_value: any, _record: any, _index: number) => {
        // const percent = (_record.tuition ? _record.tuition.remaining !== undefined && _record.tuition.totalAfterDiscount !== undefined ?
        //   Math.round(100 - 100 * (Number(_record.tuition.remaining) / Number(_record.tuition.totalAfterDiscount))) : 0 : 0) || 0;
        let percent = 0;
        if (_record.tuition) {
          if (_record.tuition.totalAfterDiscount) {
            if (_record.tuition.remaining !== undefined) {
              percent = Math.round(100 - 100 * (Number(_record.tuition.remaining) / Number(_record.tuition.totalAfterDiscount)));
            } else {
              percent = 0;
            }
          } else {
            if (_record.tuition.remaining < 0) {
              percent = 100;
            } else {
              percent = 0;
            }
          }
        } else {
          percent = 0;
        }
        return <Popover title='' trigger='hover' content={tuitionPopover(_record)}>
          {/* <div>{_record.tuition ? _record.tuition.totalAfterDiscount : 0}</div> */}
          <div>
            <h5>{percent}%</h5>
            <Progress width={40} showInfo={false}
              style={{ wordBreak: 'normal' }} status='active' percent={percent} />
          </div>
        </Popover>;
      },
    }, {
      title: translate('lang:status'),
      key: 'status',
      dataIndex: 'status',
      width: '12%',
      render: (_value: any, _record: any, _index: number) => {
        return <Popover title='' trigger='hover' content={statusPopover(_record)}>
          <div>{_record.currentStatus}</div>
        </Popover>;
      },
    }, {
      title: translate('lang:actions'),
      key: 'actions',
      dataIndex: 'actions',
      width: '14%',
      render: (_text: any, record: any) => (
        <a rel='noopener noreferrer' onClick={() => {
          this.togglePaymentModal(true, record);
        }}>{translate('lang:createPaymentTransaction')}</a>
      ),
    }];

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      onChange: this.changeSelectedRowKeys,
    };

    const LeadFilterValidateSchema = yup.object().shape({
      name: yup.string()
        .required(translate('lang:validateFilterNameRequired'))
        .matches(/^[a-zA-Z0-9 ]+$/, translate('lang:validateFilterNameSpecialChar'))
        .min(2, translate('lang:validateFilterNameTooShort'))
        .max(50, translate('lang:validateFilterNameTooLong')),
    });
    return (
      <div className='lead-screen'>
        <Row type='flex' style={{ marginBottom: 16 }} justify='space-between'>
          <ToolbarWithSuggest
            name={translate('lang:leads')}
            data={this.props.filterTree}
            filters={this.props.filters}
            saveFilterCallback={this.openLeadFilterModal}
            handleFilterChange={this.props.addFilter}
            callback={this.props.handleSearch as any}
            sortData={sortData}
            searchAutoCompleteSource={this.props.searchAutoCompleteSource}
            autoCompleteSource={this.props.autoCompleteSource}
            selectFromAutocomplete={this.props.selectFromAutocomplete}
          />
        </Row>
        {this.props.filters.length || this.props.search
          ? <Row className='selected-filters' style={{ marginBottom: 16 }}>
            <Col xs={24}>
              {this.props.filters && this.props.filters.map((filter, index: number) => (
                <Tag
                  key={index.toString()}
                  color='magenta'
                  closable={true}
                  onClose={(e: any) => {
                    e.preventDefault();
                    this.props.removeFilter(filter);
                  }}
                >
                  {filter.key.label}: {filter.value.label}
                </Tag>
              ))}
              {this.props.search && (
                <Tag
                  key='keyword'
                  color='magenta'
                  closable={true}
                  onClose={(e: any) => {
                    e.preventDefault();
                    this.props.handleSearch({ search: '' });
                  }}
                >
                  {translate('lang:keyword')}: {this.props.search}
                </Tag>
              )}
            </Col>
          </Row> : null}
        <Row type='flex'>
          <Col xs={24} className='custom-color-select-box'>
            <TableList columns={leadColumns} dataSource={this.props.leads ? this.props.leads.data : []} rowSelection={rowSelection} loading={this.props.loading.table} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {this.props.leads.before || this.props.leads.after
                ? <Pagination
                  before={this.props.leads ? this.props.leads.before : undefined}
                  after={this.props.leads ? this.props.leads.after : undefined}
                  loadPreviousPage={this.props.loadPreviousPage}
                  loadNextPage={this.props.loadNextPage}
                /> : null}
            </div>
          </Col>
        </Row>
        {
          this.state.modal.email && (
            // @ts-ignore
            <MailModal
              recipients={this.currentEmail ? [this.currentEmail] : undefined}
              leadConversationIds={this.currentEmailConversation ? [this.currentEmailConversation.id] : undefined}
              visible={this.state.modal.email}
              onCancel={this.toggleModal('email')}
            />
          )
        }
        <Formik
          initialValues={{
            name: '',
          }}
          validateOnChange={false}
          validationSchema={LeadFilterValidateSchema}
          enableReinitialize={true}
          onSubmit={async (values) => {
            const result = await this.props.createLeadFilter(values);
            if (result) {
              this.closeLeadFilterModal();
            }
          }}
        >
          {(context: FormikContext<any>) => (
            <Modal
              title={translate('lang:saveFilter')}
              visible={this.state.saveFilterModalVisible}
              onOk={context.handleSubmit}
              onCancel={this.closeLeadFilterModal}
              okText='Save'
              confirmLoading={this.props.loading.modal}
            >
              <Form>
                <Form.Item label={translate('lang:filterName')} validateStatus={context.errors.name ? 'error' : undefined} help={context.errors.name}>
                  <Input
                    value={context.values.name}
                    onChange={context.handleChange}
                    onBlur={async () => {
                      if (context.values.name) {
                        const serviceProxy = getServiceProxy();
                        const checkFilterNameResult = await serviceProxy.checkFilterName(context.values.name);
                        if (checkFilterNameResult.existedFilterName) {
                          context.setFieldError('name', translate('lang:validateFilterNameDuplicate'));
                        }
                      }

                      context.setFieldError('name', '');
                      validateField({
                        fieldName: 'name',
                        validateSchema: LeadFilterValidateSchema,
                        context,
                      });
                    }}
                    prefix={<Icon type='filter' />}
                    placeholder={translate('lang:pleaseInputFilterName')}
                    type='text'
                    name='name'
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  {this.props.filters && this.props.filters.map((filter, index: number) => (
                    <Tag
                      key={index.toString()}
                      color='magenta'
                      closable={true}
                      onClose={(e: any) => {
                        e.preventDefault();
                        this.props.removeFilter(filter);
                      }}
                    >
                      {filter.key.label}: {filter.value.label}
                    </Tag>
                  ))}
                  {this.props.search && (
                    <Tag
                      key='keyword'
                      color='magenta'
                      closable={true}
                      onClose={(e: any) => {
                        e.preventDefault();
                        this.props.handleSearch({ search: '' });
                      }}
                    >
                      {translate('lang:keyword')}: {this.props.search}
                    </Tag>
                  )}
                </Form.Item>
              </Form>
            </Modal>
          )}
        </Formik>
        <PaymentTransactionModal
          title={translate('lang:createPaymentTransaction')}
          visible={this.state.paymentModal}
          handleSubmit={this.createNewPayment}
          closeModal={() => this.togglePaymentModal(false)}
          initialValue={this.state.paymentData}
          productOrder={this.state.paymentSelected && this.state.paymentSelected.productOrder}
          tuition={this.state.paymentSelected && this.state.paymentSelected.tuition}
          loading={this.state.modalLoading}
        />
      </div>
    );
  }
}
