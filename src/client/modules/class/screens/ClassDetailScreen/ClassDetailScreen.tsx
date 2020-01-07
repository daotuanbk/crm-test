import React from 'react';
import './ClassDetailScreen.less';
import { Authorize, BorderWrapper } from '@client/components';
import { message, Icon } from 'antd';
import { Main } from './Main';
import { PERMISSIONS } from '@common/permissions';
import axios from 'axios';
import { config } from '@client/config';
import Router from 'next/router';
import moment from 'moment';
import { translate } from '@client/i18n';

interface State {
  data: any;
  loading: {
    table: boolean;
  };
}

interface Props {
  _id: string;
}

export const ClassDetailScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    data: [],
    loading: {
      table: false,
    },
  };

  async componentDidMount() {
    this.handleSearch();
  }
  handleSearch = async () => {
    if (this.state.loading.table) return;
    this.setState({
      loading: {
        ...this.state.loading,
        table: true,
      },
    });

    try {
      if (this.props._id) {
        const fetch = await axios.get(`${config.lms.apiUrl}/classes?_id=${this.props._id}`);
        if (fetch && fetch.data && fetch.data[0]) {
          this.setState({
            loading: {
              ...this.state.loading,
              table: false,
            },
            data: fetch.data[0],
          });
        }
      }
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

  render() {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <a style={{ cursor: 'pointer' }}
            onClick={() => Router.push('/classes')}><Icon type='arrow-left' style={{ marginRight: '10px' }} />{translate('lang:classes')}</a>
        </div>
        <BorderWrapper>
          <div>
            <h2 style={{ color: '#1890ff' }}>{translate('lang:class')} {this.state.data.title || ''}</h2>
            <h4>{this.state.data.center && this.state.data.center.title ? `${translate('lang:centre')}: ${this.state.data.center.title}` : ''}</h4>
            <h4>{this.state.data.course && this.state.data.course.title ? `${translate('lang:course')}: ${this.state.data.course.title}` : ''}</h4>
            <h4>{this.state.data.startTime ? `${translate('lang:startAt')}: ${moment(this.state.data.startTime).format('DD/MM/YYYY')}` : ''}</h4>
            <h4>{this.state.data.createdAt ? `${translate('lang:createdAt')}: ${moment(this.state.data.createdAt).format('DD/MM/YYYY - HH:mm')}` : ''}</h4>
            {this.state.data.status ? <h4>{translate('lang:status')}: <span style={{ color: 'red' }}>{this.state.data.status.toUpperCase()}</span></h4> : ''}
          </div>
        </BorderWrapper>
        <div style={{ marginTop: 24 }}>
          <BorderWrapper>
            <Main
              data={this.state.data}
              loading={this.state.loading.table}
              handleSearch={this.handleSearch}
            ></Main>
          </BorderWrapper>
        </div>
      </div>
    );
  }
}, [PERMISSIONS.CLASS.VIEW], true, 'admin');
