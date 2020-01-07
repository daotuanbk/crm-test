import Routes from 'next-routes';

export const setupRoutes = ({ routes }: { routes: Routes }) => {
  routes
    .add('classes', '/classes', 'classes')
    .add('class-detail', '/class-detail/:id', 'class-detail');
};
