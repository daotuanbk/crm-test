import React, { useEffect, useState } from 'react';
import { SingleSelectWithSearch } from '@client/components';
import firebase from 'firebase';
import { LmsCourse } from '@client/services/service-proxies';
import { getServiceProxy } from '@client/services';
import _ from 'lodash';

interface Props {
  style: any;
  onChange: (value: any) => any;
}

interface Option {
  value: string;
  display: string;
}

export function LmsCourseFilter({ style, ...restProps }: Props) {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchOptions = async (search: string) => {
    setLoading(true);
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const response = await serviceProxy.findLmsCourses(
      search,
      undefined,
      undefined,
      undefined,
      undefined);
    setOptions(response.data.map((lmsClass: LmsCourse) => ({
      value: lmsClass._id,
      display: lmsClass.title,
    })));
    setLoading(false);
  };
  useEffect(() => { fetchOptions(''); }, []);
  return (
    <SingleSelectWithSearch
      {...restProps}
      loading={loading}
      label='Course'
      placeholder='C4T-B'
      options={options}
      style={style}
      onSearch={(searchString) => fetchOptions(searchString)}
    />
  );
}
