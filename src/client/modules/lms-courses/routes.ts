import Routes from 'next-routes';

export const setupRoutes = ({ routes }: { routes: Routes }) => {
  routes
    .add('lms-courses', '/lms-courses', 'lms-courses');
};
