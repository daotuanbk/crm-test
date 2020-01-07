import Routes from 'next-routes';

export const setupRoutes = ({ routes }: { routes: Routes }) => {
  routes
    .add('stage', '/stage', 'stage')
    .add('contact-stage', '/contact-stage', 'contact-stage')
    .add('class-stage', '/class-stage', 'class-stage');
};
