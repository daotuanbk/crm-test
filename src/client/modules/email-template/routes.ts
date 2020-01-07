import Routes from 'next-routes';

export const setupRoutes = ({ routes }: { routes: Routes }) => {
  routes
    .add('email-template', '/email-template', 'email-template')
    .add('email-template-config', '/email-template-config', 'email-template-config');
};
