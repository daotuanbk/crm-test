import { ModelConfig, createModel } from '@rematch/core';
import axios from 'axios';
import { AdsState, IAdsAccount, IListCampaign } from './interface';
import { message } from 'antd';

const initialState: AdsState = {
  campaignList: [],
  adsAccountList: [],
  insightData: {},
};
// tslint:disable-next-line:max-line-length
const accessToken = 'EAAYpb1L0MEoBAMJ3hHZBgNrujtdVCAievnZCT7rx8iIwjuri7GpLAVpwZAwhJX9Ku3Y4K6fQuqW5y9QPAz9CVMeS3HhTK0Sb6pjveFB8YBSokuYVfMpbo38lNwbJjd9TPgEiMZAXWnri7fZClecrchBTWEqentIoZD';

const adsModel: ModelConfig<AdsState> = createModel({
  state: initialState,
  reducers: {
    getAdsAccountListSuccess: (
      state: AdsState,
      payload: any,
    ): AdsState => {
      return {
        ...state,
        adsAccountList: payload,
      };
    },
    getCampaignListSuccess: (
      state: AdsState,
      payload: any,
    ): AdsState => {
      return {
        ...state,
        campaignList: payload,
      };
    },
    getInsightSuccess: (
      state: AdsState,
      payload: any,
    ): AdsState => {
      return {
        ...state,
        insightData: payload,
      };
    },
  },
  effects: {
    async getAdsAccountListEffects(
      _payload: any,
      _rootState: any,
    ): Promise<void> {
      try {
        const result = await axios({
          url: `https://graph.facebook.com/v3.2/me`,
          method: 'get',
          params: {
            fields: 'adaccounts{amount_spent,balance,name,currency}',
            access_token: accessToken,
          },
        });
        // campaigns{created_time,id,name,status},
        // message.success('Fetch ads account successfully');
        if (!result) {
          return;
        }
        const adsAccountList: IAdsAccount[] = [];
        (result as any).data.adaccounts.data.forEach((account: any) => {
          adsAccountList.push(account);
        });
        this.getAdsAccountListSuccess(adsAccountList);

      } catch (error) {
        message.error(error.message);
      }
    },
    async getCampaignListEffects(
      _payload: any,
      _rootState: any,
    ): Promise<void> {
      try {
        const result = await axios({
          url: `https://graph.facebook.com/v3.2/me/adaccounts`,
          method: 'get',
          params: {
            fields: 'campaigns{name,created_time,account_id,status}',
            access_token: accessToken,
          },
        });
        // campaigns{created_time,id,name,status},
        // message.success('Fetch successfully');
        if (!result) {
          return;
        }
        const campaignList: IListCampaign[] = [];
        (result as any).data.data.forEach((data: any) => {
          campaignList.push({
            accountId: data.id,
            data: data.campaigns ? data.campaigns.data : [],
            paging: data.campaigns ? data.campaigns.paging : {},
          });
        });
        this.getCampaignListSuccess(campaignList);

      } catch (error) {
        message.error(error.message);
      }
    },
    async getInsightEffects(
      payload: any,
      _rootState: any,
    ): Promise<void> {
      try {
        const result = await axios({
          url: `https://graph.facebook.com/v3.2/${payload}/insights`,
          method: 'get',
          params: {
            // tslint:disable-next-line:max-line-length
            fields: 'ad_id,adset_name,adset_id,ad_name,actions,action_values,canvas_avg_view_time,canvas_avg_view_percent,cost_per_10_sec_video_view,clicks,campaign_name,cost_per_action_type,campaign_id,cost_per_estimated_ad_recallers,cost_per_inline_link_click,cost_per_inline_post_engagement,cost_per_thruplay,cost_per_unique_action_type,cost_per_unique_click,cost_per_unique_inline_link_click,cost_per_outbound_click,buying_type,account_name,account_id,unique_ctr,unique_clicks,unique_inline_link_clicks,unique_inline_link_click_ctr,unique_link_clicks_ctr,unique_outbound_clicks,video_10_sec_watched_actions,video_30_sec_watched_actions,unique_outbound_clicks_ctr,unique_actions,spend,social_spend,relevance_score,reach,place_page_name,outbound_clicks_ctr,outbound_clicks,objective,mobile_app_purchase_roas,inline_post_engagement,inline_link_clicks,inline_link_click_ctr,impressions,frequency,video_avg_percent_watched_actions,video_avg_time_watched_actions,video_p100_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions,estimated_ad_recallers,video_play_actions,date_stop,estimated_ad_recall_rate,date_start,cpp,ctr,cpm,video_thruplay_watched_actions,cpc,website_ctr,website_purchase_roas,cost_per_unique_outbound_click,account_currency',
            access_token: accessToken,
          },
        });
        // campaigns{created_time,id,name,status},
        // message.success('Fetch successfully');
        if (!result) {
          return;
        }
        // const campaignList: IListCampaign[] = [];
        // (result as any).data.data.forEach((data: any) => {
        //   campaignList.push({
        //     accountId: data.id,
        //     data: data.campaigns ? data.campaigns.data : [],
        //     paging: data.campaigns ? data.campaigns.paging : {},
        //   });
        // });
        // console.log(result);
        return (result as any).data.data[0];

      } catch (error) {
        message.error(error.message);
      }
    },
  },
});

export default adsModel;
