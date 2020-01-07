import { overrideConfig } from './override.config';

export const config = {
  appName: '',
  web: {
    cors: {
      whitelistUrls: [],
    },
    api: {
      prefix: '',
      docsUrl: '',
      docsJson: '',
    },
    log: {
      apiRequest: true,
    },
  },
  database: {
    connectionString: '',
  },
  logger: {
    streams: [],
  },
  storage: {
    type: '',
    folder: '',
  },
  firebase: {
    serviceAccount: {
      'type': 'service_account',
      'project_id': '',
      'private_key_id': '',
      'private_key': '',
      'client_email': '',
      'client_id': '',
      'auth_uri': '',
      'token_uri': '',
      'auth_provider_x509_cert_url': '',
      'client_x509_cert_url': '',
    },
    databaseURL: '',
  },
  regex: {
    email: /^$|^[a-z0-9_.]{0,40}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$/,
    phone: /^(\+84)([0-9]){9}$/,
  },
  upload: {
    allowImageExt: /\.(gif|jpg|jpeg|tiff|png|JPG|PNG|JPEG|GIF|TIFF)$/,
    allowExcelExt: /\.(csv|xls|xlsm|xlsx|xml|xlsb|xlam)$/,
  },
  phoneNumberPrefix: '+84',
  lms: {
    url: 'http://localhost:1337',
    token: 'ad3336f4-b7cf-4a9f-908a-7f7671f75453',
    systemApiUrl: 'http://localhost:1337',
  },
  emailAccount: {
    contact: {
      account: 'contact@mindx.edu.vn',
      password: 'mindxteam2019',
    },
    reg: {
      account: 'reg.mindxvn@gmail.com',
      password: 'mindx@123',
    },
  },
  kafka: {
    kafkaHost: 'localhost:9092',
    createTopicForEachAggregate: true,
    defaultPartitions: 1,
    defaultReplicationFactor: 1,
  },
  queue: {
    lmsCourseTopic: 'lms_course_course',
    lmsCourseCategoryTopic: 'lms_category_category',
    lmsClassTopic: 'lms_class_class',
    lmsErrorTopic: 'lms_crm_error',
    enrollmentRequestTopic: 'crm_crm_leads_enrollmentRequest',
    enrollmentResultTopic: 'lms_enrollmentRequest_enrollmentRequest',
  },
  ...overrideConfig,
};
