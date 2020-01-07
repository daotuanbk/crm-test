import React from 'react';
import { SectionBox, BorderWrapper } from '@client/components';
import { Row, Col, Icon, Spin, message } from 'antd';
import { translate } from '@client/i18n';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { LeadAppointment as LeadAppointmentSchema } from '@client/services/service-proxies';
import { LEAD_TASK_STATUS_UNFINISHED, LEAD_TASK_STATUS_FINISHED } from '@client/core';
import moment from 'moment';
import { AppointmentListItem } from '../AppointmentListItem';
import { AppointmentModal } from '../AppointmentModal';
import './styles.less';

interface LeadAppointment extends LeadAppointmentSchema {
  checked: boolean;
}

interface State {
  loading: {
    modal: boolean;
    form: boolean;
  };
  showing: boolean;
  modal: {
    create?: any;
    update?: any;
  };
  appointments: any[];
  showCompletedAppointments: boolean;
}
interface Props {
  users: any[];
  id: string;
}

export class AppointmentList extends React.Component<Props, State> {
  currentUser: any;

  overdue = false;

  state: State = {
    loading: {
      modal: false,
      form: true,
    },
    modal: {
      create: false,
    },
    appointments: [],
    showCompletedAppointments: true,
    showing: true,
  };

  async componentDidMount() {
    this.currentUser = firebase.auth().currentUser;
    const serviceProxy = await this.getServiceProxy();
    const appointments = await serviceProxy.findLeadAppointments(
      'getByLeadId',
      JSON.stringify({
        leadId: this.props.id,
      }),
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
    const nextState: any = {
      loading: {
        ...this.state.loading,
        form: false,
      },
    };
    if (appointments && appointments.data) {
      nextState.appointments = appointments.data;
    }
    this.setState(nextState);
  }

  getServiceProxy = async () => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    return getServiceProxy(idToken);
  };

