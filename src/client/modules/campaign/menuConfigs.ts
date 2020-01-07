export const campaignMenuConfigs = {
  name: 'campaignManagement',
  icon: 'flag',
  permission: 'CAMPAIGNS.VIEW_SCREEN',
  items: [
    {
      name: 'allCampaignsManagement',
      path: '/campaigns',
      permission: 'CAMPAIGNS.VIEW_SCREEN',
      children: [],
    },
  ],
};
