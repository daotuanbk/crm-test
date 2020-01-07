import React from 'react';
import { Icon } from 'antd';
import Router from 'next/router';
import { translate } from '@client/i18n';
import './styles.less';

interface State {}

interface Props {
  data: any;
}

export class Header extends React.Component<Props, State> {
  renderCourses = () => {
    const courses = this.props.data && this.props.data.productOrder && this.props.data.productOrder.courses ? this.props.data.productOrder.courses : [];
    if (courses && courses.length) {
      const result = courses.reduce((sum: any, val: any) => {
        return sum + ' / ' + val.shortName;
      }, '');
      return result;
    } else {
      return '';
    }
  };

  render() {
    const data = this.props.data;
    const combo = this.props.data && this.props.data.productOrder && this.props.data.productOrder.comboName ? this.props.data.productOrder.comboName : undefined;

    return (
      <div>
        <a style={{ cursor: 'pointer' }} onClick={() => Router.push('/leads')}>
          <Icon type='arrow-left' style={{ marginRight: '10px' }} />{translate('lang:backToLeads')}
        </a>
        <h2>
          {data && data.contact && data.contact._id && data.contact._id.contactBasicInfo && data.contact._id.contactBasicInfo.userType && data.contact._id.contactBasicInfo.userType === 'parent' ?
            'Parent ' : 'Student'}
          <span className='name-of-lead-detail'>
            {data.contact && data.contact._id && data.contact._id.contactBasicInfo ? ((data.contact._id.contactBasicInfo.lastName ?
              data.contact._id.contactBasicInfo.lastName : '') +
              (data.contact._id.contactBasicInfo.lastName ? ' ' : '') + (data.contact && data.contact._id && data.contact._id.contactBasicInfo.firstName ?
                data.contact._id.contactBasicInfo.firstName : '')) : ''}
          </span>
          <span className='name-of-course-in-lead-detail'>
            {this.renderCourses()} {(combo ? <span style={{ fontSize: '34px', color: 'red' }}>*</span> : '')}
          </span>
        </h2>
      </div>
    );
  }
}
