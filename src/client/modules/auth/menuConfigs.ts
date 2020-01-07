export const authMenuConfigs = {
  name: 'authManagement',
  icon: 'unlock',
  items: [
    {
      name: 'usersManagement',
      path: '/users',
      permission: 'USERS.VIEW_SCREEN',
      children: [],
    },
    {
      name: 'rolesManagement',
      path: '/roles',
      permission: 'ROLES.VIEW_SCREEN',
      children: [],
    },
  ],
};
