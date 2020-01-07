import React from 'react';
import { AutoComplete, Input } from 'antd';

import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import _ from 'lodash';

interface Props {
  selectFromAutocomplete: (value: any) => void;
  onSearch: (value: any) => void;
  search: string;
}

interface State {
  search: string;
  autoCompleteSource: {};
}

export class LeadSearchBar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.onAutoCompleteChange = _.debounce(this.onAutoCompleteChange, 500).bind(this);
    this.state = {
      search: props.search,
      autoCompleteSource: {},
    };
  }

  onAutoCompleteChange = (val: any) => {
    this.searchAutoCompleteSource(val);
  }

  renderSuggestion = (leads: any) => {
    return _.map(leads, (val: any) => {
      const fullName = val.contact ? val.contact.fullName || ((val.contact.lastName ? val.contact.lastName : '') +
        (val.contact.lastName ? ' ' : '') + (val.contact.firstName ? val.contact.firstName : '')) : '';
      const course = val.productOrder && val.productOrder.courses && val.productOrder.courses.length ? val.productOrder.courses[val.productOrder.courses.length - 1].name : '';
      const combo = val.productOrder && val.productOrder.comboName ? val.productOrder.comboName : '';
      const phone = val.contact && val.contact.phone ? val.contact.phone : '';
      const email = val.contact && val.contact.email ? val.contact.email : '';
      const text = (fullName ? `${fullName}` : '') + (combo ? ` - ${combo}` : '') + (course ? ` - ${course}` : '') + (phone ? ` - ${phone}` : '') + (email ? ` - ${email}` : '');
      return {
        value: val._id,
        text,
      };
    });
  }

  searchAutoCompleteSource = async (search: string) => {
    try {
      if (!search) {
        this.setState({
          autoCompleteSource: {},
        });
      } else {
        const idToken = await firebase.auth().currentUser!.getIdToken();
        const serviceProxy = getServiceProxy(idToken);
        const leads: any = await serviceProxy.findLeads(
          undefined,
          search,
          undefined,
          10,
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
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
        );
        this.setState({
          autoCompleteSource: _.mapKeys(leads.data, '_id'),
        });
      }
    } catch (error) {
      //
    }
  }

  handleSearch = (searchString: any) => {
    this.setState({
      search: searchString,
    }, () => this.props.onSearch(searchString));
  }

  shouldBlurOnKeyDown = (e: any) => {
    if (e.keyCode === 13) { // If the key is 'ENTER'
      e.target.blur(); // Blur the input to close the dropdown
    }
  }

  render() {
    return (
      <div style={{ width: '100%' }}>
        <AutoComplete style={{ width: '100%', borderRadius: '0px' }} placeholder={'Nguyen van linh'} dropdownClassName='custom-autocomplete'
          dataSource={this.renderSuggestion(this.state.autoCompleteSource || {})}
          defaultActiveFirstOption={false}
          onChange={this.onAutoCompleteChange}
          onSelect={(val: any) => {
            const lead = this.state.autoCompleteSource[val];
            this.props.selectFromAutocomplete(lead);
          }}
        >
          <Input.Search
            style={{ borderRadius: '0px' }}
            onKeyDown={this.shouldBlurOnKeyDown}
            onSearch={(val: any) => this.handleSearch(val)}>
          </Input.Search>
        </AutoComplete>
      </div>
    );
  }
}
