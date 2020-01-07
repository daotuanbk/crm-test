import React from 'react';
import {
  Modal,
  Form,
  Select,
  Button,
  Spin,
  notification,
} from 'antd';
import { getServiceProxy } from '@client/services';
import firebase from 'firebase';
import _ from 'lodash';
import { getErrorMessage } from '@client/core';

interface Centre {
  _id: string;
  name: string;
}

interface Assignee {
  _id: string;
  fullName: string;
}

interface State {
  centres: Centre[];
  assignees: Assignee[];
  selectedCentreId?: string;
  selectedAssigneeId?: string;
  loading: boolean;
  assigneeLoading: boolean;
  assigning: boolean;
}

interface Props {
  visible: boolean;
  toggle: () => void;
  leads: any[];
  onDone: () => void;
}

interface AssignResult {
  lead: any;
  message: string;
  status: 'Succeeded' | 'Failed';
}

const resultStyles = {
  'Failed': {
    color: '#cf1322',
  },
  'Succeeded': {
    color: '#73d13d',
  },
};

const showAssignResults = (results: AssignResult[]) => {
  const statusCount = _.countBy(results, 'status');
  const statusSummary = _.map(statusCount, (count, status) => (
    <div><b style={resultStyles[status]}>{status}</b> : {count} </div>
  ));
  const type = statusCount['Failed'] === 0
    ? 'success'
    : statusCount['Succeeded'] === 0
    ? 'error'
    : 'warning';
  notification[type]({
    message: 'Done',
    description: <div>{statusSummary}</div>,
    placement: 'bottomRight',
  });
};

export class LeadAssignModal extends React.Component<Props, State> {

  state: State = {
    centres: [],
    assignees: [],
    loading: false,
    assigneeLoading: false,
    assigning: false,
  };

  reassignAndClose = () => {
    this.props.toggle();
  }

  componentDidMount = async () => {
    this.setState({
      loading: true,
      selectedCentreId: '',
      selectedAssigneeId: '',
    });
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const response = await serviceProxy.getCentres(true);
      this.setState({
        centres: response.data,
      });
    } catch (err) {
      notification.error({
        message: 'Error',
        description: getErrorMessage(err),
        placement: 'bottomRight',
      });
    } finally {
      this.setState({ loading: false });
    }
  }

  selectCentreAndReloadAssignee = (centreId: string) => {
    this.setState({
      selectedCentreId: centreId,
    }, this.loadAssignees);
  }

  loadAssignees = async () => {
    const { selectedCentreId } = this.state;
    this.setState({
      assigneeLoading: true,
      selectedAssigneeId: undefined,
      assignees: [],
    });
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const response = await serviceProxy.findUsers(
        undefined,
        undefined,
        selectedCentreId as any,
        true,
        undefined,
        100,
        'createdAt|desc',
        undefined,
        undefined,
      );
      this.setState({
        assignees: response.data,
      });
    } catch (err) {
      notification.error({
        message: 'Error',
        description: getErrorMessage(err),
        placement: 'bottomRight',
      });
    } finally {
      this.setState({
        assigneeLoading: false,
      });
    }
  }

  selectAssignee = (assigneeId: string) => {
    this.setState({
      selectedAssigneeId: assigneeId,
    });
  }

  assign = async () => {
    this.setState({
      assigning: true,
    });

    const { leads, toggle, onDone: assignDone } = this.props;
    const { selectedAssigneeId } = this.state;
    const leadByIds = _.mapKeys(leads, '_id');
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const response = await serviceProxy.updateLead(
        '_many',
        {
          operation: 'updateOwner',
          payload: {
            ids: _.map(leads, '_id'),
            newOwnerId: selectedAssigneeId,
          },
        },
      ) as any;

      const results = response.data.map((r: any) => ({
        lead: leadByIds[r.id],
        message: r.message,
        status: r.status,
      } as AssignResult));
      toggle();
      await assignDone();
      showAssignResults(results);
    } catch (err) {
      notification.error({
        message: 'Error',
        description: getErrorMessage(err),
        placement: 'bottomRight',
      });
    } finally {
      this.setState({
        assigning: false,
      });
    }
  }

  renderForm() {
    const {
      centres,
      assignees,
      selectedCentreId,
      selectedAssigneeId,
      assigneeLoading,
    } = this.state;
    return (
      <Form>
        <h4>Centre</h4>
        <Form.Item>
          <Select
            defaultValue=''
            value={selectedCentreId}
            onChange={(centreId: string) => this.selectCentreAndReloadAssignee(centreId)}
          >
            {
              centres.map((centre: Centre) => (
                <Select.Option value={centre._id} key={centre._id}>{centre.name}</Select.Option>
              ))
            }
          </Select>
        </Form.Item>
        <h4>Assignee</h4>
        <Form.Item>
          <Select
            loading={assigneeLoading}
            value={selectedAssigneeId}
            onChange={this.selectAssignee}
          >
            {
              assignees.map((assignee: Assignee) => (
                <Select.Option value={assignee._id} key={assignee._id}>{assignee.fullName}</Select.Option>
              ))
            }
          </Select>
        </Form.Item>
      </Form>
    );
  }

  renderSpin() {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin />
      </div>
    );
  }

  render() {
    const { visible, toggle, leads } = this.props;
    const {
      selectedCentreId,
      selectedAssigneeId,
      loading,
      assigning,
    } = this.state;
    return (
      <Modal
        visible={visible}
        onOk={this.reassignAndClose}
        onCancel={toggle}
        title='Reassign'
        footer={[
          <Button key='back' onClick={toggle}>
            Cancel
          </Button>,
          <Button
            key='submit'
            type='primary'
            loading={assigning}
            onClick={this.assign}
            disabled={!selectedCentreId || !selectedAssigneeId}
          >
            Assign
          </Button>,
        ]}
      >
        <h3 style={{marginBottom: '2rem'}} >
          Assign these <b>{leads.length}</b> leads to
        </h3>
        {
          loading
          ? this.renderSpin()
          : this.renderForm()
        }
      </Modal>
    );
  }
}
