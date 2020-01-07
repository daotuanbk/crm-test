import React from 'react';
import _, { values, cloneDeep, mapKeys, get, flatMap } from 'lodash';
import firebase from 'firebase';
import {
  Col,
  Row,
  notification,
} from 'antd';
import { TableList, TableSort } from '@client/components';
import {
  Filter,
} from './LeadFilter';
import { EditCell } from './TableCells';
import { LeadPagination } from './LeadPagination';
import { ActionType, LeadBulkActionPanel } from './LeadBulkActionPanel';
import { LeadSearchBar } from './LeadSearchBar';
import { translate } from '@client/i18n';
import { getServiceProxy } from '@client/services';
import { TuitionPaidPercent, Lead, LmsEnrollmentStatus } from '@client/services/service-proxies';
import { LeadAssignModal } from './LeadAssignModal';
import { LeadBulkEmailModal } from './LeadBulkEmailModal';
import { LeadDetailDrawer } from '../LeadDetailDrawer';
import { ImportLeadsDrawer } from '../ImportLeadsDrawer';
import produce from 'immer';
import ListControlPanel from '../ListControlPanel';
import { getErrorMessage, Pagination, toSortBy } from '@client/core';
const initialPagination: Pagination = {
  page: 1,
  pageSize: 20,
};

interface Data {
  leads: any;
  total: number;
}

const initialSort: TableSort = {
  field: 'createdAt',
  order: 'descend',
};

interface State {
  importLeadDrawerVisible: boolean;
  drawerVisible: boolean;
  userId: string;
  modal: {
    email: boolean;
    message: boolean;
  };
  autoCompleteSource: any[];
  loading: {
    modal: boolean;
    table: boolean;
  };
  search: string;
  selectedLeads: any[];
  data: Data;
  filter: Filter;
  sort: TableSort | null;
  pagination: Pagination;
  currentAction: ActionType | null;
}
interface Props {
  authUser: any;
  owners: any[];
  id?: string;
}

interface RenderWithRowSpan {
  props: {
    rowSpan: number,
  };
  children: JSX.Element;
}

interface ColumnConfig {
  field: string;
  width: string;
  sorter?: boolean;
  fixed?: string;
  render: (props: any) => JSX.Element | RenderWithRowSpan;
}

interface FilterConfig {
  render: (props: any) => JSX.Element;
  initial: Filter;
}

interface DataConfig {
  shape: (inputLeads: any) => any;
  rowKeyField: string;
}

type RenderBulkAction = (props: any) => JSX.Element;

type RenderControlPanel = (props: any) => JSX.Element;

type RenderEditCell = (props: any) => JSX.Element | RenderWithRowSpan;

