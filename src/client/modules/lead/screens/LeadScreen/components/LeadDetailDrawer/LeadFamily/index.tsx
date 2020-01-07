import React, { useState } from 'react';
import { Form, Typography, Button, Row, Col, notification, Modal } from 'antd';
import _ from 'lodash';
import { Customer, Lead, ContactGender, MakeFamilyMemberCustomerPayloadOperation } from '@client/services/service-proxies';
import { LeadNewContactForm } from '../LeadNewContactForm';
import { LeadExistingContactForm } from '../LeadExistingContactForm';
import { initialContact } from '../helpers';
import { Formik, FormikContext } from 'formik';
import { initPhoneNumber, serializePhoneNumber, getErrorMessage } from '@client/core';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import * as yup from 'yup';
import { config } from '@client/config';
import { AuthUser } from '@client/store';

interface Props {
  leadId: string;
  familyMembers: Customer[];
  authUser: AuthUser;
  onChange: (values: (Customer|Lead)) => void;
}

const bottomSpace = {
  marginBottom: '3rem',
};

const execMakeFamilyMemberCustomer = async (_id: string) => {
  const idToken = await firebase.auth().currentUser!.getIdToken();
  const serviceProxy = getServiceProxy(idToken);
  return await serviceProxy.updateLead(_id, {
    operation: MakeFamilyMemberCustomerPayloadOperation.MakeFamilyMemberCustomer,
  }) as any;
};

export const LeadFamily = (props: Props) => {
  const [newMember, setNewMember] = useState<boolean>(props.familyMembers.length === 0);
  const [loading, setLoading] = useState<boolean>(false);
  const [existedContact, setExistedContact] = useState<Customer|undefined>(undefined);
  const [selectedContact, setSelectedContact] = useState<Customer|undefined>(undefined);

  const selectExistedContact = () => {
    setSelectedContact(existedContact);
  };

  const toggleAddNewFamilyMember = () => {
    setNewMember(!newMember);
  };

  const updateFamilyMember = async (values: any) => {
    try {
      setLoading(true);

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      const familyMemberInfo = serializePhoneNumber(values);
      const newLeadInfo = await serviceProxy.updateLeadFamilyMember(
        _.get(props, 'leadId'),
        _.get(values, '_id'),
        familyMemberInfo,
      );

      props.onChange(newLeadInfo);
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

  const addNewFamilyMember = async (values: any, formikBag: any) => {
    try {
      setLoading(true);

      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);

      const familyMemberInfo = serializePhoneNumber(values);
      const addFamilyMemberPayload = {
        contactId: _.get(selectedContact, '_id'),
        contactInfo: familyMemberInfo,
        relation: familyMemberInfo.relation,
      };
      if (props.leadId) {
        const newLeadInfo = await serviceProxy.addLeadFamilyMember(props.leadId, addFamilyMemberPayload);

        props.onChange(newLeadInfo);
        notification.success({
          message: 'Add family member success',
          placement: 'bottomRight',
        });
        formikBag.resetForm({});
        toggleAddNewFamilyMember();
      }
    } catch (error) {
      notification.error({
        message: 'Add family member failed',
        description: getErrorMessage(error),
        placement: 'bottomRight',
      });
    } finally {
      setLoading(false);
    }
  };

  const addNewfamilyMemberValidationSchema = yup.object().shape({
    fullName: yup.string().required('Please input full name'),
    phoneNumber: yup.string().nullable(true)
      .test('Valid phone number format', 'Invalid phone number', (value: string) => {
        if (!value || value === config.stringFormat.phoneNumberPrefix) {
          return true;
        }
        return config.regex.phone.test(value);
      })
      .test('Phone number available', 'This phone number already exist', async (value) => {
        if (!value || value === config.stringFormat.phoneNumberPrefix || selectedContact) {
          return true;
        }

        const idToken = await firebase.auth().currentUser!.getIdToken();
        const serviceProxy = getServiceProxy(idToken);
        const existedPhoneNumber = await serviceProxy.checkContactExistsByPhoneNumber(value);

        setExistedContact(existedPhoneNumber as any);
        return !existedPhoneNumber;
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
    relation: yup.string().required('Please select relation'),
  });

  const editFamilyMemberValidationSchema = yup.object().shape({
    fullName: yup.string().required('Please input full name'),
    phoneNumber: yup.string().nullable(true)
      .test('Valid phone number format', 'Invalid phone number', (value: string) => {
        if (!value || value === config.stringFormat.phoneNumberPrefix) {
          return true;
        }
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
    relation: yup.string().required('Please select relation'),
  });

  const makeFamilyMemberCustomer = async () => {
      Modal.confirm({
        title: 'This action is irreversible and meant for 18+ customer only, do you still want to do it?',
        icon: 'warning',
        onOk: async () => {
          try {
            const newLead = await execMakeFamilyMemberCustomer(props.leadId);
            props.onChange(newLead);
          } catch (err) {
            notification.error({
              message: getErrorMessage(err),
              placement: 'bottomRight',
            });
          }
        },
      });
  };

  return (
    <Form>
      {props.familyMembers.map((member: any, i: number) => {
        const initialValues = initPhoneNumber({
          ...member._id,
          relation: member.relation,
        });

        return (
          <div style={bottomSpace}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography.Title level={4}># {(i + 1).toString()}</Typography.Title>
              {
                (props.familyMembers.length === 1 && i === 0) && (
                  <Button
                    type='danger'
                    size='small'
                    onClick={makeFamilyMemberCustomer}
                  >
                    Make this member customer
                  </Button>
                )
              }
            </div>
            <Formik
              initialValues={initialValues}
              onSubmit={updateFamilyMember}
              validationSchema={editFamilyMemberValidationSchema}
            >
              {(context: FormikContext<any>) => {
                const memberHasInitialValidPhoneNumber = config.regex.phone.test(initialValues.phoneNumber);
                return (
                  <Form layout='vertical' onSubmit={context.handleSubmit}>
                    <LeadExistingContactForm
                      context={context}
                      leadId={props.leadId}
                      isFamilyTab={true}
                      authUser={props.authUser}
                      showRelationPicker={true}
                      phoneEditDisabled={memberHasInitialValidPhoneNumber}
                      onChange={props.onChange}
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
          </div>
        );
      })}

      {!newMember ? (
        <Button style={{width: '100%'}} type='primary' onClick={() => setNewMember(true)}>+ New member</Button>
      ) : (
        <React.Fragment>
          <Typography.Title level={4}>New family member</Typography.Title>
          <Formik
            initialValues={initPhoneNumber(initialContact)}
            onSubmit={addNewFamilyMember}
            validationSchema={addNewfamilyMemberValidationSchema}
          >
            {(context: FormikContext<any>) => {
              return (
                <Form layout='vertical' onSubmit={context.handleSubmit}>
                  <LeadNewContactForm
                    loading={loading}
                    context={context}
                    leadId={props.leadId}
                    showRelationPicker={true}
                    phoneEditDisabled={false}
                    authUser={props.authUser}
                    isFamilyTab={true}
                    selectedContact={selectedContact}
                    existedContact={existedContact}
                    selectExistedContact={selectExistedContact}
                    onChange={props.onChange}
                  />

                  <Row>
                    <Col xs={24} style={{textAlign: 'right'}}>
                      <Button type='primary' htmlType='submit' loading={loading}>
                        Create
                      </Button>
                    </Col>
                  </Row>
                </Form>
              );
            }}
          </Formik>
        </React.Fragment>
      )}
    </Form>
  );
};
