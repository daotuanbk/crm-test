export const systemConfigMenuConfigs = {
  name: 'stageStatusManagement',
  icon: 'setting',
  items: [
    {
      name: 'stageManagement',
      path: '/stage',
      permission: 'SYSTEM_CONFIGS.VIEW',
      children: [],
    },
    {
      name: 'statusManagement',
      path: '/status',
      permission: 'SYSTEM_CONFIGS.VIEW',
      children: [],
    },
    {
      name: 'contactStageManagement',
      path: '/contact-stage',
      permission: 'SYSTEM_CONFIGS.VIEW',
      children: [],
    },
    {
      name: 'contactStatusManagement',
      path: '/contact-status',
      permission: 'SYSTEM_CONFIGS.VIEW',
      children: [],
    },
    {
      name: 'classStageManagement',
      path: '/class-stage',
      permission: 'SYSTEM_CONFIGS.VIEW',
      children: [],
    },
    {
      name: 'classStatusManagement',
      path: '/class-status',
      permission: 'SYSTEM_CONFIGS.VIEW',
      children: [],
    },
  ],
};
