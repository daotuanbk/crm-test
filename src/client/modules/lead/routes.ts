import Routes from 'next-routes';

export const setupRoutes = ({ routes }: { routes: Routes }) => {
  routes
    .add('leads', '/leads/:id', 'leads')
    .add('unassigned', '/unassigned', 'unassigned')
    .add('notifications', '/notifications', 'notifications')
    .add('add-lead', '/add-lead', 'add-lead');
};
