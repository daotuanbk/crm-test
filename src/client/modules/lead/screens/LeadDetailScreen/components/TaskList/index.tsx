import React from 'react';
import { SectionBox, BorderWrapper } from '@client/components';
import { Row, Col, Icon, Spin, message } from 'antd';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import {
  LeadTask as LeadTaskSchema,
  User,
} from '@client/services/service-proxies';
import {
  LEAD_TASK_STATUS_UNFINISHED,
  LEAD_TASK_STATUS_FINISHED,
} from '@client/core';
import moment from 'moment';
import { translate } from '@client/i18n';
import { TaskModal } from '../TaskModal';
import { TaskListItem } from '../TaskListItem';
import './styles.less';

export interface LeadTask extends LeadTaskSchema {
  checked: boolean;
}

interface State {
  loading: {
    modal: boolean;
    form: boolean;
  };
  showing: boolean;
  modal: {
    create?: LeadTask | any;
    update?: LeadTask | any;
  };
  tasks: LeadTask[];
  showCompletedTasks: boolean;
}

interface Props {
  users: User[];
  _id: string;
}

export class TaskList extends React.Component<Props, State> {
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
    tasks: [],
    showCompletedTasks: true,
    showing: true,
  };

  async componentDidMount() {
    this.currentUser = firebase.auth().currentUser!;
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const tasks = await serviceProxy.findLeadTasksByLeadId(this.props._id);

    const nextState: any = {
      loading: {
        ...this.state.loading,
        form: false,
      },
    };

    if (tasks && tasks.data) {
      nextState.tasks = tasks.data;
    }

    this.setState(nextState);
  }
  closeModal = () => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: undefined,
        update: undefined,
      },
    });
  };
  handleSubmit = async (values: any, formikBag: any) => {
    if (values.assigneeId) {
      // if assigneeId is an object, replace with a stringId
      if (typeof values.assigneeId !== 'string') {
        values.assigneeId = values.assigneeId._id;
      }
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
        result = await serviceProxy.createLeadTask({
          ...values,
          leadId: this.props._id,
          assigneeId: this.currentUser.uid,
        });
        const newTask = await serviceProxy.findLeadTaskById(result._id);
        (nextState as any).tasks = [newTask, ...this.state.tasks];
      } else {
        const newInfo = { ...this.state.modal.update, ...values };
        await serviceProxy.updateLeadTask(newInfo._id, {
          operation: 'updateDetail',
          payload: newInfo,
        });
        (nextState as any).tasks = this.state.tasks.map((item) => {
          if (item._id === values._id) {
            return {
              ...this.state.modal.update,
              ...values,
            };
          }
          return item;
        });
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

  openModal = (task?: any) => {
    this.setState({
      modal: {
        ...this.state.modal,
        create: task ? undefined : {},
        update: task ? task : undefined,
      },
    });
  };

  finishTask = (taskId: string) => {
    const { tasks } = this.state;
    const task = tasks && tasks.find((item: any) => item._id === taskId);
    if (!task) return;
    const newTask = { ...task };
    newTask.status = LEAD_TASK_STATUS_FINISHED;
    newTask.finishedAt = moment().valueOf();
    newTask.checked = true;
    this.handleSubmit(newTask, null);
  };

  undoTask = (taskId: string) => {
    const { tasks } = this.state;
    const task = tasks && tasks.find((item: any) => item._id === taskId);
    if (!task) return;
    const newTask = { ...task };
    newTask.status = LEAD_TASK_STATUS_UNFINISHED;
    newTask.finishedAt = undefined as any;
    newTask.assigneeId = this.currentUser.uid;
    newTask.checked = false;
    this.handleSubmit(newTask, null);
  };

  removeTask = async (id: string) => {
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      await serviceProxy.removeLeadTask(id);
      message.success(translate('lang:deleteSuccess'));
      this.setState({
        tasks: this.state.tasks.filter((task: any) => {
          return task._id !== id;
        }),
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

  toggleCompletedTasks = () => {
    this.setState({ showCompletedTasks: !this.state.showCompletedTasks });
  };

  renderOverdueTasks = (tasks: any[]) => {
    const overdueTasks =
      tasks &&
      tasks.filter((task: any) => {
        if (task.status !== LEAD_TASK_STATUS_UNFINISHED) return false;
        const { dueAt } = task;
        if (!dueAt) return false;
        const now = moment().valueOf();
        return dueAt <= now;
      });
    if (!overdueTasks || !overdueTasks.length) return null;
    this.overdue = true;
    overdueTasks.sort((a: any, b: any) => {
      return b.dueAt - a.dueAt;
    });
    return (
      <SectionBox>
        <TaskListItem
          title='OVERDUE'
          openModal={this.openModal}
          onChangeStatus={this.finishTask}
          tasks={overdueTasks}
        />
      </SectionBox>
    );
  };

  renderScheduledTasks = (tasks: any[]) => {
    const scheduledTasks =
      tasks &&
      tasks.filter((task: any) => {
        if (task.status !== LEAD_TASK_STATUS_UNFINISHED) return false;
        const { dueAt } = task;
        if (!dueAt) return false;
        const now = moment().valueOf();
        return dueAt > now;
      });
    if (!scheduledTasks || !scheduledTasks.length) return null;
    scheduledTasks.sort((a: any, b: any) => {
      return a.dueAt - b.dueAt;
    });
    return (
      <SectionBox>
        <TaskListItem
          title='SCHEDULED'
          openModal={this.openModal}
          onChangeStatus={this.finishTask}
          tasks={scheduledTasks}
        />
      </SectionBox>
    );
  };

  renderCompletedTasks = (tasks: any[]) => {
    const { showCompletedTasks } = this.state;
    const completedTasks =
      tasks &&
      tasks.filter((task: any) => {
        return task.status === LEAD_TASK_STATUS_FINISHED;
      });
    completedTasks.sort((a: any, b: any) => {
      return b.finishedAt - a.finishedAt;
    });
    if (!completedTasks || !completedTasks.length) return null;
    return (
      <React.Fragment>
        {showCompletedTasks && (
          <SectionBox>
            <TaskListItem
              title='COMPLETED'
              openModal={this.openModal}
              onChangeStatus={this.undoTask}
              tasks={completedTasks}
            />
          </SectionBox>
        )}
        <SectionBox>
          <div
            onClick={this.toggleCompletedTasks}
            style={{
              padding: '15px 15px 0px 15px',
              color: 'blue',
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            {!showCompletedTasks
              ? translate('lang:showCompletedTasks')
              : translate('lang:hideCompletedTasks')}
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
    let { tasks } = this.state;
    tasks = tasks.map((task: any) => {
      if (task.assigneeId) {
        if (typeof task.assigneeId === 'string') {
          const assignee = this.props.users.find((user: any) => {
            return user._id === task.assigneeId;
          });
          task.assigneeId = assignee ? { fullName: assignee.fullName } : {};
        }
      }
      return task;
    });
    if (!tasks.length) return null;
    return (
      <React.Fragment>
        {this.renderOverdueTasks(tasks)}
        {this.renderScheduledTasks(tasks)}
        {this.renderCompletedTasks(tasks)}
      </React.Fragment>
    );
  };

  render() {
    const { showing } = this.state;

    return (
      <BorderWrapper>
        <div>
          <Row>
            <Col xs={12}>
              <h3>
                {translate('lang:tasks')}{' '}
                {this.overdue && <span style={{ color: 'red' }}>!</span>}
              </h3>
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
                {translate('lang:addTask')}
              </a>
            </Col>
          </Row>
        </div>
        {this.renderContent()}
        {(this.state.modal.create || this.state.modal.update) && (
          <TaskModal
            onDelete={this.removeTask}
            title={
              this.state.modal.update
                ? translate('lang:updateTask')
                : translate('lang:createTask')
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
