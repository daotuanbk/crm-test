import React, { useEffect, useState } from 'react';
import { SingleSelectWithSearch } from '@client/components';
import firebase from 'firebase';
import { LmsClass } from '@client/services/service-proxies';
import { getServiceProxy } from '@client/services';
import _ from 'lodash';

interface Props {
  style: any;
  filters: {
    lmsCourse: string;
  };
  onChange: (value: any) => any;
}

interface Option {
  value: string;
  display: string;
}

export function LmsClassFilter({ style, filters: { lmsCourse }, ...restProps }: Props) {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const loadLmsClasses = async (search: string) => {
    setLoading(true);
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const lmsCoursesToSearch = lmsCourse ? [lmsCourse] : undefined;
    const response = await serviceProxy.findLmsClasses(
      search,
      lmsCoursesToSearch,
      undefined,
      undefined,
      undefined);
    setOptions(response.data.map((lmsClass: LmsClass) => ({
      value: lmsClass._id,
      display: lmsClass.title,
    })));
    setLoading(false);
  };
  useEffect(() => { loadLmsClasses(''); }, [lmsCourse]);
  return (
    <SingleSelectWithSearch
      {...restProps}
      loading={loading}
      label='Class'
      placeholder='NCT-C4TB02'
      options={options}
      style={style}
      onSearch={(searchString) => loadLmsClasses(searchString)}
    />
  );
}
