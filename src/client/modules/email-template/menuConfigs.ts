export const emailTemplateMenuConfigs = {
  name: 'Email Template',
  icon: 'ordered-list',
  permission: 'EMAIL_TEMPLATES.VIEW_SCREEN',
  items: [
    {
      name: 'allEmailTemplatesManagement',
      path: '/email-template',
      permission: 'EMAIL_TEMPLATES.VIEW_SCREEN',
      children: [],
    },
    {
      name: 'allEmailTemplateConfigsManagement',
      path: '/email-template-config',
      permission: 'EMAIL_TEMPLATES.VIEW_SCREEN',
      children: [],
    },
  ],
};
