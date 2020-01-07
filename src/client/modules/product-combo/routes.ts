import Routes from 'next-routes';

export const setupRoutes = ({ routes }: { routes: Routes }) => {
  routes
    .add('product-combo', '/product-combo', 'product-combo');
};
