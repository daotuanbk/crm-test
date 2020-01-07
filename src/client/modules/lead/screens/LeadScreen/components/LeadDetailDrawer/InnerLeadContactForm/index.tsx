import React from 'react';
import {
  Col,
  Row,
  Form,
  Input,
  Select,
  DatePicker,
} from 'antd';
import { ContactGender, FamilyMemberRelation, Customer, Lead } from '@client/services/service-proxies';
import _ from 'lodash';
import moment from 'moment';
import { FormikContext } from 'formik';
import { AuthUser } from '@client/store';
import { FamilyTabErrorMessage } from './PhoneNumberErrorMessage/FamilyTabErrorMessage';
import { NotActiveLeadErrorMessage } from './PhoneNumberErrorMessage/NotActiveLeadErrorMessage';
import { OtherActiveLeadErrorMessage } from './PhoneNumberErrorMessage/OtherActiveLeadErrorMessage';
import { YourActiveLeadErrorMessage } from './PhoneNumberErrorMessage/YourActiveLeadErrorMessage';
import { UnassignLeadErrorMessage } from './PhoneNumberErrorMessage/UnassignLeadErrorMessage';

interface Props {
  context: FormikContext<any>;
  showRelationPicker: boolean;
  phoneEditDisabled: boolean;
  existedContact?: Customer;
  selectedContact?: Customer;
  existedActiveLead?: Lead;
  isFamilyTab: boolean;
  authUser: AuthUser;
  getExistedActiveLead?: () => Promise<void>;
  onChange: (values: (Customer|Lead)) => void;
  selectExistedContact?: () => void;
}

