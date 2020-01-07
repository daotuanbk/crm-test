import React from 'react';
import { withRematch, initStore } from '../store';
import { AdsScreen } from '../modules/ads/screens/AdsScreen/AdsScreen';
import { IAdsAccount, IListCampaign } from '../store/models/ads/interface';
interface AdsProps {
  getAdsAccountListEffects: () => void;
  adsAccountList: IAdsAccount[];
  getCampaignListEffects: () => void;
  campaignList: IListCampaign[];
  getInsightEffects: (campaignId: string) => void;
  insightData: any;
}
interface AdsState { }
class AdsPage extends React.Component<AdsProps, AdsState> {
  constructor(props: any) {
    super(props);
  }
  componentDidMount = async () => {
    await this.props.getAdsAccountListEffects();
    await this.props.getCampaignListEffects();
  }

  render() {
    return (
      <AdsScreen
        adsAccountList={this.props.adsAccountList}
        campaignList={this.props.campaignList}
        getInsightEffects={this.props.getInsightEffects}
        insightData={this.props.insightData}
      />
    );
  }
}

const mapState = (rootState: any) => {
  return {
    ...rootState.adsModel,
  };
};

const mapDispatch = (rootReducer: any) => {
  return {
    ...rootReducer.adsModel,
  };
};
export default withRematch(initStore, mapState, mapDispatch)(AdsPage);
