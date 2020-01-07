import Routes from 'next-routes';

export const setupRoutes = ({ routes }: { routes: Routes }) => {
  routes
    .add('leads-for-receptionist', '/leads-for-receptionist', 'leads-for-receptionist')
    .add('receptionist', '/receptionist', 'receptionist')
    .add('lead-payment-transaction', '/lead-payment-transaction/:id', 'lead-payment-transaction');
};
