export const defaultTaskMenuConfigs = {
  name: 'defaultTaskManagement',
  icon: 'ordered-list',
  permission: 'DEFAULT_TASKS.VIEW_SCREEN',
  items: [
    {
      name: 'allDefaultTasksManagement',
      path: '/default-tasks',
      permission: 'DEFAULT_TASKS.VIEW_SCREEN',
      children: [],
    },
  ],
};
