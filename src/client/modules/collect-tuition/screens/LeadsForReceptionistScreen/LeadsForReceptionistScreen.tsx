import React from 'react';
import './LeadsForReceptionistScreen.less';
import { Authorize, BorderWrapper } from '@client/components';
import { Tabs, message, Icon, Popconfirm } from 'antd';
import { Main } from './Main';
import { PERMISSIONS } from '@common/permissions';
import firebase from 'firebase';
import { getServiceProxy } from '../../../../services';
import { SystemConfig, Centre, User, ProductCombo, LeadFilter } from '@client/services/service-proxies';
import { AuthUser, withRematch, initStore } from '@client/store';
import { translate } from '@client/i18n';

const TabPane = Tabs.TabPane;

interface State {
  leadFilters: LeadFilter[];
  centres: Centre[];
  stages: SystemConfig[];
  statuses: SystemConfig[];
  salesmen: User[];
  combos: ProductCombo[];
  leadConversations: any;
  search: string;
  filters: { key: { label: string; value: string }; value: { label: string; value: string } }[];
  data: any;
  before: any;
  after: any;
  sortBy: string;
  pageSize: number;
  loading: {
    table: boolean;
    modal: boolean;
  };
  autoCompleteSource: any;
}
interface Props {
  authUser: AuthUser;
}
const sortData = [
  { label: 'Created at (Descending)', value: 'createdAt|desc' },
  { label: 'Created at (Ascending)', value: 'createdAt|asc' },
  { label: 'Last updated at (Descending)', value: 'lastModifiedAt|desc' },
  { label: 'Last updated at (Ascending)', value: 'lastModifiedAt|asc' },
  { label: 'Last contacted at (Descending)', value: 'lastContactedAt|desc' },
  { label: 'Last contacted at (Ascending)', value: 'lastContactedAt|asc' },
];
const Screen = class extends React.Component<Props, State> {
  main: any;

  constructor(props: Props) {
    super(props);
    this.main = React.createRef();
  }

  state: State = {
    leadFilters: [],
    centres: [],
    stages: [],
    statuses: [],
    salesmen: [],
    combos: [],

    search: '',
    filters: [],
    data: [],
    before: undefined,
    after: undefined,
    sortBy: 'createdAt|desc',
    pageSize: 10,
    loading: {
      table: false,
      modal: false,
    },
    leadConversations: [],
    autoCompleteSource: [],
  };

  componentDidMount() {
    this.getInitalData();
  }

  createPaymentTransaction = async (id: string, payload: any) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      await serviceProxy.createLeadPaymentTransaction({
        ...payload,
        leadId: id,
      });
      message.success(translate('lang:createSuccess'), 1);
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  }

  calculateTuitionBD = (courses: any) => {
    return courses.reduce((sum: number, val: any) => {
      return sum + Number(val.tuitionBeforeDiscount);
    }, 0);
  }

  calculateTuitionAD = (combo: any, courses: any) => {
    if (courses && courses.length) {
      if (combo && combo.discountType === 'FIXED' && this.checkComboCondition(combo, courses)) {
        const totalAdditionalDiscount = courses.reduce((sum: number, val: any, _index: number) => {
          const tuition = val.tuitionBeforeDiscount || 0;
          const discount = val.discountValue ?
            (val.discountType === 'PERCENT' ?
              (Number(tuition) * Number(val.discountValue) / 100) :
              Number(val.discountValue))
            : 0;
          return sum + discount;
        }, 0);
        return Number(combo.discountValue) - Number(totalAdditionalDiscount) > 0 ? Number(combo.discountValue) - Number(totalAdditionalDiscount) : 0;
      } else {
        const tuitionFees = courses.reduce((sum: number, val: any, _index: number) => {
          const tuition = val.tuitionBeforeDiscount || 0;
          const discount = val.discountValue ?
            (val.discountType === 'PERCENT' ?
              (Number(tuition) * Number(val.discountValue) / 100) :
              Number(val.discountValue))
            : 0;
          const comboDiscount = this.checkComboConditionForCourse(_index, combo, courses) === 'PERCENT' ? (Number(tuition) * Number(combo ? combo.discountValue : 0) / 100) : 0;
          return sum + ((Number(tuition) - Number(discount) - Number(comboDiscount)) > 0 ? Number(tuition) - Number(discount) - Number(comboDiscount) : 0);
        }, 0);
        if (combo && combo.discountType === 'AMOUNT' && this.checkComboCondition(combo, courses)) {
          return (Number(tuitionFees) - Number(combo.discountValue)) > 0 ? (Number(tuitionFees) - Number(combo.discountValue)) : 0;
        } else {
          return tuitionFees;
        }
      }
    } else {
      if (combo && combo.discountType === 'FIXED' && combo.field === 'courseCount' && combo.conditionValue < 0 && combo.condition === 'gt') return combo.discountValue;
      else return 0;
    }
  }

  checkComboConditionForCourse = (courseIndex: number, combo: any, courses: any) => {
    if (!combo) {
      return 'NONE';
    } else {
      if (combo.field === 'courseCount') {
        if (combo.condition === 'gte') {
          if (courses.length >= combo.conditionValue) {
            if (combo.discountType === 'PERCENT') {
              return 'PERCENT';
            } else if (combo.discountType === 'AMOUNT') {
              return 'AMOUNT';
            } else if (combo.discountType === 'FIXED') {
              return 'FIXED';
            } else {
              return 'NONE';
            }
          } else {
            return 'NONE';
          }
        } else if (combo.condition === 'gt') {
          if (courses.length > combo.conditionValue) {
            if (combo.discountType === 'PERCENT') {
              return 'PERCENT';
            } else if (combo.discountType === 'AMOUNT') {
              return 'AMOUNT';
            } else if (combo.discountType === 'FIXED') {
              return 'FIXED';
            } else {
              return 'NONE';
            }
          } else {
            return 'NONE';
          }
        } else if (combo.condition === 'eq') {
          if (courses.length >= combo.conditionValue) {
            if (courseIndex < combo.conditionValue) {
              if (combo.discountType === 'PERCENT') {
                return 'PERCENT';
              } else if (combo.discountType === 'AMOUNT') {
                return 'AMOUNT';
              } else if (combo.discountType === 'FIXED') {
                return 'FIXED';
              } else {
                return 'NONE';
              }
            } else {
              return 'NONE';
            }
          } else {
            return 'NONE';
          }
        } else {
          return 'NONE';
        }
      } else if (combo.field === 'tuitionBD') {
        if (this.calculateTuitionBD(courses) >= combo.conditionValue) {
          if (combo.discountType === 'PERCENT') {
            return 'PERCENT';
          } else if (combo.discountType === 'AMOUNT') {
            return 'AMOUNT';
          } else if (combo.discountType === 'FIXED') {
            return 'FIXED';
          } else {
            return 'NONE';
          }
        } else {
          return 'NONE';
        }
      } else {
        // If there's any other type of combo, handle it here
        return 'NONE';
      }
    }
  }

  checkComboCondition = (combo: any, courses: any) => {
    if (!combo) {
      return false;
    } else {
      const realCourse = courses.filter((val: any) => val.shortName !== 'UNK');
      if (combo.field === 'courseCount') {
        if (combo.condition !== 'gt') {
          if (courses.length >= combo.conditionValue && realCourse.length) {
            return true;
          } else {
            return false;
          }
        } else {
          if (courses.length > combo.conditionValue && realCourse.length) {
            return true;
          } else {
            return false;
          }
        }
      } else if (combo.field === 'tuitionBD') {
        if (this.calculateTuitionBD(courses) >= combo.conditionValue) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  updateRemainingAndTuitionAD = async (record: any) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const tuitionAD = this.calculateTuitionAD(record.productOrder ? record.productOrder.comboId : undefined, record.productOrder ? record.productOrder.courses : []);
    const transactions = await serviceProxy.findLeadPaymentTransaction(record._id) as any;
    const totalPayment = transactions.reduce((sum: number, val: any) => sum + Number(val.amount), 0);
    const remaining = Number(tuitionAD) - Number(totalPayment);
    this.setState({
      // data: {
      //   ...this.state.data,
      //   tuition: {
      //     totalAfterDiscount: tuitionAD,
      //     remaining,
      //   },
      // },
      data: this.state.data.map((val: any) => {
        if (val._id === record._id) {
          return {
            ...val,
            tuition: {
              totalAfterDiscount: tuitionAD,
              remaining,
            },
          };
        } else {
          return val;
        }
      }),
    });
    try {
      await serviceProxy.updateLead(record._id, {
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
  }

  getInitalData = async () => {
    try {
      this.setState({
        loading: {
          ...this.state.loading,
          table: true,
        },
      });

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      const leads = await serviceProxy.findLeads(
        undefined,
        undefined,
        undefined,
        10,
        undefined,
        'createdAt|desc',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      this.setState({
        data: leads.data,
        before: leads.before,
        after: leads.after,
        loading: {
          ...this.state.loading,
          table: false,
        },
      });

      const [leadFilters, stages, statuses, centres, salesmen, combos] = await Promise.all([
        serviceProxy.findLeadFilters('getAllRecords', 10, 'createdAt|desc', undefined, undefined),
        serviceProxy.findSystemConfigs('getAllStages', undefined, undefined, undefined, undefined, undefined, undefined),
        serviceProxy.findSystemConfigs('getAllStatuses', undefined, undefined, undefined, undefined, undefined, undefined),
        serviceProxy.getAllCentres(),
        serviceProxy.getAllSalesman(),
        serviceProxy.findProductCombo('getAllRecords', undefined, undefined, undefined, undefined, undefined, undefined),
      ]);
      const leadConversations = await serviceProxy.findLeadConversations(
        undefined,
        undefined,
        JSON.stringify([{ leadId: { $in: leads.data.map((item: any) => item._id) } }]),
        30,
        'createdAt|desc',
        undefined,
        undefined,
      );

      this.setState({
        leadFilters: leadFilters.data || [],
        stages: stages.data || [],
        statuses: statuses.data || [],
        centres: centres.data || [],
        salesmen: salesmen.data || [],
        combos: combos.data || [],
        leadConversations,
      });
    } catch (error) {
      message.error(error.message);
      this.setState({
        loading: {
          ...this.state.loading,
          table: true,
        },
      });
    }
  }

  loadPreviousPage = async () => {
    try {
      this.setState({
        loading: {
          ...this.state.loading,
          table: true,
        },
      });

      // fetch data
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const leads = await serviceProxy.findLeads(
        undefined,
        this.state.search,
        this.state.filters.map((val: any) => {
          return { [val.key.value]: `${val.key.value}|${val.value.value}` };
        }),
        10,
        undefined,
        'createdAt|desc',
        this.state.before,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      this.setState({
        data: leads.data,
        before: leads.before,
        after: leads.after,
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    } catch (error) {
      message.error(error.message);
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  }

  loadNextPage = async () => {
    try {
      this.setState({
        loading: {
          ...this.state.loading,
          table: true,
        },
      });

      // fetch data
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const leads = await serviceProxy.findLeads(
        undefined,
        this.state.search,
        this.state.filters.map((val: any) => {
          return { [val.key.value]: `${val.key.value}|${val.value.value}` };
        }),
        10,
        undefined,
        'createdAt|desc',
        undefined,
        this.state.after,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      this.setState({
        data: leads.data,
        before: leads.before,
        after: leads.after,
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    } catch (error) {
      message.error(error.message);
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  }

  updateLead = async (payload: any) => {
    if (payload) {
      this.setState({
        data: this.state.data.map((val: any) => {
          return val._id === payload._id ? payload : val;
        }),
      });

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      try {
        await serviceProxy.updateLead(payload._id, {
          operation: 'updateDetail',
          payload,
        });
        message.success(translate('lang:updateSuccess'), 1);
      } catch (error) {
        message.error(error.message || translate('lang:internalError'));
      }
    }
  }

  changeFilterTab = async (newTabKey: string, filterTree: any[]) => {
    try {
      this.setState({
        loading: {
          ...this.state.loading,
          table: true,
        },
      });

      const filters: any = [];
      let search = '';
      if (newTabKey === 'all') {
        //
      } else if (newTabKey === 'user') {
        //
      } else {
        const leadFilter = this.state.leadFilters.filter((item) => item._id === newTabKey)[0];
        search = leadFilter.search;
        for (const item of leadFilter.filters) {
          const selectedKey = filterTree.filter((val) => val.value === item.fieldName)[0];
          const seletedValue = selectedKey.children.filter((val: any) => val.value === item.value)[0];
          filters.push({
            key: { label: selectedKey.label, value: selectedKey.value },
            value: { label: seletedValue.label, value: seletedValue.value },
          });
        }
      }

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const appliedFilters = filters.map((val: any) => {
        return { [val.key.value]: `${val.key.value}|${val.value.value}` };
      });
      if (newTabKey === 'user') {
        appliedFilters.push({ 'owner.id': `owner.id|${firebase.auth().currentUser!.uid}` });
      }
      const leads = await serviceProxy.findLeads(
        undefined,
        search,
        appliedFilters,
        this.state.pageSize,
        undefined,
        this.state.sortBy,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      this.setState({
        data: leads.data,
        before: leads.before,
        after: leads.after,
        filters,
        search,
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    } catch (error) {
      message.error(error.message);
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  }

  addFilter = async (filter: {
    key: {
      label: string; value: string
    };
    value: {
      label: string; value: string
    };
  }) => {
    try {
      this.setState({
        loading: {
          ...this.state.loading,
          table: true,
        },
      });

      // calculate new filter
      let filters: any;
      if (this.state.filters.map((item) => item.key.value).indexOf(filter.key.value) > -1) {
        filters = this.state.filters.map((val) => {
          return val.key.value === filter.key.value ? filter : val;
        });
      } else {
        filters = [...this.state.filters, filter];
      }

      // fetch data
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const leads = await serviceProxy.findLeads(
        undefined,
        this.state.search,
        filters.map((val: any) => {
          return { [val.key.value]: `${val.key.value}|${val.value.value}` };
        }),
        10,
        undefined,
        'createdAt|desc',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      this.setState({
        filters,
        data: leads.data,
        before: leads.before,
        after: leads.after,
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    } catch (error) {
      message.error(error.message);
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  }

  removeFilter = async (removeFilter: {
    key: {
      label: string; value: string
    };
    value: {
      label: string; value: string
    };
  }) => {
    try {
      this.setState({
        loading: {
          ...this.state.loading,
          table: true,
        },
      });

      // calculate new filter
      const filters = this.state.filters.filter((item) => item.key.value !== removeFilter.key.value);

      // fetch data
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const leads = await serviceProxy.findLeads(
        undefined,
        this.state.search,
        filters.map((val: any) => {
          return { [val.key.value]: `${val.key.value}|${val.value.value}` };
        }),
        10,
        undefined,
        'createdAt|desc',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      this.setState({
        filters,
        data: leads.data,
        before: leads.before,
        after: leads.after,
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    } catch (error) {
      message.error(error.message);
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  }

  searchAutoCompleteSource = async (search: string) => {
    try {
      if (!search) {
        this.setState({
          autoCompleteSource: [],
        });
      } else {
        const idToken = await firebase.auth().currentUser!.getIdToken();
        const serviceProxy = getServiceProxy(idToken);
        const leads = await serviceProxy.findLeads(
          undefined,
          search,
          this.state.filters.map((val: any) => {
            return { [val.key.value]: `${val.key.value}|${val.value.value}` };
          }),
          10,
          undefined,
          this.state.sortBy,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
        );

        this.setState({
          autoCompleteSource: leads.data,
        });
      }
    } catch (error) {
      //
    }
  }

  selectFromAutocomplete = (id: string) => {
    const filteredLead = this.state.autoCompleteSource.filter((val: any) => {
      return val._id === id;
    });
    if (filteredLead && filteredLead.length) {
      this.setState({
        before: undefined,
        after: undefined,
        data: filteredLead,
      });
    }
  }

  createLeadFilter = async (values: { [key: string]: any }): Promise<boolean> => {
    if (!this.state.search && this.state.filters.length === 0) {
      message.error(translate('lang:filterMustHaveCondition'));
      return false;
    } else {
      try {
        this.setState({
          loading: {
            ...this.state.loading,
            modal: true,
          },
        });

        const idToken = await firebase.auth().currentUser!.getIdToken();
        const serviceProxy = getServiceProxy(idToken);
        const newFilter = await serviceProxy.createLeadFilter({
          filters: this.state.filters.map((item) => ({
            fieldName: item.key.value,
            operator: '==',
            value: item.value.value,
          })),
          search: this.state.search,
          name: values.name,
        });

        this.setState({
          leadFilters: [...this.state.leadFilters, {
            _id: (newFilter as any).id,
            filters: this.state.filters.map((item) => ({
              fieldName: item.key.value,
              operator: '==',
              value: item.value.value,
            })),
            search: this.state.search,
            name: values.name,
            createdAt: new Date().getTime(),
            owner: firebase.auth().currentUser!.uid,
          }],
          loading: {
            ...this.state.loading,
            modal: false,
          },
        });
        message.success(translate('lang:createSuccess'));
        return true;
      } catch (error) {
        message.error(error.message);
        this.setState({
          loading: {
            ...this.state.loading,
            modal: false,
          },
        });
        return false;
      }
    }
  }

  handleSearch = async (toolbarState: { search?: string, sortBy?: string }) => {
    try {
      this.setState({
        search: toolbarState.search || '',
        sortBy: toolbarState.sortBy as any,
        loading: {
          ...this.state.loading,
          table: true,
        },
      });

      // fetch data
      const sortBy = toolbarState.sortBy && sortData.filter((item) => item.value === toolbarState.sortBy)[0]
        ? sortData.filter((item) => item.value === toolbarState.sortBy)[0].value
        : 'createdAt|desc';
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const leads = await serviceProxy.findLeads(
        undefined,
        toolbarState.search,
        this.state.filters.map((val: any) => {
          return { [val.key.value]: `${val.key.value}|${val.value.value}` };
        }),
        10,
        undefined,
        sortBy,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );

      this.setState({
        data: leads.data,
        before: leads.before,
        after: leads.after,
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    } catch (error) {
      message.error(error.message);
      this.setState({
        loading: {
          ...this.state.loading,
          table: false,
        },
      });
    }
  }

  deleteLeadFilter = async (leadFilter: LeadFilter) => {
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      await serviceProxy.deleteLeadFilter(leadFilter._id);
      this.setState({
        leadFilters: this.state.leadFilters.filter((item) => item._id !== leadFilter._id),
      }, () => this.changeFilterTab('all', []));
    } catch (error) {
      message.error(error.message);
    }
  }

  render() {
    const filterTree = [
      {
        label: translate('lang:stage'),
        value: 'currentStage',
        children: this.state.stages.map((stage) => ({
          label: stage.value.name,
          value: stage.value.name,
        })),
      },
      {
        label: translate('lang:status'),
        value: 'currentStatus',
        children: [
          ...this.state.statuses.map((status) => ({
            label: status.value.name,
            value: status.value.name,
          })),
          {
            label: 'None',
            value: null,
          },
        ],
      },
      {
        label: translate('lang:centre'),
        value: 'centre._id',
        children: this.state.centres.map((centre) => ({
          label: centre.name,
          value: centre.id || centre._id,
        })),
      },
      {
        label: translate('lang:owner'),
        value: 'owner.id',
        children: [
          ...this.state.salesmen.map((salemen) => ({
            label: salemen.fullName,
            value: salemen.id || salemen._id,
          })),
          {
            label: 'Unassigned',
            value: null,
          },
        ],
      },
      {
        label: translate('lang:productCombo'),
        value: 'productOrder.comboId',
        children: this.state.combos.map((combo) => ({
          label: combo.name,
          value: combo._id,
        })),
      },
    ];

    return (
      <div>
        <h2 style={{ marginBottom: 24 }}>{translate('lang:addNewTransaction')}</h2>
        <BorderWrapper>
          <Tabs defaultActiveKey='all' onChange={(activeKey: string) => this.changeFilterTab(activeKey, filterTree)}>
            <TabPane tab='All' key='all'>
              <Main
                search={this.state.search}
                loading={this.state.loading}
                leads={{
                  data: this.state.data,
                  before: this.state.before,
                  after: this.state.after,
                }}
                stages={this.state.stages}
                filterTree={filterTree}
                addFilter={this.addFilter}
                filters={this.state.filters}
                handleSearch={this.handleSearch}
                createLeadFilter={this.createLeadFilter}
                removeFilter={this.removeFilter}
                loadPreviousPage={this.loadPreviousPage}
                loadNextPage={this.loadNextPage}
                leadConversations={this.state.leadConversations}
                centres={this.state.centres}
                salesmen={this.state.salesmen}
                updateLead={this.updateLead}
                authUser={this.props.authUser}
                createPaymentTransaction={this.createPaymentTransaction}
                updateRemainingAndTuitionAD={this.updateRemainingAndTuitionAD}
                autoCompleteSource={this.state.autoCompleteSource}
                searchAutoCompleteSource={this.searchAutoCompleteSource}
                selectFromAutocomplete={this.selectFromAutocomplete}
              />
            </TabPane>
            {this.state.leadFilters.map((filter) => (
              <TabPane
                tab={(
                  <div>
                    {filter.name} &nbsp;&nbsp;
                    <Popconfirm title={translate('lang:confirmDeleteFilter')} onConfirm={() => this.deleteLeadFilter(filter)}>
                      <a style={{ fontSize: '16px' }}><Icon type='delete' /></a>
                    </Popconfirm>
                  </div>
                )}
                key={filter._id}
              >
                <Main
                  search={this.state.search}
                  loading={this.state.loading}
                  stages={this.state.stages}
                  leads={{
                    data: this.state.data,
                    before: this.state.before,
                    after: this.state.after,
                  }}
                  filterTree={filterTree}
                  addFilter={this.addFilter}
                  filters={this.state.filters}
                  handleSearch={this.handleSearch}
                  createLeadFilter={this.createLeadFilter}
                  removeFilter={this.removeFilter}
                  loadPreviousPage={this.loadPreviousPage}
                  loadNextPage={this.loadNextPage}
                  leadConversations={this.state.leadConversations}
                  centres={this.state.centres}
                  salesmen={this.state.salesmen}
                  updateLead={this.updateLead}
                  authUser={this.props.authUser}
                  createPaymentTransaction={this.createPaymentTransaction}
                  updateRemainingAndTuitionAD={this.updateRemainingAndTuitionAD}
                  autoCompleteSource={this.state.autoCompleteSource}
                  searchAutoCompleteSource={this.searchAutoCompleteSource}
                  selectFromAutocomplete={this.selectFromAutocomplete}
                />
              </TabPane>
            ))}
          </Tabs>
        </BorderWrapper>
      </div>
    );
  }
};

const mapState = (rootState: any) => {
  return {
    authUser: rootState.profileModel.authUser,
  };
};

const mapDispatch = (_rootReducer: any) => {
  return {};
};

const LeadsForReceptionistScreen = Authorize(withRematch(initStore, mapState, mapDispatch)(Screen), [PERMISSIONS.LEADS.VIEW], true, 'admin');

export {
  LeadsForReceptionistScreen,
};