  closeModal = () => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: undefined,
        update: undefined,
      },
    });
  };

  handleSubmit = async (values: LeadAppointment, formikBag: any) => {
    if (values.assigneeId) {
      if (typeof values.assigneeId !== 'string') {
        values.assigneeId = (values.assigneeId as any)._id;
      }
    }
    this.setState({
      loading: {
        ...this.state.loading,
        modal: true,
      },
    });

    try {
      const serviceProxy = await this.getServiceProxy();
      let result: any;
      const nextState = {
        loading: {
          ...this.state.loading,
          modal: false,
        },
        modal: {
          ...this.state.modal,
          create: undefined,
          update: undefined,
        },
      };
      if (this.state.modal.create) {
        result = await serviceProxy.createLeadAppointment({
          ...values,
          leadId: this.props.id,
          assigneeId: this.currentUser.uid,
        });
        const newAppointment = await serviceProxy.findLeadAppointmentById(
          result.id,
        );
        (nextState as any).appointments = [
          newAppointment,
          ...this.state.appointments,
        ];
      } else {
        const newInfo = { ...this.state.modal.update, ...values };
        await serviceProxy.updateLeadAppointment(newInfo._id, {
          operation: 'updateDetail',
          payload: newInfo,
        });
        (nextState as any).appointments = this.state.appointments.map(
          (item: LeadAppointment) => {
            if (item.id === values.id) {
              return {
                ...this.state.modal.update,
                ...values,
              };
            }
            return item;
          },
        );
      }
      message.success(
        this.state.modal.create
          ? translate('lang:createSuccess')
          : translate('lang:updateSuccess'),
      );
      this.setState(nextState);
      if (formikBag) formikBag.resetForm({});
    } catch (error) {
      message.error(JSON.parse(error.response).message);
      this.setState({
        loading: {
          ...this.state.loading,
          modal: false,
        },
      });
    }
  };

  openModal = (appointment: LeadAppointment) => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: appointment ? undefined : {},
        update: appointment ? appointment : undefined,
      },
    });
  };

  finishAppointment = (appointmentId: string) => {
    const { appointments } = this.state;
    const appointment =
      appointments &&
      appointments.find((item: LeadAppointment) => item.id === appointmentId);
    if (!appointment) return;
    const newAppointment = { ...appointment };
    newAppointment.status = LEAD_TASK_STATUS_FINISHED;
    newAppointment.finishedAt = moment().valueOf();
    newAppointment.checked = true;
    this.handleSubmit(newAppointment, null);
  };

  undoAppointment = (appointmentId: string) => {
    const { appointments } = this.state;
    const appointment =
      appointments &&
      appointments.find((item: LeadAppointment) => item.id === appointmentId);
    if (!appointment) return;
    const newAppointment = { ...appointment };
    newAppointment.status = LEAD_TASK_STATUS_UNFINISHED;
    newAppointment.finishedAt = undefined;
    newAppointment.assigneeId = this.currentUser.uid;
    newAppointment.checked = false;
    this.handleSubmit(newAppointment, null);
  };

  removeAppointment = async (id: string) => {
    try {
      const serviceProxy = await this.getServiceProxy();
      await serviceProxy.removeLeadAppointment(id);
      message.success(translate('lang:deleteSuccess'));
      this.setState({
        appointments: this.state.appointments.filter(
          (appointment: LeadAppointment) => {
            return appointment.id !== id;
          },
        ),
        modal: {
          ...this.state.modal,
          create: undefined,
          update: undefined,
        },
      });
    } catch (error) {
      message.error(JSON.parse(error.response).message);
    }
  };

  toggleCompletedAppointments = () => {
    this.setState({
      showCompletedAppointments: !this.state.showCompletedAppointments,
    });
  };

  renderOverdueAppointments = (appointments: LeadAppointment[]) => {
    const overdueAppointments =
      appointments &&
      appointments.filter((appointment: LeadAppointment) => {
        if (appointment.status !== LEAD_TASK_STATUS_UNFINISHED) return false;
        const format = 'DD-MM-YYYY';
        let isDueAt = false;
        if (
          moment(appointment.dueAt).format(format) === moment().format(format)
        ) {
          const { dueAt } = appointment;
          if (!dueAt) return false;
          const now = moment().valueOf();
          if (dueAt <= now) {
            this.overdue = true;
            isDueAt = true;
          }
          return false;
        }
        return isDueAt;
      });
    if (!overdueAppointments || !overdueAppointments.length) return null;
    this.overdue = true;
    overdueAppointments.sort((a: LeadAppointment, b: LeadAppointment) => {
      return b.dueAt - a.dueAt;
    });
    return (
      <SectionBox>
        <AppointmentListItem
          title='OVERDUE'
          openModal={this.openModal}
          onChangeStatus={this.finishAppointment}
          appointments={overdueAppointments}
        />
      </SectionBox>
    );
  };

  renderScheduledAppointments = (appointments: LeadAppointment[]) => {
    const scheduledAppointments =
      appointments &&
      appointments.filter((appointment: LeadAppointment) => {
        if (appointment.status !== LEAD_TASK_STATUS_UNFINISHED) return false;
        const format = 'DD-MM-YYYY';
        if (
          moment(appointment.dueAt).format(format) === moment().format(format)
        ) {
          return false;
        }
        const { dueAt } = appointment;
        if (!dueAt) return false;
        const now = moment().valueOf();
        return dueAt > now;
      });
    if (!scheduledAppointments || !scheduledAppointments.length) return null;
    scheduledAppointments.sort((a: LeadAppointment, b: LeadAppointment) => {
      return a.dueAt - b.dueAt;
    });
    return (
      <SectionBox>
        <AppointmentListItem
          title='SCHEDULED'
          openModal={this.openModal}
          onChangeStatus={this.finishAppointment}
          appointments={scheduledAppointments}
        />
      </SectionBox>
    );
  };

  renderTodayAppointments = (appointments: LeadAppointment[]) => {
    const todayAppointments =
      appointments &&
      appointments.filter((appointment: LeadAppointment) => {
        if (appointment.status !== LEAD_TASK_STATUS_UNFINISHED) return false;
        const format = 'DD-MM-YYYY';
        return (
          moment(appointment.dueAt).format(format) === moment().format(format)
        );
      });
    if (!todayAppointments || !todayAppointments.length) return null;
    todayAppointments.sort((a: LeadAppointment, b: LeadAppointment) => {
      return a.dueAt - b.dueAt;
    });
    return (
      <SectionBox>
        <AppointmentListItem
          title='TODAY'
          openModal={this.openModal}
          onChangeStatus={this.finishAppointment}
          appointments={todayAppointments}
        />
      </SectionBox>
    );
  };

  renderCompletedAppointments = (appointments: LeadAppointment[]) => {
    const { showCompletedAppointments } = this.state;
    const completedAppointments =
      appointments &&
      appointments.filter((appointment: LeadAppointment) => {
        return appointment.status === LEAD_TASK_STATUS_FINISHED;
      });
    completedAppointments.sort((a: LeadAppointment, b: LeadAppointment) => {
      return b.finishedAt - a.finishedAt;
    });
    if (!completedAppointments || !completedAppointments.length) return null;
    return (
      <React.Fragment>
        {showCompletedAppointments && (
          <SectionBox>
            <AppointmentListItem
              title='COMPLETED'
              openModal={this.openModal}
              onChangeStatus={this.undoAppointment}
              appointments={completedAppointments}
            />
          </SectionBox>
        )}
        <SectionBox>
          <div
            onClick={this.toggleCompletedAppointments}
            style={{
              padding: '15px 15px 0px 15px',
              color: 'blue',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            {!showCompletedAppointments
              ? translate('lang:showCompletedAppointments')
              : translate('lang:hideCompletedAppointments')}
          </div>
        </SectionBox>
      </React.Fragment>
    );
  };

  renderContent = () => {
    const { form } = this.state.loading;
    const { showing } = this.state;
    if (form) {
      return (
        <div
          style={{
            height: '200px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Spin />
        </div>
      );
    }
    if (!showing) {
      return null;
    }
    let { appointments } = this.state;
    appointments = appointments.map((appointment: LeadAppointment) => {
      if (appointment.assigneeId) {
        if (typeof appointment.assigneeId === 'string') {
          const assignee = this.props.users.find((user: any) => {
            return user._id === appointment.assigneeId;
          });
          appointment.assigneeId = (assignee
            ? { fullName: assignee.fullName }
            : {}) as any;
        }
      }
      return appointment;
    });
    if (!appointments.length) return null;
    return (
      <React.Fragment>
        {this.renderTodayAppointments(appointments)}
        {this.renderOverdueAppointments(appointments)}
        {this.renderScheduledAppointments(appointments)}
        {this.renderCompletedAppointments(appointments)}
      </React.Fragment>
    );
  };

  render() {
    const { showing } = this.state;

    return (
      <BorderWrapper style={{ marginTop: '24px' }}>
        <div>
          <Row>
            <Col xs={12}>
              <h3>{translate('lang:appointments')}</h3>
            </Col>
            <Col
              xs={12}
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  width: '50%',
                }}
              >
                {showing ? (
                  <Icon
                    type='up-square'
                    style={{
                      color: '#aaa',
                      fontSize: '18px',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      this.setState({ showing: !this.state.showing });
                    }}
                  />
                ) : (
                  <Icon
                    type='down-square'
                    style={{
                      color: '#aaa',
                      fontSize: '18px',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      this.setState({ showing: !this.state.showing });
                    }}
                  />
                )}
              </div>
            </Col>
            <Col
              xs={12}
              offset={12}
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '10px',
              }}
            >
              <a
                onClick={() => {
                  this.openModal(
                    this.state.modal.create || this.state.modal.update,
                  );
                }}
              >
                {translate('lang:addAppointment')}
              </a>
            </Col>
          </Row>
        </div>

        {this.renderContent()}

        {(this.state.modal.create || this.state.modal.update) && (
          <AppointmentModal
            onDelete={this.removeAppointment}
            title={
              this.state.modal.update
                ? translate('lang:updateAppointment')
                : translate('lang:createAppointment')
            }
            visible={
              Boolean(this.state.modal.update) ||
              Boolean(this.state.modal.create)
            }
            handleSubmit={this.handleSubmit}
            closeModal={this.closeModal}
            initialValue={
              this.state.modal.update
                ? {
                    ...this.state.modal.update,
                  }
                : this.state.modal.create
            }
            loading={this.state.loading.modal}
          />
        )}
      </BorderWrapper>
    );
  }
}
