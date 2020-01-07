import React, { useState } from 'react';
import { Drawer, Typography, Tabs, Row, Col, Button } from 'antd';
import { getLeadCustomerName } from '@client/core';
import { LeadProgressBox } from '@client/components';
import { get } from 'lodash';
import { tabKeys, initialContact } from './helpers';
import { LeadCustomer } from './LeadCustomer';
import { LeadProducts } from '../LeadProducts';
import { LeadOrder } from '../LeadOrder';
import { LeadNotes } from '../LeadNotes';
import { LeadAppointments } from '../LeadAppointments';
import { LeadReminders } from '../LeadReminders';
import { LeadFamily } from './LeadFamily';
import { LeadEnrollments } from '../LeadEnrollments';
import { AuthUser } from '@client/store';
import { ActionType } from '../LeadDataTable/LeadBulkActionPanel';

interface Props {
  visible: boolean;
  leadInfo: any;
  authUser: AuthUser;
  onLeadDetailDrawerChange: (newLeadInfo: any) => void;
  closeLeadDetailDrawer: () => void;
  onAction: (action: ActionType) => void;
}

export const LeadDetailDrawer = (props: Props) => {
  // Initial id need to be blank to prevent immediate lead fetching, which cause drawwer to lag
  const [activeTab, setActiveTab] = useState<string>(tabKeys.CUSTOMER);

  const handleDrawerClose = () => {
    props.closeLeadDetailDrawer();
  };

  const changeInput = (payload: any, callback?: any) => {
    const newLeadInfo = {
      ...get(props, 'leadInfo', {}),
      tuition: {
        ...get(props, ['leadInfo', 'tuition'], {}),
        ...payload.tuition,
      },
      ...payload,
    };

    props.onLeadDetailDrawerChange(newLeadInfo);
    if (callback) {
      callback();
    }
  };

  const lead = props.leadInfo;
  return (
    <Drawer
      placement='right'
      closable={false}
      width={1200}
      onClose={handleDrawerClose}
      visible={props.visible}
    >
      <div className='lead-detail-drawer'>
        <Row style={{ marginBottom: '0.5rem' }}>
          <Col sm={12}>
            <Typography.Title level={3}>{getLeadCustomerName(lead)}</Typography.Title>
          </Col>
          <Col sm={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type='primary' onClick={() => props.onAction('Reassign')}>Re-assign To</Button>
          </Col>
        </Row>

        <LeadProgressBox
          _id={get(lead, '_id', '')}
          status={get(lead, 'v2Status')}
          onChange={changeInput}
        />
        <Tabs
          style={{ marginTop: '48px' }}
          activeKey={activeTab}
          onChange={(newActiveTab: string) => setActiveTab(newActiveTab)}
        >
          <Tabs.TabPane tab='Notes' key={tabKeys.NOTES}>
            <LeadNotes
              leadInfo={lead}
              changeInput={changeInput}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab='Customer' key={tabKeys.CUSTOMER}>
            <LeadCustomer
              leadId={get(lead, '_id')}
              // The first _id is object, the second is the actually _id
              customerId={get(lead, 'customer._id._id')}
              value={{
                ...get(lead, 'customer._id', initialContact),
                channel: get(lead, 'channel', ''),
                source: get(lead, 'source', ''),
                campaign: get(lead, 'campaign', ''),
                medium: get(lead, 'medium', ''),
                content: get(lead, 'content._id', ''),
              }}
              leadContent={get(lead, 'content')}
              authUser={props.authUser}
              onChange={changeInput}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab='Family' key={tabKeys.FAMILY}>
            <LeadFamily
              leadId={get(lead, '_id')}
              authUser={props.authUser}
              familyMembers={get(lead, 'customer.family', [])}
              onChange={changeInput}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab='Products' key={tabKeys.PRODUCTS}>
            <LeadProducts
              leadInfo={lead}
              changeInput={changeInput}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab='Order' key={tabKeys.ORDER}>
            <LeadOrder
              leadInfo={lead}
              authUser={props.authUser}
              changeInput={changeInput}
            />
          </Tabs.TabPane>
          {get(lead, 'order') ? (
            <Tabs.TabPane tab='Enrollments' key={tabKeys.ENROLLMENTS}>
              <LeadEnrollments
                leadInfo={lead}
                changeInput={changeInput}
              />
            </Tabs.TabPane>
          ) : null}
          <Tabs.TabPane tab='Reminders' key={tabKeys.REMINDERS}>
            <LeadReminders
              leadInfo={lead}
              changeInput={changeInput}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab='Appointments' key={tabKeys.APPOINTMENTS}>
            <LeadAppointments
              leadInfo={lead}
              changeInput={changeInput}
            />
          </Tabs.TabPane>
        </Tabs>
      </div>
    </Drawer>
  );
};
