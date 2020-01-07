import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Cascader, notification, AutoComplete } from 'antd';
import { FormikContext } from 'formik';
import { utm } from '@common/utm';
import _ from 'lodash';
import { Campaign } from '@client/services/service-proxies';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';

interface Props {
  context: FormikContext<any>;
  leadContent?: Campaign;
}

export const LeadSourceForm = (props: Props) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(props.leadContent ? [props.leadContent] : []);

  const {
    values,
    errors,
    setFieldValue,
  } = props.context;

  useEffect(() => {
    findCampaigns('');
  }, []);

  const findCampaigns = async (searchKeyword: string) => {
    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      const findCampaignsResult = await serviceProxy.findCampaigns(
        undefined,
        undefined,
        searchKeyword,
        undefined,
        10,
        'createdAt|desc',
        undefined,
        undefined,
      );

      if (_.get(props, 'leadContent._id')) {
        setCampaigns([..._.get(findCampaignsResult, 'data', []), props.leadContent!]);
      } else {
        setCampaigns(findCampaignsResult.data);
      }
    } catch (error) {
      notification.error({
        message: 'Load campaigns failed',
        description: error.message,
        placement: 'bottomRight',
      });
    }
  };

  const onCascadeChange = (selectedValues: string[]) => {
    setFieldValue('channel', selectedValues[0]);
    setFieldValue('source', selectedValues[1]);
    setFieldValue('campaign', selectedValues[2]);
    setFieldValue('medium', selectedValues[3]);
  };

  const cascadeOptions = utm.map((channel: any) => {
    return {
      value: channel.value,
      label: channel.value,
      children: _.get(channel, 'sources', []).map((source: any) => {
        return {
          value: source.value,
          label: source.value,
          children: _.get(source, 'campaigns', []).map((campaign: any) => {
            return {
              value: campaign.value,
              label: campaign.value,
              children: _.get(campaign, 'mediums', []).map((medium: any) => {
                return {
                  value: medium.value,
                  label: medium.value,
                };
              }),
            };
          }),
        };
      }),
    };
  });

  const dataSource = campaigns.map((campaign) => {
    return {
      value: campaign._id,
      text: campaign.name,
    };
  });
  return (
    <Row gutter={16}>
      <Col span={12}>
        <Form.Item
          label='Channel / Source / Campaign / Medium'
          validateStatus={(errors.medium || errors.source || errors.campaign || errors.medium) ? 'error' : undefined}
          help={errors.medium || errors.source || errors.campaign || errors.medium}
        >
          <Cascader
            style={{width: '100%'}}
            options={cascadeOptions}
            onChange={onCascadeChange}
            placeholder=''
            value={[values.channel, values.source, values.campaign, values.medium]}
          />
        </Form.Item>
      </Col>
      <Col span={12}>
        <Form.Item
          label='Content'
          validateStatus={errors.content ? 'error' : undefined}
          help={errors.content}
        >
          <AutoComplete
            dataSource={dataSource}
            style={{ width: '100%' }}
            onSelect={((value: string) => setFieldValue('content', value)) as any}
            onSearch={findCampaigns}
            defaultValue={values.content}
            placeholder=''
          />
        </Form.Item>
      </Col>
    </Row>
  );
};
