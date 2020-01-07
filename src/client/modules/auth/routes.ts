import Routes from 'next-routes';

export const setupRoutes = ({ routes }: { routes: Routes }) => {
  routes
    .add('register', '/auth/register', 'register')
    .add('login', '/auth/login', 'login')
    .add('users', '/users', 'users')
    .add('roles', '/roles', 'roles');
};
