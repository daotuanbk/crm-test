import React from 'react';
import { SingleSelectWithSearch } from '@client/components';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { notification } from 'antd';
import _ from 'lodash';

import { Filter } from '../createLeadFilter';

interface Salesman {
  _id: string;
  fullName: string;
}

interface Props {
  style: any;
  onChange: (value: any) => any;
  filters: Filter;
}

interface State {
  salesmans: Salesman[];
  loading: boolean;
}

const noOwnerOption = {
  value: 'no-owner',
  display: 'No owner',
};

const searchSalesman = async (salesmanName: string, centre: string | undefined) => {
  const idToken = await firebase.auth().currentUser!.getIdToken();
  const serviceProxy = getServiceProxy(idToken);
  try {
    const { roles= [] } = await serviceProxy.getAllSalesmanRole();

    const response = await serviceProxy.findUsers(
      salesmanName,
      roles.map((role) => role._id),
      centre || undefined,
      undefined,
      undefined,
      10,
      'fullName|desc',
      undefined,
      undefined,
    );
    return response.data;
  } catch (err) {
    notification.error({
      message: 'Error searching salesman',
      description: err.toString(),
      placement: 'bottomRight',
    });
    return [];
  }
};

export class OwnerFilter extends React.Component<Props, State> {
  state: State = {
    salesmans: [],
    loading: false,
  };

  searchSalesmanAndUpdateOptions = async (searchString: string) => {
    const { filters } = this.props;
    const { centre } = filters;

    this.setState({ loading: true });

    const centreToSearch = centre === 'no-centre' ? '' : centre;

    const salesmans = await searchSalesman(searchString, centreToSearch);
    this.setState({
      salesmans,
      loading: false,
    });
  }

  async componentDidMount() {
    await this.searchSalesmanAndUpdateOptions('');
  }

  async componentDidUpdate(prevProps: Props) {
    const { filters } = this.props;
    const { centre } = filters;
    if (prevProps.filters.centre !== centre) {
      await this.searchSalesmanAndUpdateOptions('');
    }
  }

  render() {
    const { style, onChange, ...restProps } = this.props;
    const { salesmans, loading } = this.state;
    const options = salesmans
      .map((salesman: Salesman) => ({
        display: salesman.fullName,
        value: salesman._id,
      }));

    const resetOptionsBeforeHandleOnChange = (value: any) => {
      onChange(value);
    };

    return (
      <SingleSelectWithSearch
        {...restProps}
        label='Owner'
        placeholder='Search here'
        options={[noOwnerOption, ...options]}
        loading={loading}
        onChange={resetOptionsBeforeHandleOnChange}
        onSearch={this.searchSalesmanAndUpdateOptions}
        style={style}
      />
    );
  }
}
