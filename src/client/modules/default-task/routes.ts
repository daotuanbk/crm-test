import Routes from 'next-routes';

export const setupRoutes = ({ routes }: { routes: Routes }) => {
  routes
    .add('default-tasks', '/default-tasks', 'default-tasks');
};
