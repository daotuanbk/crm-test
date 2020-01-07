import React from 'react';
import { IAdsAccount } from '@client/store/models/ads/interface';
import { Card } from 'antd';

export interface AdsAccountProps {
  adsAccountList: IAdsAccount[];
  openCampaignList: (accountId: string) => void;
}

export interface AdsAccountState {

}

export default class AdsAccount extends React.Component<AdsAccountProps, AdsAccountState> {
  constructor(props: any) {
    super(props);
  }

  _renderAdsAccount = () => {
    return this.props.adsAccountList.map((account: IAdsAccount) => {
      return (
        <Card
          title={account.name}
          extra={<a onClick={() => this.props.openCampaignList(account.id)} href='#'>More</a>}
          style={{ width: 300, display: 'inline-block' }}
          key={account.id}
        >
          <p>Balance: {account.balance}</p>
          <p>Amount Spent: {account.amount_spent}</p>
          <p>Currency: {account.currency}</p>
        </Card>
      );
    });
  }

  render() {
    return (
      <div>
        <h1>Ads Account</h1>
        {this._renderAdsAccount()}
      </div>
    );
  }
}
