import React, { useState } from 'react';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import _ from 'lodash';
import { AutoComplete, Input } from 'antd';

interface Props {
  search: string;
  selectFromAutocomplete: (value: any) => void;
  onSearchChange: (value: string) => void;
  onSearch: (value: any) => void;
}

export const ProductsSearchBar = (props: Props) => {
  const [autoCompleteSource, setAutoCompleteSource] = useState<{[key: string]: any}>({});

  const onAutoCompleteChange = (val: string) => {
    searchAutoCompleteSource(val);
  };

  const searchAutoCompleteSource = async (search: string) => {
    try {
      if (!search) {
        setAutoCompleteSource({});
      } else {
        const idToken = await firebase.auth().currentUser!.getIdToken();
        const serviceProxy = getServiceProxy(idToken);
        const products = await serviceProxy.findProducts(
          search,
          undefined,
          undefined,
          undefined,
          undefined,
          10,
          1,
          'createdAt|desc',
        );

        setAutoCompleteSource(_.mapKeys(products.data, '_id'));
      }
    } catch (error) {
      //
    }
  };

  const handleSearch = (searchString: any) => {
    props.onSearchChange(searchString);
  };

  const shouldBlurOnKeyDown = (e: any) => {
    if (e.keyCode === 13) { // If the key is 'ENTER'
      e.target.blur(); // Blur the input to close the dropdown
    }
  };

  const renderSuggestion = (products: any) => {
    return _.map(products, (val: any) => {
      return {
        value: val._id,
        text: `${val.code} - ${val.name}`,
      };
    });
  };

  return (
    <div style={{ width: '100%' }}>
      <AutoComplete
        style={{ width: '100%', borderRadius: '0px' }}
        placeholder={'Nguyen van linh'}
        dropdownClassName='custom-autocomplete'
        dataSource={renderSuggestion(autoCompleteSource || {})}
        defaultActiveFirstOption={false}
        onChange={onAutoCompleteChange as any}
        onSelect={(val: any) => {
          const product = autoCompleteSource[val];
          props.selectFromAutocomplete(product);
        }}
      >
        <Input.Search
          style={{ borderRadius: '0px' }}
          onKeyDown={shouldBlurOnKeyDown}
          onSearch={(val: any) => handleSearch(val)}>
        </Input.Search>
      </AutoComplete>
    </div>
  );
};
