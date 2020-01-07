import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { MultiSelect } from '@client/components';
import firebase from 'firebase';
import _ from 'lodash';
import { getServiceProxy } from '@client/services';
import { LmsCategory } from '@client/services/service-proxies';

interface Props {
  style: any;
}

const fetchCategoryOptions = async (): Promise<[Option]> => {
  const idToken = await firebase.auth().currentUser!.getIdToken();
  const serviceProxy = getServiceProxy(idToken);
  const response = await serviceProxy.findLmsCategories();
  return response.data.map((category: LmsCategory) => ({
    value: category._id,
    display: category.title,
  })) as [Option];
};

interface Option {
  display: string;
  value: string;
}

export const CategoryFilter = (props: Props) => {
  const { style, ...restProps } = props;
  const [options, setOptions] = useState<[Option]>([] as any);
  const [loading, setLoading] = useState<boolean>(false);
  const fetchAndUpdateOptions = async () => {
    try {
      setLoading(true);
      const fetchedOptions = await fetchCategoryOptions();
      setOptions(fetchedOptions);
    } catch (err) {
      notification.error({
        message: err.message,
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAndUpdateOptions();
  }, []);
  return (
    <MultiSelect
      {...restProps}
      label='Categories'
      placeholder='Kids'
      options={options}
      loading={loading}
      dropdownMatchSelectWidth={false}
      style={style}
    />
  );
};
