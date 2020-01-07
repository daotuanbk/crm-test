import Routes from 'next-routes';

export const setupRoutes = ({ routes }: { routes: Routes }) => {
  routes
    .add('interviewers', '/interviewers', 'interviewers');
};