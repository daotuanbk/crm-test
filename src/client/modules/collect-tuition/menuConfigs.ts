export const receptionistMenuConfigs = {
  name: 'tuitionReceptionist',
  icon: 'dollar',
  permission: 'ROLES.RECEPTIONIST',
  items: [
    {
      name: 'paymentTransactionManagement',
      path: '/leads-for-receptionist',
      permission: 'LEADS.VIEW',
      children: [],
    },
  ],
};
