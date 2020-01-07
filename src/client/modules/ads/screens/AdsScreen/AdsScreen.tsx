import React from 'react';
import { Authorize } from '@client/components';
import { PERMISSIONS } from '@common/permissions';
import './AdsScreen.less';
import AdsAccount from './AdsAccount';
import { IAdsAccount, IListCampaign } from '@client/store/models/ads/interface';
import Campaign from './Campaign';

interface State {
  openCampaign: boolean;
  campaignsFromAdsAccount: IListCampaign;
}
interface Props {
  adsAccountList: IAdsAccount[];
  campaignList: IListCampaign[];
  getInsightEffects: (campaignId: string) => void;
  insightData: any;
}
export const AdsScreen = Authorize(class extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      openCampaign: false,
      campaignsFromAdsAccount: { data: [], accountId: '', paging: { next: '', previous: '' } },
    };
  }
  // componentDidMount = async () => {
  // }
  _openCampaignList = (accountId: string) => {
    this.setState({
      campaignsFromAdsAccount: this.props.campaignList.filter((campaign: IListCampaign) => campaign.accountId === accountId)[0],
      openCampaign: true,
    });
  }
  _closeCampaign = () => {
    this.setState({
      openCampaign: false,
    });
  }
  render() {
    return (
      <div className={'pages-container'}>
        {this.state.openCampaign ?
          <Campaign
            campaignList={this.state.campaignsFromAdsAccount}
            closeCampaign={this._closeCampaign}
            getInsightEffects={this.props.getInsightEffects}
          /> :
          <AdsAccount
            adsAccountList={this.props.adsAccountList}
            openCampaignList={this._openCampaignList}
          />}

      </div>
    );
  }
}, [PERMISSIONS.USERS.VIEW], true, 'admin');
