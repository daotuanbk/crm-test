import React from 'react';
import './InterviewerScreen.less';
import { Col, Row, Spin, Select, Dropdown, Icon, Menu } from 'antd';
import { TableList } from '@client/components';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import _ from 'lodash';
import { translate } from '@client/i18n';
import moment from 'moment';

import { CourseModal } from './CourseModal';

interface State {
  selectedRowKeys: any;
  stages: any[];
  statuses: any[];
  visiblePopover: boolean;
  currentDay: string;
  currentLead: any;
}

interface Props {
  data: any;
  loading: boolean;
  handleSearch?: (data?: any) => void;
  updateCourse: (leadId: string, productOrderId: string, index: string, payload: any) => Promise<void>;
}

const STAGE_ARRANGED = 'Arranged';
const STAGE_TESTED = 'Tested';
const NO_ARRANGED_TIME = 'No arranged time';

export class Main extends React.Component<Props, State> {
  state: State = {
    selectedRowKeys: [],
    stages: [],
    statuses: [],
    visiblePopover: false,
    currentDay: moment().format('DD/MM/YYYY'),
    currentLead: null,
  };

  async componentDidMount() {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const classStages = await serviceProxy.findSystemConfigs('getAllClassStages', undefined, undefined, undefined, undefined, undefined, undefined) as any;
    const classStatuses = await serviceProxy.findSystemConfigs('getAllClassStatus', undefined, undefined, undefined, undefined, undefined, undefined) as any;
    this.setState({
      stages: classStages && classStages.data || [],
      statuses: classStatuses && classStatuses.data || [],
    });
  }

  changeSelectedRowKeys = (selectedRowKeys: any) => {
    this.setState({
      selectedRowKeys,
    });
  };

  parseArrangedTimeStr = (arrangedAt?: number) => {
    if (!arrangedAt) return NO_ARRANGED_TIME;
    return moment(arrangedAt).format('DD/MM/YYYY');
  };

  toggleModal = (lead: any) => {
    this.setState({
      currentLead: lead,
    });
  };

  splitCourses = (leads: any[]) => {
    const results = [] as any;
    leads.forEach((item: any) => {
      const courses = item.productOrder.courses;
      courses.forEach((course: any) => {
        const newItem = JSON.parse(JSON.stringify(item));
        newItem.productOrder.courses = [course];
        results.push(newItem);
      });
    });
    return results;
  };

  renderTable = () => {
    if (this.props.loading) {
      return (
        <div style={{
          width: '100%',
          minHeight: '100px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}><Spin /></div>
      );
    }
    const actionsDropdown = (record: any) => (
      <Menu>
        <Menu.Item>
          <a rel='noopener noreferrer' onClick={() => {
            this.toggleModal(record);
          }}>{translate('lang:edit')}</a>
        </Menu.Item>
      </Menu>
    );
    const columns = [{
      title: translate('lang:day'),
      key: 'Day',
      dataIndex: 'Day',
      render: (_text: any, record: any) => {
        const courses = record.productOrder.courses;
        if (courses && courses.length) {
          const course = courses[0];
          return `${course.arrangedAt ? `${moment(course.arrangedAt).format('DD/MM/YYYY, H:mm')}` : ''}`;
        }
        return null;
      },
    }, {
      title: translate('lang:name'),
      key: 'Name',
      dataIndex: 'Name',
      render: (_text: any, record: any) => {
        return record && record.contact ? ((record.contact.lastName ? record.contact.lastName : '') +
          (record.contact.lastName ? ' ' : '') + (record.contact.firstName ? record.contact.firstName : '')) : '';
      },
    }, {
      title: translate('lang:courses'),
      key: 'Courses',
      dataIndex: 'Courses',
      render: (_text: any, record: any) => {
        const courses = record.productOrder.courses;
        if (courses && courses.length) {
          const course = courses[0];
          return `${course.name}`;
        }
        return null;
      },
    }, {
      title: translate('lang:stage'),
      key: 'Stage',
      dataIndex: 'Stage',
      render: (_text: any, record: any) => {
        const courses = record.productOrder.courses;
        if (courses && courses.length) {
          const course = courses[0];
          return course.stage;
        }
        return null;
      },
    }, {
      title: translate('lang:status'),
      key: 'Status',
      dataIndex: 'Status',
      render: (_text: any, record: any) => {
        const courses = record.productOrder.courses;
        if (courses && courses.length) {
          const course = courses[0];
          return course.status;
        }
        return null;
      },
    }, {
      title: translate('lang:comment'),
      key: 'Comment',
      dataIndex: 'Comment',
      render: (_text: any, record: any) => {
        const courses = record.productOrder.courses;
        if (courses && courses.length) {
          const course = courses[0];
          return course.comment;
        }
        return null;
      },
    }, {
      title: translate('lang:actions'),
      key: 'actions',
      dataIndex: 'actions',
      render: (_text: any, record: any) => (
        <Dropdown overlay={actionsDropdown(record)} trigger={['click']}>
          <a className='ant-dropdown-link'>
            {translate('lang:actions')} <Icon type='down' />
          </a>
        </Dropdown>
      ),
    }];
    const dataSource = this.splitCourses(this.props.data).filter((item: any) => {
      const courses = item.productOrder.courses;
      let check = false;
      courses.forEach((course: any) => {
        if (this.parseArrangedTimeStr(course.arrangedAt) === this.state.currentDay) {
          check = true;
        }
      });
      return check;
    });
    return (
      <Col xs={24}>
        <TableList columns={columns} dataSource={dataSource} />
      </Col>
    );
  };

  renderSelectDay = () => {
    const { data } = this.props;
    const courses: any[] = [];
    data.forEach((lead: any) => {
      lead.productOrder.courses.forEach((course: any) => {
        if (course.stage === STAGE_ARRANGED || course.stage === STAGE_TESTED) courses.push(course);
      });
    });
    const groupBy = _.groupBy(courses, (item: any) => {
      return this.parseArrangedTimeStr(item.arrangedAt);
    }) as any;
    return (
      <Select style={{ width: 320, marginBottom: '15px', marginTop: '10px' }} defaultValue={this.state.currentDay} onChange={(val: string) => this.setState({ currentDay: val })}>
        {
          Object.keys(groupBy).map((day: string) => {
            return <Select.Option value={day} key={day}>{translate('lang:day')}: {day} - {translate('lang:numberOfTesting')}: {groupBy[day].length}</Select.Option>;
          })
        }
      </Select>
    );
  };

  render() {
    const { currentDay, currentLead } = this.state;
    return (
      <div >
        <div>{translate('lang:selectDay')}: </div>
        {
          this.renderSelectDay()
        }
        <Row type='flex' key={currentDay}>
          {
            this.renderTable()
          }
        </Row>
        {
          currentLead ? (
            <CourseModal
              onClose={() => this.toggleModal(null)}
              visible={true}
              productOrderId={currentLead.productOrder && currentLead.productOrder._id}
              updateCourse={async (payload: any) => {
                await this.props.updateCourse(currentLead._id, currentLead.productOrder._id, currentLead.productOrder.courses[0].index, payload);
              }}
              contact={currentLead.contact}
              owner={currentLead.owner}
              statuses={this.state.statuses}
              stages={this.state.stages}
              course={currentLead.productOrder.courses[0]}
              leadId={currentLead._id}
              centre={currentLead.centre}
            />
          ) : null
        }
      </div>
    );
  }
}
