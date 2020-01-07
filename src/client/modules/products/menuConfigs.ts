import { PERMISSIONS } from '@common/permissions';

export const productsMenuConfigs = {
  name: 'productsManagement',
  icon: 'shopping',
  permission: PERMISSIONS.PRODUCTS.VIEW_SCREEN,
  items: [
    {
      name: 'allProductsManagement',
      path: '/products',
      permission: PERMISSIONS.PRODUCTS.VIEW_SCREEN,
      children: [],
    },
  ],
};