export const InnerLeadContactForm = (props: Props) => {
  const {
    phoneEditDisabled,
    showRelationPicker,
    existedContact,
    selectedContact,
    selectExistedContact,
    existedActiveLead,
    isFamilyTab,
    authUser,
    onChange,
    getExistedActiveLead,
  } = props;

  const {
    values,
    errors,
    handleChange,
    setFieldValue,
    setValues,
  } = props.context;

  const copyExistedContact = () => {
    setValues(existedContact);
  };

  const renderPhoneNumberErrorMessage = (defaultErrorMessage: string) => {
    if (isFamilyTab) {
      if (defaultErrorMessage && existedContact && !selectedContact) {
        return (
          <FamilyTabErrorMessage
            errorMessage={errors.phoneNumber as any}
            copyExistedContact={copyExistedContact}
            selectExistedContact={selectExistedContact as any}
          />
        );
      }
    } else {
      if (defaultErrorMessage && existedContact && !existedActiveLead && !selectedContact) {
        return (
          <NotActiveLeadErrorMessage
            errorMessage={errors.phoneNumber as any}
            existedContact={existedContact}
            onChange={onChange}
            copyExistedContact={copyExistedContact}
            selectExistedContact={selectExistedContact as any}
          />
        );
      } else if (defaultErrorMessage && existedContact && existedActiveLead && !_.get(existedActiveLead, 'owner.id')) {
        return (
          <UnassignLeadErrorMessage
            errorMessage={errors.phoneNumber as any}
            authUser={authUser}
            existedActiveLead={existedActiveLead as any}
            getExistedActiveLead={getExistedActiveLead}
            onChange={onChange}
            setValues={(newValues: any) => setValues(newValues)}
          />
        );
      } else if (defaultErrorMessage && existedContact && existedActiveLead && _.get(existedActiveLead, 'owner.id') !== authUser.id) {
        return (
          <OtherActiveLeadErrorMessage
            errorMessage={errors.phoneNumber as any}
            existedActiveLead={existedActiveLead}
          />
        );
      } else if (defaultErrorMessage && existedContact && existedActiveLead && _.get(existedActiveLead, 'owner.id') === authUser.id) {
        return (
          <YourActiveLeadErrorMessage
            errorMessage={errors.phoneNumber as any}
            existedActiveLead={existedActiveLead}
            getExistedActiveLead={getExistedActiveLead}
            onChange={onChange}
            setValues={(newValues: any) => setValues(newValues)}
          />
        );
      }
    }

    return defaultErrorMessage;
  };

  return (
    <>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label='Full name'
            validateStatus={errors.fullName ? 'error' : undefined}
            help={errors.fullName}
          >
            <Input
              name='fullName'
              value={values.fullName}
              onChange={handleChange}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label='Phone number'
            validateStatus={errors.phoneNumber ? 'error' : undefined}
            help={renderPhoneNumberErrorMessage(errors.phoneNumber as any)}
          >
            <Input
              name='phoneNumber'
              value={values.phoneNumber}
              onChange={handleChange}
              disabled={phoneEditDisabled}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label='Gender'
            validateStatus={errors.gender ? 'error' : undefined}
            help={errors.gender}
          >
            <Select
              value={values.gender}
              onChange={(value: string) => setFieldValue('gender', value)}
            >
              <Select.Option value={ContactGender.MALE}>{_.capitalize(ContactGender.MALE)}</Select.Option>
              <Select.Option value={ContactGender.FEMALE}>{_.capitalize(ContactGender.FEMALE)}</Select.Option>
              <Select.Option value={ContactGender.OTHER}>{_.capitalize(ContactGender.OTHER)}</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label='Email'
            validateStatus={errors.email ? 'error' : undefined}
            help={errors.email}
          >
            <Input
              name='email'
              value={values.email}
              onChange={handleChange}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label='Date of birth'
            validateStatus={errors.dob ? 'error' : undefined}
            help={errors.dob}
          >
            <DatePicker
              name='dob'
              style={{width: '100%'}}
              placeholder={undefined}
              value={values.dob ? moment(values.dob) : undefined}
              onChange={(date) => setFieldValue('dob', date!.toISOString())}
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label='Address'
            validateStatus={errors.address ? 'error' : undefined}
            help={errors.address}
          >
            <Input
              name='address'
              value={values.address}
              onChange={handleChange}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            label='Facebook'
            validateStatus={errors.facebook ? 'error' : undefined}
            help={errors.facebook}
          >
            <Input
              name='facebook'
              value={values.facebook}
              onChange={handleChange}
            />
          </Form.Item>
        </Col>

        {showRelationPicker && (
          <Col span={8}>
            <Form.Item
              label='Relation'
              validateStatus={errors.relation ? 'error' : undefined}
              help={errors.relation}
            >
              <Select
                value={values.relation}
                onChange={(value: string) => setFieldValue('relation', value)}
              >
                <Select.Option value={FamilyMemberRelation.SON}>{_.capitalize(_.startCase(FamilyMemberRelation.SON))}</Select.Option>
                <Select.Option value={FamilyMemberRelation.DAUGHTER}>{_.capitalize(_.startCase(FamilyMemberRelation.DAUGHTER))}</Select.Option>
                <Select.Option value={FamilyMemberRelation.GRAND_SON}>{_.capitalize(_.startCase(FamilyMemberRelation.GRAND_SON))}</Select.Option>
                <Select.Option value={FamilyMemberRelation.GRAND_DAUGHTER}>{_.capitalize(_.startCase(FamilyMemberRelation.GRAND_DAUGHTER))}</Select.Option>
                <Select.Option value={FamilyMemberRelation.NEPHEW}>{_.capitalize(_.startCase(FamilyMemberRelation.NEPHEW))}</Select.Option>
                <Select.Option value={FamilyMemberRelation.OTHER}>{_.capitalize(_.startCase(FamilyMemberRelation.OTHER))}</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        )}
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            label='Zalo'
            validateStatus={errors.zalo ? 'error' : undefined}
            help={errors.zalo}
          >
            <Input
              name='zalo'
              value={values.zalo}
              onChange={handleChange}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            label='School'
            validateStatus={errors.school ? 'error' : undefined}
            help={errors.school}
          >
            <Input
              name='school'
              value={values.school}
              onChange={handleChange}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
};
