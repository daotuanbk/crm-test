import React from 'react';
import { SalesmanScreen } from '../modules/salesman';
import { NextContext } from 'next';

import { getServiceProxy } from '../services';

interface Props {
  centres: any[];
  salesmen: any[];
  users: any[];
}
interface State {}
class SalesmanPage extends React.Component<Props, State> {
    static async getInitialProps (_context: NextContext) {
        const serviceProxy = getServiceProxy();
        const centres = await serviceProxy.getAllCentres() as any;
        const salesmen = await serviceProxy.getAllSalesman() as any;
        const users = await serviceProxy.getAllUsers() as any;
        return {
            centres: centres.data,
            salesmen: salesmen.data,
            users: users.data,
            namespacesRequired: ['common'],
        };
    }

    render () {
        return (
            <SalesmanScreen centres={this.props.centres} salesmen={this.props.salesmen} users={this.props.users}/>
        );
    }
}

export default (SalesmanPage);
