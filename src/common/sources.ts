const PROSPECTING_LIST_SOURCE_FBCHAT = 1;
const PROSPECTING_LIST_SOURCE_EMAIL = 2;
const PROSPECTING_LIST_SOURCE_WEB = 3;
const PROSPECTING_LIST_SOURCE_OTHER = 4;
const PROSPECTING_LIST_SOURCE_SELF_CREATED = 5;
const PROSPECTING_LIST_SOURCE_OLD_CUSTOMER = 6;
const PROSPECTING_LIST_SOURCE_FACEBOOK_CAMPAIGN = 7;
const PROSPECTING_LIST_SOURCE_TELESALE = 8;

export const SOURCES = [
  {
    label: 'FbChat',
    value: PROSPECTING_LIST_SOURCE_FBCHAT,
    disabled: true,
  },
  {
      label: 'Campaign',
      value: PROSPECTING_LIST_SOURCE_FACEBOOK_CAMPAIGN,
      disabled: false,
  },
  {
      label: 'Web',
      value: PROSPECTING_LIST_SOURCE_WEB,
      disabled: true,
  },
  {
      label: 'Other',
      value: PROSPECTING_LIST_SOURCE_OTHER,
      disabled: false,
  },
  {
      label: 'Email',
      value: PROSPECTING_LIST_SOURCE_EMAIL,
      disabled: true,
  },
  {
      label: 'Old customer',
      value: PROSPECTING_LIST_SOURCE_OLD_CUSTOMER,
      disabled: true,
  },
  {
      label: 'Self created',
      value: PROSPECTING_LIST_SOURCE_SELF_CREATED,
      disabled: true,
  },
  {
      label: 'Telesale',
      value: PROSPECTING_LIST_SOURCE_TELESALE,
      disabled: false,
  },
];
