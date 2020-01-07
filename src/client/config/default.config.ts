import { overrideConfig } from './override.config';

export const config = {
  appName: '',
  firebase: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
  },
  url: {
    main: '',
    api: '',
  },
  signInOptions: [
    'email',
    // 'phone',
    // 'facebook',
    // 'google',
  ],
  i18n: {
    VN: 'vn',
    EN: 'en',
    defaultLang: 'vn',
  },
  lms: {
    apiUrl: 'http://localhost:1337',
  },
  stringFormat: {
    date: 'DD/MM/YYY',
    dateTime: 'DD/MM/YYYY HH:mm',
    phoneNumberPrefix: '+84',
  },
  regex: {
    email: /^[a-z0-9_.]{0,40}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$/,
    phone: /^(\+84)([0-9]){9}$/,
  },
  upload: {
    allowExcelExt: /\.(csv|xls|xlsm|xlsx|xml|xlsb|xlam)$/,
  },
  googleFormUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSckoPpbLJ4fxFocsXaITHPDl63oveuU88JUnyda4gkL4UE-qg/formResponse',
  ...overrideConfig,
};
