export interface IAdsInsight {
  ad_id: string;
  adset_name: string;
  adset_id: string;
  ad_name: string;
  actions: [
    {
      action_type: string;
      value: string;
    }
  ];
  clicks: string;
  campaign_name: string;
  cost_per_action_type: [
    {
      action_type: string;
      value: string;
    }
  ];
  campaign_id: string;
  cost_per_inline_link_click: string;
  cost_per_inline_post_engagement: string;
  cost_per_unique_action_type: [
    {
      action_type: string;
      value: string;
    }
  ];
  estimated_ad_recallers: string;
  cost_per_unique_click: string;
  cost_per_unique_inline_link_click: string;
  cost_per_estimated_ad_recallers: string;
  video_thruplay_watched_actions: [
    {
      action_type: string;
      value: string;
    }
  ];
  cost_per_10_sec_video_view: [
    {
      action_type: string;
      value: string;
    }
  ];
  video_play_actions: [
    {
      action_type: string;
      value: string;
    }
  ];
  video_10_sec_watched_actions: [
    {
      action_type: string;
      value: string;
    }
  ];
  video_30_sec_watched_actions: [
    {
      action_type: string;
      value: string;
    }
  ];
  video_avg_percent_watched_actions: [
    {
      action_type: string;
      value: string;
    }
  ];
  video_avg_time_watched_actions: [
    {
      action_type: string;
      value: string;
    }
  ];
  video_p100_watched_actions: [
    {
      action_type: string;
      value: string;
    }
  ];
  video_p25_watched_actions: [
    {
      action_type: string;
      value: string;
    }
  ];
  video_p50_watched_actions: [
    {
      action_type: string;
      value: string;
    }
  ];
  video_p75_watched_actions: [
    {
      action_type: string;
      value: string;
    }
  ];
  video_p95_watched_actions: [
    {
      action_type: string;
      value: string;
    }
  ];
  cost_per_outbound_click: [
    {
      action_type: string;
      value: string;
    }
  ];
  buying_type: string;
  account_name: string;
  account_id: string;
  unique_ctr: string;
  unique_clicks: string;
  unique_inline_link_clicks: string;
  unique_inline_link_click_ctr: string;
  unique_link_clicks_ctr: string;
  cost_per_thruplay: [
    {
      action_type: string;
      value: string;
    }
  ];
  unique_outbound_clicks: [
    {
      action_type: string;
      value: string;
    }
  ];
  unique_outbound_clicks_ctr: [
    {
      action_type: string;
      value: string;
    }
  ];
  unique_actions: [
    {
      action_type: string;
      value: string;
    }
  ];
  spend: string;
  social_spend: string;
  estimated_ad_recall_rate: string;
  relevance_score: {
    score: string;
    status: string;
  };
  reach: string;
  outbound_clicks_ctr: [
    {
      action_type: string;
      value: string;
    }
  ];
  outbound_clicks: [
    {
      action_type: string;
      value: string;
    }
  ];
  objective: string;
  inline_post_engagement: string;
  inline_link_clicks: string;
  inline_link_click_ctr: string;
  impressions: string;
  frequency: string;
  date_stop: string;
  date_start: string;
  cpp: string;
  ctr: string;
  cpm: string;
  cpc: string;
  website_ctr: [
    {
      action_type: string;
      value: string;
    }
  ];
  cost_per_unique_outbound_click: [
    {
      action_type: string;
      value: string;
    }
  ];
  account_currency: string;
}

export interface ICampaign {
  created_time: string;
  id: string;
  name: string;
  status: string;
}

export interface IAdsAccount {
  name: string;
  id: string;
  amount_spent: string;
  balance: string;
  currency: string;
}

export interface IPagination {
  paging: {
    next: string;
    previous: string;
  };
}

export interface IListCampaign extends IPagination {
  data: ICampaign[];
  accountId: string;
}

export interface AdsState {
  campaignList: IListCampaign[];
  adsAccountList: IAdsAccount[];
  insightData: {};
}
