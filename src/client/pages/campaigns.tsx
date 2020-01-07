import React from 'react';
import { CampaignScreen } from '../modules/campaign';
import { NextContext } from 'next';
import { getServiceProxy } from '../services';

interface Props {
  sources: any;
}
interface State {}
class CentresPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    const serviceProxy = getServiceProxy();
    const sources = await serviceProxy.findProspectingSources() as any;
    return {
      namespacesRequired: ['common'],
      sources: sources.data,
    };
  }

  render () {
    return (
      <CampaignScreen sources={this.props.sources}/>
    );
  }
}

export default (CentresPage);