export default (
  filterConfig: FilterConfig,
  columnConfigs: ColumnConfig[],
  defaultTableSort?: TableSort,
  renderBulkAction?: RenderBulkAction,
  renderControlPanel?: RenderControlPanel,
  renderEditCell?: RenderEditCell,
  dataConfig?: DataConfig,
) => {
  const rowKeyField = dataConfig ? dataConfig.rowKeyField : '_id';
  const shapeLeads = dataConfig ? dataConfig.shape : (data: any) => data;
  return class LeadDataTable extends React.Component<Props, State> {
    state: State = {
      importLeadDrawerVisible: false,
      drawerVisible: false,
      modal: {
        email: false,
        message: false,
      },
      loading: {
        modal: false,
        table: false,
      },
      autoCompleteSource: [],
      userId: '',
      search: '',
      selectedLeads: [],
      data: {
        leads: {},
        total: 0,
      },
      filter: filterConfig.initial,
      pagination: initialPagination,
      sort: defaultTableSort || initialSort,
      currentAction: null,
    };

    loadLeadDetailData = async () => {
      try {
        const idToken = await firebase.auth().currentUser!.getIdToken();
        const serviceProxy = getServiceProxy(idToken);
        if (this.props.id) {
          const response: any = await serviceProxy.findLeadById(this.props.id);
          this.setState({
            selectedLeads: response ? [response] : [],
            drawerVisible: true,
          });
        }
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
    }

    loadLeadData = async () => {
      const {
        search,
        filter: {
          stage,
          status,
          channel,
          product,
          tuitionProgress,
          reminder,
          appointment,
          createdAt,
          owner,
          centre,
          lmsCourse,
          lmsClass,
          lmsEnrollmentStatus,
        },
        pagination: {
          page,
          pageSize,
        },
        sort,
      } = this.state;

      const operation = undefined;
      const advancedFilter = undefined;
      const sortBy = toSortBy(sort);
      const before = undefined;
      const after = undefined;
      const reminderStart = reminder[0] && reminder[0].toISOString();
      const reminderEnd = reminder[1] && reminder[1].toISOString();
      const appointmentStart = appointment[0] && appointment[0].toISOString();
      const appointmentEnd = appointment[1] && appointment[1].toISOString();
      const createdAtStart = createdAt[0] && createdAt[0].toISOString();
      const createdAtEnd = createdAt[1] && createdAt[1].toISOString();

      this.setState({
        loading: {
          ...this.state.loading,
          table: true,
        },
      });
      try {
        const idToken = await firebase.auth().currentUser!.getIdToken();
        const serviceProxy = getServiceProxy(idToken);
        const response: any = await serviceProxy.findLeads(
          operation,
          search,
          advancedFilter,
          pageSize,
          page,
          sortBy,
          before,
          after,
          stage,
          channel,
          status,
          reminderStart,
          reminderEnd,
          tuitionProgress as TuitionPaidPercent,
          appointmentStart,
          appointmentEnd,
          product,
          createdAtStart,
          createdAtEnd,
          owner,
          centre,
          lmsCourse,
          lmsClass,
          lmsEnrollmentStatus as LmsEnrollmentStatus,
        );
        const shapedLeads = shapeLeads(response.data);
        this.setState({
          data: {
            leads: mapKeys(shapedLeads, rowKeyField),
            total: response.count,
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
    }

    updateFilterAndReload = (filter: Filter) => {
      const { pagination } = this.state;
      this.setState({
        filter,
        pagination: {
          ...pagination,
          page: 1,
        },
      }, () => this.loadLeadData());
    }

    updateSearchAndReload = (search: string) => {
      const { pagination } = this.state;
      this.setState({
        search,
        sort: null,
        pagination: {
          ...pagination,
          page: 1,
        },
      }, () => this.loadLeadData());
    }

    updateSortAndReload = (sort: TableSort) => {
      const { pagination } = this.state;
      const sortToChange = sort.order
        ? sort
        : (defaultTableSort || initialSort);

      this.setState({
        sort: sortToChange,
        pagination: {
          ...pagination,
          page: 1,
        },
      }, () => this.loadLeadData());
    }

    updatePaginationAndReload = (pagination: Pagination) => {
      this.setState({
        pagination,
      }, () => this.loadLeadData());
    }

    changeSelectedLeads = (selectedLeads: any) => {
      this.setState({
        selectedLeads,
      });
    }

    openActionModal = (action: ActionType) => {
      this.setState({
        currentAction: action,
      });
    }

    componentDidMount() {
      this.loadLeadData();
      this.loadLeadDetailData();
    }

    updateOneLead = (lead: any) => {
      const newState = cloneDeep(this.state);
      newState.data.leads[rowKeyField] = lead;
      this.setState(newState);
    }

    showLeadFromAutocomplete = (lead: any) => {
      const { pagination } = this.state;
      this.setState({
        sort: null,
        pagination: {
          ...pagination,
          page: 1,
        },
        data: {
          leads: { [lead[rowKeyField]]: lead },
          total: 1,
        },
      });
    }

    hideAllModals = () => {
      this.setState({
        currentAction: null,
      });
    }

    openLeadDetailDrawer = async (lead?: Lead) => {
      this.setState({
        drawerVisible: true,
        selectedLeads: lead ? [lead] : [],
      });
      history.pushState({}, '', `${window.location.pathname}/${lead && lead._id}`);
    }

    closeLeadDetailDrawer = () => {
      this.setState(produce(this.state, (draftState) => {
        draftState.drawerVisible = false;
        const selectedLead = get(this.state, 'selectedLeads.0');
        if (selectedLead) {
          draftState.data.leads[selectedLead[rowKeyField]] = selectedLead;
        }
      }));
      window.history.replaceState({}, '', '/' + 'leads');
    }

    onLeadDetailDrawerChange = (newLeadInfo: any) => {
      this.setState(produce(this.state, (draftState) => {
        draftState.selectedLeads = [newLeadInfo];
        draftState.data.leads[newLeadInfo[rowKeyField]] = newLeadInfo;
      }));
    };

    closeImportLeadDrawer = () => {
      this.setState(produce(this.state, (draftState) => {
        draftState.importLeadDrawerVisible = false;
      }));
    }

    openImportLeadDrawer = () => {
      this.setState(produce(this.state, (draftState) => {
        draftState.importLeadDrawerVisible = true;
      }));
    };

    render() {
      const { owners } = this.props;
      const { sort, selectedLeads } = this.state;
      const tableColumns = columnConfigs.map((config: ColumnConfig) => {
        const data = {
          title: translate(`lang:${config.field}`),
          key: config.field,
          dataIndex: config.field,
          width: config.width,
          sorter: config.sorter,
          fixed: !!config.fixed,
          sortOrder: get(sort, 'field') === config.field && get(sort, 'order'),
          render: (value: any, record: any) => config.render({ value, record, onLeadChange: this.updateOneLead, owners }),
        };
        return data;
      });

      const bulkActionProps = {
        enabled: this.state.selectedLeads.length > 0,
        onAction: this.openActionModal,
      };

      const controlPanelProps = {
        userId: this.props.authUser.id,
        onAddLeadClick: this.openLeadDetailDrawer,
        onImportLeadClick: this.openImportLeadDrawer,
      };

      const tableColumnsWithActitons = [
        ...tableColumns,
        {
          title: '',
          key: 'edit',
          dataIndex: 'edit',
          width: '20px',
          fixed: 'right',
          render: (_value: any, record: any) => (
            renderEditCell ? (
              renderEditCell({
                record,
                openLeadDetailDrawer: () => this.openLeadDetailDrawer(record),
              })
            ) : (
                <EditCell openLeadDetailDrawer={() => this.openLeadDetailDrawer(record)} />
              )
          ),
        },
      ];
      return (
        <div className='lead-screen'>
          <div>
            <Row gutter={16}>
              <Col xs={12}>
                {
                  renderBulkAction ? (
                    renderBulkAction(bulkActionProps)
                  ) : (
                      <LeadBulkActionPanel {...bulkActionProps} />
                    )
                }
              </Col>
              <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {
                  renderControlPanel ? (
                    renderControlPanel(controlPanelProps)
                  ) : (
                      <ListControlPanel {...controlPanelProps} />
                    )
                }
              </Col>
            </Row>
            <Row style={{ width: '100%' }}>
              <LeadSearchBar
                selectFromAutocomplete={this.showLeadFromAutocomplete}
                onSearch={this.updateSearchAndReload}
                search={this.state.search}
              />
            </Row>
            <Row style={{ width: '100%' }}>
              {
                filterConfig.render({
                  owners,
                  onFitler: this.updateFilterAndReload,
                })
              }
            </Row>
          </div>
          <Row type='flex'>
            <Col xs={24} className='custom-color-select-box'>
              <TableList
                columns={tableColumnsWithActitons}
                haveRowSelection={true}
                noNeedIndex={true}
                dataSource={values(this.state.data.leads)}
                loading={this.state.loading.table}
                onSortChange={this.updateSortAndReload}
                onSelectionChange={this.changeSelectedLeads}
                rowKeyField={rowKeyField}
                selectedRowKeys={flatMap(selectedLeads, rowKeyField)}
                scrollY={'calc(100vh - 200px)'}
              />
              <LeadPagination
                pagination={this.state.pagination}
                onPaginationChange={this.updatePaginationAndReload}
                total={this.state.data.total}
              />
            </Col>
          </Row>
          {this.state.currentAction === 'Reassign' && (
            <LeadAssignModal
              visible={this.state.currentAction === 'Reassign'}
              toggle={this.hideAllModals}
              leads={this.state.selectedLeads}
              onDone={this.loadLeadData}
            />
          )
          }
          {this.state.currentAction === 'BulkEmail' && (
            <LeadBulkEmailModal
              visible={this.state.currentAction === 'BulkEmail'}
              toggle={this.hideAllModals}
              leads={this.state.selectedLeads}
            />
          )
          }
          {this.state.drawerVisible && (
            <LeadDetailDrawer
              onAction={this.openActionModal}
              visible={this.state.drawerVisible}
              leadInfo={this.state.selectedLeads[0]}
              authUser={this.props.authUser}
              closeLeadDetailDrawer={this.closeLeadDetailDrawer}
              onLeadDetailDrawerChange={this.onLeadDetailDrawerChange}
            />
          )
          }
          {this.state.importLeadDrawerVisible && (
            <ImportLeadsDrawer
              visible={this.state.importLeadDrawerVisible}
              closeImportLeadDetailDrawer={this.closeImportLeadDrawer}
              loadLeadData={this.loadLeadData}
            />
          )
          }
        </div>
      );
    }
  };
};
