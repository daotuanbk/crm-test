import React, { useEffect, useState } from 'react';
import { SingleSelect } from '@client/components';
import firebase from 'firebase';
import { Centre } from '@client/services/service-proxies';
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

const noCentreOption = {
  value: 'no-centre',
  display: 'No centre',
};

export function CentreFilter({ style, ...restProps }: Props) {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const loadCentres = async () => {
    setLoading(true);
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const response = await serviceProxy.getCentres(true);
    setOptions(response.data.map((centre: Centre) => ({
      value: centre._id,
      display: centre.shortName,
    })));
    setLoading(false);
  };
  useEffect(() => { loadCentres(); }, []);
  return (
    <SingleSelect
      loading={loading}
      {...restProps}
      label='Centre'
      placeholder='71 NCT'
      options={[
        noCentreOption,
        ...options,
      ]}
      style={style}
    />
  );
}
