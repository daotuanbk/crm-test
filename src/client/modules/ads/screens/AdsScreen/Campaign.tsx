import React from 'react';
import { Card, Button, Modal } from 'antd';
import { IListCampaign, ICampaign, IAdsInsight } from '../../../../store/models/ads/interface';

interface Props {
  campaignList: IListCampaign;
  closeCampaign: () => void;
  getInsightEffects: (campaignId: string) => void;
}

interface State {
  currentCampaign: ICampaign;
  modalVisibility: boolean;
  insightData: any;
}
const EMPTY_MESSAGE = 'No data';
export default class Campaign extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentCampaign: { id: '', created_time: '', status: '', name: '' },
      modalVisibility: false,
      insightData: {},
    };
  }

  _openCampaign = async (campaign: ICampaign) => {
    this.setState({
      modalVisibility: true,
      currentCampaign: campaign,
      insightData: await this.props.getInsightEffects(campaign.id),
    });
  }

  _renderCampaign = () => {
    return this.props.campaignList.data.map((campaign: ICampaign) => {
      return (
        <Card
          title={campaign.name}
          extra={<a onClick={() => this._openCampaign(campaign)} href='#'>More</a>}
          style={{ width: 600, display: 'inline-block' }}
          key={campaign.id}
        >
          <p>Status: {campaign.status}</p>
          <p>CreatedTime: {campaign.created_time}</p>
        </Card>
      );
    });
  }

  _loadPrevious = () => {
    // console.log(this.props.campaignList.paging.previous);
  }
  _loadNext = () => {
    // console.log(this.props.campaignList.paging.next);
  }

  _closeModal = () => {
    this.setState({
      modalVisibility: false,
    });
  }

  _renderAction = (action: any) => {
    if (action.action_type.split('.')[0] && action.action_type.split('.')[0] === 'offsite_conversion') {
      return 'Offsite Conversion';
    }
    switch (action.action_type) {
      case 'post':
        return 'Post:';
      case 'link_click':
        return 'Link Click:';
      case 'photo_view':
        return 'Photo View:';
      case 'post_reaction':
        return 'Post Reaction:';
      case 'post_engagement':
        return 'Post Engagement:';
      case 'page_engagement':
        return 'Page Engagement:';
      case 'video_view':
        return 'Video View: ';
      case 'comment':
        return 'Comment: ';
      default:
        return '';
    }
  }

  _renderInsight = (insightData: IAdsInsight) => {
    if (Object.entries(insightData).length === 0 && insightData.constructor === Object) {
      return <p></p>;
    }
    return (
      <div key={insightData.ad_id}>
        {/* <p>Adset Name: {insightData.adset_name}</p>
        <p>Ad Name: {insightData.ad_name}</p>
        <p>Ad Name: {insightData.ad_name}</p> */}
        <p>- The total number of actions people took that are attributed to your ads. Actions may include engagement, clicks or conversions: </p>
        <div style={{ marginLeft: 20 }}>
          {insightData.actions ? insightData.actions.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            },
          ) : EMPTY_MESSAGE
          }
        </div>
        <p>- The average cost for each 10-second video view:</p>
        <div style={{ marginLeft: 20 }}>
          {insightData.cost_per_10_sec_video_view ? insightData.cost_per_10_sec_video_view.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            }) : EMPTY_MESSAGE
          }
        </div>
        <p>- The number of clicks on your ads:  {insightData.clicks}</p>
        <p>- The average cost of a relevant action: </p>
        <div style={{ marginLeft: 20 }}>
          {insightData.cost_per_action_type ? insightData.cost_per_action_type.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            }) : EMPTY_MESSAGE
          }
        </div>
        <p>- The average cost for each estimated ad recall lift.
          This metric is only available for assets in the Brand awareness,
          Post engagement and Video views Objectives. This metric is estimated and in development:  {insightData.cost_per_estimated_ad_recallers}</p>
        <p>- The average cost of each inline post engagement: {insightData.cost_per_inline_post_engagement}</p>
        <p>- The average cost for each ThruPlay. This metric is in development:</p>
        <div style={{ marginLeft: 20 }}>
          {insightData.cost_per_thruplay ? insightData.cost_per_thruplay.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            }) : EMPTY_MESSAGE
          }
        </div>
        <p>- The average cost of each unique action. This metric is estimated:</p>
        <div style={{ marginLeft: 20 }}>
          {insightData.cost_per_unique_action_type ? insightData.cost_per_unique_action_type.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            }) : EMPTY_MESSAGE
          }
        </div>
        <p>- The average cost for each unique click (all). This metric is estimated: {insightData.cost_per_unique_click}</p>
        <p>- The method by which you pay for and target ads in your campaigns: through dynamic auction bidding, fixed-price bidding, or reach and frequency buying: {insightData.buying_type}</p>
        <p>- The percentage of people who saw your ad and performed a unique click (all). This metric is estimated: {insightData.unique_ctr}</p>
        <p>- The number of people who performed a click (all). This metric is estimated: {insightData.unique_clicks}</p>
        <p>- The number of times your video played for at least 10 seconds,
          or for nearly its total length if it's shorter than 10 seconds.
          For each impression of a video,
          we'll count video views separately and exclude any time spent replaying the video: </p>
        <div style={{ marginLeft: 20 }}>
          {insightData.video_10_sec_watched_actions ? insightData.video_10_sec_watched_actions.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            }) : EMPTY_MESSAGE
          }
        </div>
        <p>- The number of times your video played for at least 30 seconds,
          or for nearly its total length if it's shorter than 30 seconds.
          For each impression of a video,
          we'll count video views separately and exclude any time spent replaying the video:</p>
        <div style={{ marginLeft: 20 }}>
          {insightData.video_30_sec_watched_actions ? insightData.video_30_sec_watched_actions.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            }) : EMPTY_MESSAGE
          }
        </div>
        <p>- The number of people who took an action that was attributed to your ads. This metric is estimated:</p>
        <div style={{ marginLeft: 20 }}>
          {insightData.unique_actions ? insightData.unique_actions.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            }) : EMPTY_MESSAGE
          }
        </div>
        <p>- The estimated total amount of money you've spent on your campaign, ad set or ad during its schedule. This metric is estimated: {insightData.spend}</p>
        <p>- The total amount you've spent so far for your ads showed with social information. (ex: Jane Doe likes this): {insightData.social_spend}</p>
        <p>- The number of people who saw your ads at least once.
           Reach is different from impressions,
           which may include multiple views of your ads by the same people.
            This metric is estimated: {insightData.reach}</p>
        <p>- The objective you selected for your campaign. Your objective reflects the goal you want to achieve with your advertising: {insightData.objective}</p>
        <p>- The total number of actions that people take involving your ads. Inline post engagements use a fixed 1-day-click attribution window: {insightData.inline_post_engagement}</p>
        <p>- The number of times your ads were on screen: {insightData.impressions}</p>
        <p>- The average number of times each person saw your ad. This metric is estimated: {insightData.frequency}</p>
        <p>- The average percentage of your video that people played: </p>
        <div style={{ marginLeft: 20 }}>
          {insightData.video_avg_percent_watched_actions ? insightData.video_avg_percent_watched_actions.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            }) : EMPTY_MESSAGE
          }
        </div>
        <p>- The average time a video was played, including any time spent replaying the video for a single impression: </p>
        <div style={{ marginLeft: 20 }}>
          {insightData.video_avg_time_watched_actions ? insightData.video_avg_time_watched_actions.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            }) : EMPTY_MESSAGE
          }
        </div>
        <p>- The number of times your video was played at 100% of its length, including plays that skipped to this point:</p>
        <div style={{ marginLeft: 20 }}>
          {insightData.video_p100_watched_actions ? insightData.video_p100_watched_actions.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            }) : EMPTY_MESSAGE
          }
        </div>
        <p>- The number of times your video was played at 25% of its length, including plays that skipped to this point: </p>
        <div style={{ marginLeft: 20 }}>
          {insightData.video_p25_watched_actions ? insightData.video_p25_watched_actions.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            }) : EMPTY_MESSAGE
          }
        </div>
        <p>- The number of times your video was played at 50% of its length, including plays that skipped to this point:</p>
        <div style={{ marginLeft: 20 }}>
          {insightData.video_p50_watched_actions ? insightData.video_p50_watched_actions.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            }) : EMPTY_MESSAGE
          }
        </div>
        <p>- The number of times your video was played at 75% of its length, including plays that skipped to this point:</p>
        <div style={{ marginLeft: 20 }}>
          {insightData.video_p75_watched_actions ? insightData.video_p75_watched_actions.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            }) : EMPTY_MESSAGE
          }
        </div>
        <p>- The number of times your video was played at 95% of its length, including plays that skipped to this point:</p>
        <div style={{ marginLeft: 20 }}>
          {insightData.video_p95_watched_actions ? insightData.video_p95_watched_actions.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            }) : EMPTY_MESSAGE
          }
        </div>
        <p>- An estimate of the number of additional people who may remember seeing your ads,
          if asked, within 2 days.
          This metric is only available for assets in the Brand awareness,
          Post engagement and Video views Objectives. This metric is estimated and in development: {insightData.estimated_ad_recallers}</p>
        <p>- The number of times your video starts to play. This is counted for each impression of a video, and excludes replays. This metric is in development: </p>
        <div style={{ marginLeft: 20 }}>
          {insightData.video_play_actions ? insightData.video_play_actions.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            }) : EMPTY_MESSAGE
          }
        </div>
        <p>- The rate at which an estimated number of additional people,
          when asked, would remember seeing your ads within 2 days.
          This metric is only available for assets in the Brand awareness,
  Post engagement and Video views Objectives. This metric is estimated and in development: {insightData.estimated_ad_recall_rate}</p>
        <p>- The average cost to reach 1,000 people. This metric is estimated: {insightData.cpp}</p>
        <p>- The percentage of times people saw your ad and performed a click (all): {insightData.ctr}</p>
        <p>- The average cost for 1,000 impressions: {insightData.cpm}</p>
        <p>- The average cost for each click (all): {insightData.cpc}</p>
        <p>- The number of times your video was played to completion, or for at least 15 seconds. Learn more. This metric is in development: </p>
        <div style={{ marginLeft: 20 }}>
          {insightData.video_thruplay_watched_actions ? insightData.video_thruplay_watched_actions.map(
            (action: any) => {
              return <p key={action.action_type}>{this._renderAction(action)} {action.value}</p>;
            }) : EMPTY_MESSAGE
          }
        </div>
        <p>- Currency that is used by your ad account: {insightData.account_currency}</p>
      </div>
    );
  }

  render() {
    return (
      <div>
        <Button
          onClick={() => this.props.closeCampaign()}>
          Back
        </Button>
        <h1>Campaigns</h1>
        {this._renderCampaign()}
        {/* <Button
          onClick={() => this._loadPrevious()}
        >Previous</Button>
        <Button
          onClick={() => this._loadNext()}
        >Next</Button> */}

        <Modal
          title={this.state.currentCampaign.name}
          visible={this.state.modalVisibility}
          // onOk={this.handleOk}
          onCancel={() => this._closeModal()}
        >
          {this._renderInsight(this.state.insightData)}
        </Modal>
      </div>
    );
  }
}
