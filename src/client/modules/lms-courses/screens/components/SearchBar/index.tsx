import React, { useState } from 'react';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import _ from 'lodash';
import { AutoComplete, Input } from 'antd';

interface Props {
  search: string;
  selectFromAutocomplete: (value: any) => void;
  onSearch: (value: any) => void;
}

export const LmsCourseSearchBar = (props: Props) => {
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
        const courseResponse = await serviceProxy.findLmsCourses(
          search,
          undefined,
          10,
          1,
          'createdAt|desc',
        );

        setAutoCompleteSource(_.mapKeys(courseResponse.data, '_id'));
      }
    } catch (error) {
      //
    }
  };

  const handleSearch = (searchString: any) => {
    props.onSearch(searchString);
  };

  const shouldBlurOnKeyDown = (e: any) => {
    if (e.keyCode === 13) { // If the key is 'ENTER'
      e.target.blur(); // Blur the input to close the dropdown
    }
  };

  const renderSuggestion = (lmsCourses: any) => {
    return _.map(lmsCourses, (val: any) => {
      return {
        value: val._id,
        text: val.title,
      };
    });
  };

  return (
    <div style={{ width: '100%' }}>
      <AutoComplete
        style={{ width: '100%', borderRadius: '0px' }}
        placeholder={'C4T'}
        dropdownClassName='custom-autocomplete'
        dataSource={renderSuggestion(autoCompleteSource || {})}
        defaultActiveFirstOption={false}
        onChange={onAutoCompleteChange as any}
        onSelect={(val: any) => {
          const lmsCourse = autoCompleteSource[val];
          props.selectFromAutocomplete(lmsCourse);
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
