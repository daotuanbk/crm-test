import { get, unset } from 'lodash';
import { config } from '@client/config';

export const initPhoneNumber = (formikValues: any) => {
  return {
    ...formikValues,
    phoneNumber: formikValues.phoneNumber ? formikValues.phoneNumber : config.stringFormat.phoneNumberPrefix,
  };
};

export const serializePhoneNumber = (formikValues: any) => {
  const values = {
    ...formikValues,
  };

  if (get(formikValues, 'phoneNumber', config.stringFormat.phoneNumberPrefix) === config.stringFormat.phoneNumberPrefix) {
    unset(values, 'phoneNumber');
  }

  return values;
};
