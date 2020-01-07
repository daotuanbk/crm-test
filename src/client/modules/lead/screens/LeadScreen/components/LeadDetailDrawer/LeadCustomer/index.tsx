import React, { useState } from 'react';
import { Customer, Lead, ContactGender, CreateLeadPayload, UpdateLeadDetailPayloadOperation, Campaign } from '@client/services/service-proxies';
import _ from 'lodash';
import { LeadSourceForm } from '../LeadSourceForm';
import { LeadExistingContactForm } from '../LeadExistingContactForm';
import { LeadNewContactForm } from '../LeadNewContactForm';
import { Formik, FormikContext } from 'formik';
import { initPhoneNumber, serializePhoneNumber, getErrorMessage } from '@client/core';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { Form, Row, Col, Button, notification } from 'antd';
import * as yup from 'yup';
import { config } from '@client/config';
import { AuthUser } from '@client/store';

interface Props {
  leadId: string;
  customerId: string;
  value: Customer;
  authUser: AuthUser;
  leadContent?: Campaign;
  onChange: (values: (Customer|Lead)) => void;
}

export const LeadCustomer = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [existedContact, setExistedContact] = useState<Customer|undefined>(undefined);
  const [selectedContact, setSelectedContact] = useState<Customer|undefined>(undefined);
  const [existedActiveLead, setExistedActiveLead] = useState<Lead|undefined>(undefined);
  const [phoneEditDisabled, setPhoneEditDisabled] = useState<boolean>(!!_.get(props, 'value.phoneNumber'));

  const selectExistedContact = () => {
    setSelectedContact(existedContact);
  };

  const updateLeadCustomer = async (values: any) => {
    try {
      setLoading(true);

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      const customerInfo = {
        fullName: _.get(values, 'fullName'),
        gender: _.get(values, 'gender'),
        email: _.get(values, 'email'),
        phoneNumber: _.get(values, 'phoneNumber'),
        address: _.get(values, 'address'),
        dob: _.get(values, 'dob'),
        facebook: _.get(values, 'facebook'),
        zalo: _.get(values, 'zalo'),
        school: _.get(values, 'school'),
      };
      const leadInfo = {
        status: _.get(values, 'status'),
        channel: _.get(values, 'channel'),
        source: _.get(values, 'source'),
        campaign: _.get(values, 'campaign'),
        medium: _.get(values, 'medium'),
        content: _.get(values, 'content'),
      };

      await serviceProxy.updateLead(_.get(props, 'leadId'), {
        operation: UpdateLeadDetailPayloadOperation.UpdateDetail,
        payload: leadInfo,
      });
      const newLeadInfo = await serviceProxy.updateLeadCustomer(_.get(props, 'leadId'), customerInfo);

      props.onChange(newLeadInfo);

      if (!phoneEditDisabled) setPhoneEditDisabled(true);

      notification.success({
        message: 'Update lead success',
        placement: 'bottomRight',
      });
    } catch (error) {
      notification.error({
        message: 'Update lead failed',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const addNewLead = async (values: any) => {
    try {
      setLoading(true);

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      const createLeadPayload: CreateLeadPayload = {
        overwrite: true,
        contactId: _.get(selectedContact, '_id', '') as any,
        contactInfo: serializePhoneNumber({
          phoneNumber: _.get(values, 'phoneNumber'),
          fullName: _.get(values, 'fullName'),
          gender: _.get(values, 'gender'),
          email: _.get(values, 'email'),
          dob: _.get(values, 'dob'),
          address: _.get(values, 'address'),
          facebook: _.get(values, 'facebook'),
          zalo: _.get(values, 'zalo'),
          school: _.get(values, 'school'),
        }),
        leadInfo: {
          status: _.get(values, 'status'),
          channel: _.get(values, 'channel'),
          source: _.get(values, 'source'),
          campaign: _.get(values, 'campaign'),
          medium: _.get(values, 'medium'),
          content: _.get(values, 'content'),
        },
      };
      const newLeadInfo = await serviceProxy.createLead(createLeadPayload);

      props.onChange(newLeadInfo as any);
      notification.success({
        message: 'Create lead success',
        placement: 'bottomRight',
      });
    } catch (error) {
      notification.error({
        message: 'Create lead failed',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPhoneNumberExistence = async (value: string) => {
    // call api to check phoneNumber exist + check if this phone number has an active lead
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const [existedContactWithPhoneNumber, existedActiveLeadOfPhoneNumber] = await Promise.all([
      serviceProxy.checkContactExistsByPhoneNumber(value),
      serviceProxy.findActiveLeadByPhoneNumber(value),
    ]);

    setExistedContact(existedContactWithPhoneNumber as any);
    setExistedActiveLead(existedActiveLeadOfPhoneNumber);
    // If the contact found and different from current contact, it is an error
    return !existedContactWithPhoneNumber || (existedContactWithPhoneNumber._id === props.customerId);
  };

  const createLeadValidationShape = {
    fullName: yup.string().required('Please input full name'),
    phoneNumber: yup.string().required('Please input phone number')
      .test('Valid phone number format', 'Invalid phone number', (value: string) => {
        return config.regex.phone.test(value);
      }),
    gender: yup.string().nullable(true)
      .oneOf([ContactGender.FEMALE, ContactGender.MALE, ContactGender.OTHER], 'Invalid gender'),
    email: yup.string().nullable(true)
      .matches(config.regex.email, 'Invalid email address'),
    address: yup.string().nullable(true),
    dob: yup.string().nullable(true),
    facebook: yup.string().nullable(true),
    zalo: yup.string().nullable(true),
    school: yup.string().nullable(true),
    channel: yup.string().required('Please select Channel/Source/Campaign/Medium'),
    source: yup.string().required('Please select Channel/Source/Campaign/Medium'),
    campaign: yup.string().required('Please select Channel/Source/Campaign/Medium'),
    medium: yup.string().nullable(true),
    content: yup.string().nullable(true),
  };

  const editCustomerShape = {
    fullName: yup.string().nullable(true),
    phoneNumber: yup.string().required('Please input phone number')
      .test('Valid phone number format', 'Invalid phone number', (value: string) => {
        if (!value || value === config.stringFormat.phoneNumberPrefix) {
          return true;
        }
        if (config.regex.phone.test(value)) {
          return true;
        }
        if (phoneEditDisabled) {
          setPhoneEditDisabled(false);
        }
        return false;
      }),
    gender: yup.string().nullable(true)
      .oneOf([ContactGender.FEMALE, ContactGender.MALE, ContactGender.OTHER], 'Invalid gender'),
    email: yup.string().nullable(true)
      .matches(config.regex.email, 'Invalid email address'),
    address: yup.string().nullable(true),
    dob: yup.string().nullable(true),
    facebook: yup.string().nullable(true),
    zalo: yup.string().nullable(true),
    school: yup.string().nullable(true),
    channel: yup.string().required('Please select Channel/Source/Campaign/Medium'),
    source: yup.string().required('Please select Channel/Source/Campaign/Medium'),
    campaign: yup.string().required('Please select Channel/Source/Campaign/Medium'),
    medium: yup.string().nullable(true),
    content: yup.string().nullable(true),
  };

  if (!selectedContact) {
    // If contact is NOT selected from database but entered by users instead, check duplicate
    editCustomerShape.phoneNumber = editCustomerShape.phoneNumber.test('Phone number available', 'This phone number already exist', checkPhoneNumberExistence);
    createLeadValidationShape.phoneNumber = createLeadValidationShape.phoneNumber.test('Phone number available', 'This phone number already exist', checkPhoneNumberExistence);
  }

  const createLeadValidationSchema = yup.object().shape(createLeadValidationShape);
  const editCustomerValidationSchema = yup.object().shape(editCustomerShape);

  return (
      <Formik
        enableReinitialize
        initialValues={initPhoneNumber(props.value)}
        onSubmit={props.leadId ? updateLeadCustomer : addNewLead}
        validationSchema={props.leadId ? editCustomerValidationSchema : createLeadValidationSchema}
      >
        {(context: FormikContext<any>) => {
          const getExistedActiveLead = async () => {
            if (_.get(existedActiveLead, '_id')) {
              const idToken = await firebase.auth().currentUser!.getIdToken();
              const serviceProxy = getServiceProxy(idToken);

              const newLeadInfo = await serviceProxy.findLeadById(_.get(existedActiveLead, '_id')!);
              context.setValues({
                ..._.get(newLeadInfo, 'customer._id', {}),
                channel: _.get(newLeadInfo, 'channel'),
                source: _.get(newLeadInfo, 'source'),
                campaign: _.get(newLeadInfo, 'campaign'),
                medium: _.get(newLeadInfo, 'medium'),
                content: _.get(newLeadInfo, 'content'),
              });
              setPhoneEditDisabled(true);
              setExistedActiveLead(undefined);
              setSelectedContact(newLeadInfo.customer);
            }
          };

          return (
            <Form layout='vertical' onSubmit={context.handleSubmit}>
              {props.leadId ? (
                <LeadExistingContactForm
                  context={context}
                  leadId={props.leadId}
                  showRelationPicker={false}
                  existedContact={existedContact}
                  selectedContact={selectedContact}
                  existedActiveLead={existedActiveLead}
                  getExistedActiveLead={getExistedActiveLead}
                  isFamilyTab={false}
                  authUser={props.authUser}
                  phoneEditDisabled={phoneEditDisabled}
                  selectExistedContact={selectExistedContact}
                  onChange={props.onChange}
                />
              ) : (
                <LeadNewContactForm
                  context={context}
                  leadId={props.leadId}
                  loading={loading}
                  showRelationPicker={false}
                  phoneEditDisabled={phoneEditDisabled}
                  authUser={props.authUser}
                  isFamilyTab={false}
                  selectedContact={selectedContact}
                  existedContact={existedContact}
                  existedActiveLead={existedActiveLead}
                  getExistedActiveLead={getExistedActiveLead}
                  selectExistedContact={selectExistedContact}
                  onChange={props.onChange}
                />
              )}

              <LeadSourceForm
                context={context}
                leadContent={props.leadContent}
              />

              <Row>
                <Col xs={24} style={{textAlign: 'right'}}>
                  <Button type='primary' htmlType='submit' loading={loading}>
                    Save
                  </Button>
                </Col>
              </Row>
            </Form>
          );
        }}
      </Formik>
  );
};
