import React from 'react';
import { SectionBox, BorderWrapper } from '@client/components';
import { Row, Col, Popconfirm, DatePicker, message, Select, Button } from 'antd';
import moment from 'moment';
import uuid from 'uuid';
import { InlineEdit } from '../InlineEdit';
import { getFacebookUrl } from '@client/core/helpers/getFacebookUrl';
import { generateFullName } from '@client/core';
import { CompareRootContact } from '../CompareRootContact';
import _ from 'lodash';
import slugify from 'slugify';
import { translate } from '@client/i18n';
import './styles.less';

interface State {
  options: any;
  compareRootContact: any;
  compareOptions: any;
  compareRelations: any;
  compareModal: boolean;
}

interface Props {
  data: any;
  rootContact: any;
  changeInput: (payload: any, callback?: any) => void;
  updateContact: (payload: any) => Promise<void>;
  updateRelation: () => Promise<void>;
  updateRelationField: (payload: any) => Promise<void>;
  findMapping: (payload: string) => Promise<any>;
  findRootContact: (payload: string) => Promise<any>;
  manualUpdateRootContact: (id: string, payload: any) => Promise<any>;
  mergeRootContact: (id: string, payload: any) => Promise<any>;
}

export class PersonalInfo extends React.Component<Props, State> {
  state: State = {
    options: [],
    compareRootContact: undefined,
    compareOptions: undefined,
    compareRelations: undefined,
    compareModal: false,
  };

  addRelation = async () => {
    this.props.changeInput({
      contact: {
        _id: {
          contactRelations: [
            ...(this.props.data.contact && this.props.data.contact._id && this.props.data.contact._id.contactRelations ? this.props.data.contact._id.contactRelations : []),
            {
              index: uuid.v4(),
              fullName: undefined,
              relation: undefined,
              email: undefined,
              phone: undefined,
              userType: this.props.data && this.props.data.contact && this.props.data.contact._id && this.props.data.contact._id.contactBasicInfo.userType === 'student' ? 'parent' : 'student',
            },
          ],
        },
      },
    }, await this.props.updateRelation);
  };

  compareRootContact = async (payload: string, root: any, selected: any, fieldName?: string) => {
    let mapping = [];
    if (!fieldName) {
      const fullName = slugify(generateFullName({
        firstName: this.props.data && this.props.data.contact && this.props.data.contact.firstName || '',
        lastName: this.props.data && this.props.data.contact && this.props.data.contact.lastName || '',
      }));

      const reverseFullName = slugify(generateFullName({
        firstName: this.props.data && this.props.data.contact && this.props.data.contact.firstName || '',
        lastName: this.props.data && this.props.data.contact && this.props.data.contact.lastName || '',
      }, true));
      const array = [];
      array.push(this.props.findMapping(payload));
      if (fullName) {
        array.push(this.props.findMapping(`${payload}-${fullName}`));
      }
      if (reverseFullName) {
        array.push(this.props.findMapping(`${payload}-${reverseFullName}`));
      }
      const mappings = await Promise.all(array);
      mapping = mappings && mappings.length ? [].concat.apply([], mappings).filter((v: any) => v) : [] as any;
    } else {
      let fullName = '';
      let reverseFullName = '';
      const email = this.props.data && this.props.data.contact && this.props.data.contact.email ? this.props.data.contact.email : '';
      const phone = this.props.data && this.props.data.contact && this.props.data.contact.phone ? this.props.data.contact.phone : '';
      if (fieldName === 'lastName') {
        fullName = slugify(generateFullName({
          firstName: this.props.data && this.props.data.contact && this.props.data.contact.firstName || '',
          lastName: payload || '',
        }));
        reverseFullName = slugify(generateFullName({
          firstName: this.props.data && this.props.data.contact && this.props.data.contact.firstName || '',
          lastName: payload || '',
        }, true));
      } else {
        fullName = slugify(generateFullName({
          lastName: this.props.data && this.props.data.contact && this.props.data.contact.lastName || '',
          firstName: payload || '',
        }));
        reverseFullName = slugify(generateFullName({
          lastName: this.props.data && this.props.data.contact && this.props.data.contact.lastName || '',
          firstName: payload || '',
        }, true));
      }
      const array = [];
      if (fullName) {
        array.push(this.props.findMapping(`${email}-${fullName}`));
        array.push(this.props.findMapping(`${phone}-${fullName}`));
      }
      if (reverseFullName) {
        array.push(this.props.findMapping(`${email}-${reverseFullName}`));
        array.push(this.props.findMapping(`${phone}-${reverseFullName}`));
      }
      const mappings = await Promise.all(array);
      mapping = mappings && mappings.length ? [].concat.apply([], mappings).filter((v: any) => v) : [] as any;
    }

    if (mapping && mapping.length && root) {
      const filteredMapping = mapping.filter((val: any) => val.refId !== root._id);
      if (filteredMapping.length && filteredMapping[0].refId) {
        const oldRootId = await this.props.findRootContact(mapping[0].refId);
        if (oldRootId) {
          const mergeRootContactOptions = {
            email: _.uniq([...(root && root.contactBasicInfo ?
              root.contactBasicInfo.email || [] : []), ...(oldRootId && oldRootId.contactBasicInfo ? oldRootId.contactBasicInfo.email || [] : [])]).filter((v: any) => v),
            phone: _.uniq([...(root && root.contactBasicInfo ?
              root.contactBasicInfo.phone || [] : []), ...(oldRootId && oldRootId.contactBasicInfo ? oldRootId.contactBasicInfo.phone || [] : [])]).filter((v: any) => v),
            fb: _.uniq([...(root && root.contactBasicInfo ?
              root.contactBasicInfo.fb || [] : []), ...(oldRootId && oldRootId.contactBasicInfo ? oldRootId.contactBasicInfo.fb || [] : [])]).filter((v: any) => v),
            firstName: _.uniq([(root && root.contactBasicInfo ?
              root.contactBasicInfo.firstName : ''), (oldRootId && root.contactBasicInfo ? oldRootId.contactBasicInfo.firstName : '')]).filter((v: any) => v),
            lastName: _.uniq([(root && root.contactBasicInfo ?
              root.contactBasicInfo.lastName : ''), (oldRootId && root.contactBasicInfo ? oldRootId.contactBasicInfo.lastName : '')]).filter((v: any) => v),
            address: _.uniq([(root && root.contactBasicInfo ?
              root.contactBasicInfo.address : ''), (oldRootId && root.contactBasicInfo ? oldRootId.contactBasicInfo.address : '')]).filter((v: any) => v),
          };
          const compareRootContact = {
            _id: root._id,
            oldId: oldRootId._id,
            email: _.uniq([...(root && root.contactBasicInfo ? root.contactBasicInfo.email || [] : []), ...(oldRootId && oldRootId.contactBasicInfo ? oldRootId.contactBasicInfo.email || [] : [])]),
            phone: _.uniq([...(root && root.contactBasicInfo ? root.contactBasicInfo.phone || [] : []), ...(oldRootId && oldRootId.contactBasicInfo ? oldRootId.contactBasicInfo.phone || [] : [])]),
            fb: _.uniq([...(root && root.contactBasicInfo ? root.contactBasicInfo.fb || [] : []), ...(oldRootId && oldRootId.contactBasicInfo ? oldRootId.contactBasicInfo.fb || [] : [])]),
            firstName: (root && root.contactBasicInfo && root.contactBasicInfo.firstName ?
              root.contactBasicInfo.firstName : (oldRootId && root.contactBasicInfo ? oldRootId.contactBasicInfo.firstName : '')),
            lastName: (root && root.contactBasicInfo && root.contactBasicInfo.lastName ?
              root.contactBasicInfo.lastName : (oldRootId && root.contactBasicInfo ? oldRootId.contactBasicInfo.lastName : '')),
            address: (root && root.contactBasicInfo && root.contactBasicInfo.address ?
              root.contactBasicInfo.address : (oldRootId && root.contactBasicInfo ? oldRootId.contactBasicInfo.address : '')),
          };
          const compareRelations = [
            ...(root && root.contactRelations ? root.contactRelations : []),
            ...(oldRootId && oldRootId.contactRelations ? oldRootId.contactRelations : []),
          ];
          this.setState({
            compareRootContact,
            compareOptions: mergeRootContactOptions,
            compareRelations,
            compareModal: true,
          });
        } else {
          // Update root contact automatically
          await this.props.manualUpdateRootContact(root._id, selected);
        }
      } else {
        await this.props.manualUpdateRootContact(root._id, selected);
      }
    } else {
      await this.props.manualUpdateRootContact(root._id, selected);
    }
  }

  removeRelation = async (id: string) => {
    this.props.changeInput({
      contact: {
        _id: {
          contactRelations: (this.props.data.contact && this.props.data.contact._id && this.props.data.contact._id.contactRelations ?
            this.props.data.contact._id.contactRelations : []).filter((val: any) => val.index !== id),
        },
      },
    }, await this.props.updateRelation);
  }

  mergeRootContact = async () => {
    const payload = {
      contactBasicInfo: {
        ...this.props.rootContact.contactBasicInfo,
        ...this.state.compareRootContact,
      },
      oldId: this.state.compareRootContact.oldId,
    };
    await this.props.mergeRootContact(this.state.compareRootContact._id, payload);
    message.success(translate('lang:updateSuccess'));
    this.setState({
      compareRootContact: undefined,
      compareOptions: undefined,
      compareRelations: undefined,
      compareModal: false,
    });
  }

  changeCompareRootContact = (payload: any) => {
    this.setState({
      compareRootContact: {
        ...this.state.compareRootContact,
        ...payload,
      },
    });
  }

  render() {
    const data = this.props.data;
    const avatar = _.get(data, ['contact', '_id', 'contactBasicInfo', 'avatar'], '/static/images/default-user.jpg');
    const dob = _.get(data, ['contact', '_id', 'contactBasicInfo', 'dob'], undefined);

    return (
      <BorderWrapper>
        <Row type='flex' gutter={30} style={{ marginBottom: '24px' }}>
          <Col span={4} className='align-horizontal-center' style={{ padding: '0px' }}>
            <img className='user-avatar' src={avatar}></img>
          </Col>
          <Col span={10}>
            <div style={{ width: '100%' }}>
              <Row className='align-items-center has-small-top-margin'>
                <Col span={6}>
                  <div className='title-of-personal-info'>{translate('lang:firstName')}:</div>
                </Col>
                <Col span={18}>
                  <InlineEdit
                    value={_.get(data, ['contact', '_id', 'contactBasicInfo', 'lastName'], '')}
                    field='contactBasicInfo.lastName'
                    onSave={this.props.updateContact}
                    compareRootContact={(payload, selected) => this.compareRootContact(payload, this.props.rootContact, selected, 'lastName')}
                    systemValue={_.get(this.props, ['rootContact', 'contactBasicInfo', 'lastName'], undefined)}
                  />
                </Col>
              </Row>
              <Row className='align-items-center has-small-top-margin'>
                <Col span={6}>
                  <div className='title-of-personal-info'>{translate('lang:lastName')}:</div>
                </Col>
                <Col span={18}>
                  <InlineEdit
                    value={_.get(data, ['contact', '_id', 'contactBasicInfo', 'firstName'], '')}
                    field='contactBasicInfo.firstName'
                    onSave={this.props.updateContact}
                    compareRootContact={(payload, selected) => this.compareRootContact(payload, this.props.rootContact, selected, 'firstName')}
                    systemValue={_.get(this.props, ['rootContact', 'contactBasicInfo', 'firstName'], undefined)}
                  />
                </Col>
              </Row>
              <Row>
                <div className='align-items-center' style={{ padding: '5px 0px' }}>
                  <Col span={6}>
                    <div className='title-of-personal-info' style={{ marginRight: '5px' }}>{translate('lang:type')}:</div>
                  </Col>
                  <Col span={18}>
                    <span>{_.capitalize(_.get(data, ['contact', '_id', 'contactBasicInfo', 'userType'], ''))}</span>
                  </Col>
                </div>
              </Row>
            </div>
          </Col>
          <Col span={10} style={{ padding: '0px 15px' }}>
            <Row className='align-items-center has-small-top-margin'>
              <Col span={6} className='has-text-right'>
                <div className='title-of-personal-info'>DOB:</div>
              </Col>
              <Col span={18}>
                <DatePicker style={{ width: '100%' }}
                  value={dob ? moment(dob) : undefined}
                  onChange={(value) => this.props.updateContact({ 'contactBasicInfo.dob': value })} />
              </Col>
            </Row>
            <Row className='align-items-center has-small-top-margin'>
              <Col span={6} className='has-text-right'>
                <div className='title-of-personal-info'>{translate('lang:gender')}:</div>
              </Col>
              <Col span={18}>
                <Select
                  style={{ width: '100%' }}
                  value={_.get(data, ['contact', '_id', 'contactBasicInfo', 'gender'], undefined)}
                  onChange={(value: any) => this.props.updateContact({ 'contactBasicInfo.gender': value })}
                >
                  <Select.Option value='male' key='male'>{translate('lang:male')}</Select.Option>
                  <Select.Option value='female' key='female'>{translate('lang:female')}</Select.Option>
                </Select>
              </Col>
            </Row>
          </Col>
        </Row>

        <SectionBox>
          <div className='personal-info-section-box'>
            <h3>{translate('lang:contact')}</h3>
            <Row className='align-items-center has-small-top-margin'>
              <Col span={3} >
                <span className='text-gray' style={{ marginRight: '2px' }}>{translate('lang:email')}:</span>
              </Col>
              <Col span={9}>
                <InlineEdit
                  value={_.get(data, ['contact', '_id', 'contactBasicInfo', 'email'], undefined)}
                  field='contactBasicInfo.email'
                  onSave={this.props.updateContact}
                  compareRootContact={(payload, selected) => this.compareRootContact(payload, this.props.rootContact, selected)}
                  systemValue={_.get(data, ['contact', '_id', 'contactBasicInfo', 'email'], undefined)}
                />
              </Col>
              <Col span={3} className='has-text-right' >
                <span className='text-gray' style={{ marginRight: '2px' }}>{translate('lang:phone')}:</span>
              </Col>
              <Col span={9}>
                <InlineEdit
                  value={_.get(data, ['contact', '_id', 'contactBasicInfo', 'phone'], undefined)}
                  field='contactBasicInfo.phone'
                  onSave={this.props.updateContact}
                  compareRootContact={(payload, selected) => this.compareRootContact(payload, this.props.rootContact, selected)}
                  systemValue={_.get(data, ['contact', '_id', 'contactBasicInfo', 'phone'], undefined)}
                />
              </Col>
            </Row>
            <Row className='align-items-center has-small-top-margin'>
              <Col span={3}>
                <span className='text-gray' style={{ marginRight: '2px' }}>{translate('lang:fb')}:</span>
              </Col>
              {_.get(data, ['contact', '_id', 'contactBasicInfo', 'fb'], undefined) ? (
                  <a
                    href={getFacebookUrl(data.contact._id.contactBasicInfo.fb)}
                    target='_blank'
                  >
                    {getFacebookUrl(data.contact._id.contactBasicInfo.fb)}
                  </a>
                ) : (
                  <Col span={9}>
                    <InlineEdit
                      value={''}
                      field='contactBasicInfo.fb'
                      onSave={this.props.updateContact}
                      systemValue={this.props.rootContact && this.props.rootContact.contactBasicInfo ? this.props.rootContact.contactBasicInfo.fb : undefined}
                    />
                  </Col>
                )
              }
              <Col span={3} className='has-text-right' >
                <span className='text-gray' style={{ marginRight: '2px' }}>{translate('lang:address')}:</span>
              </Col>
              <Col span={9}>
                <InlineEdit
                  value={_.get(data, ['contact', '_id', 'contactBasicInfo', 'address'], undefined)}
                  field='contactBasicInfo.address'
                  onSave={this.props.updateContact}
                  systemValue={_.get(data, ['contact', '_id', 'contactBasicInfo', 'address'], undefined)}
                />
              </Col>
            </Row>
          </div>
        </SectionBox>

        {_.get(data, ['contact', '_id', 'contactBasicInfo', 'userType'], undefined) && (
          <SectionBox>
            <div className='personal-info-section-box'>
              <Row>
                <Col xs={12}>
                  <h3>{data.contact._id.contactBasicInfo.userType === 'student' ? 'PARENT' : 'STUDENT'}</h3>
                </Col>
              </Row>
              {_.get(data, ['contact', '_id', 'contactRelations'], []).map((val: any) => {
                return (
                  <Row>
                    <Row className='align-items-center has-small-top-margin'>
                      <Col span={3}>
                        <span className='text-gray' style={{ marginRight: '2px' }}>{translate('lang:name')}:</span>
                      </Col>
                      <Col span={9}>
                        <InlineEdit
                          value={val.fullName}
                          field='contactRelations.$.fullName'
                          onSave={this.props.updateRelationField}
                          additionalField='index'
                          additionalValue={val.index}
                        />
                      </Col>
                      <Col span={3} className='has-text-right' >
                        <span className='text-gray' style={{ marginRight: '2px' }}>{translate('lang:relation')}:</span>
                      </Col>
                      <Col span={9}>
                        <InlineEdit
                          value={val.relation}
                          field='contactRelations.$.relation'
                          onSave={this.props.updateRelationField}
                          additionalField='index'
                          additionalValue={val.index}
                        />
                      </Col>
                    </Row>
                    <Row className='align-items-center has-small-top-margin'>
                      <Col span={3} >
                        <span className='text-gray' style={{ marginRight: '2px' }}>{translate('lang:email')}:</span>
                      </Col>
                      <Col span={9}>
                        <InlineEdit
                          value={val.email}
                          field='contactRelations.$.email'
                          onSave={this.props.updateRelationField}
                          additionalField='index'
                          additionalValue={val.index}
                        />
                      </Col>
                      <Col span={3} className='has-text-right' >
                        <span className='text-gray' style={{ marginRight: '2px' }}>{translate('lang:phone')}:</span>
                      </Col>
                      <Col span={9}>
                        <InlineEdit
                          value={val.phone}
                          field='contactRelations.$.phone'
                          onSave={this.props.updateRelationField}
                          additionalField='index'
                          additionalValue={val.index}
                        />
                      </Col>
                    </Row>
                    <Row className='align-items-center has-small-top-margin'>
                      <Col span={3} >
                        <span className='text-gray' style={{ marginRight: '2px' }}>DOB: </span>
                      </Col>
                      <Col span={9}>
                        <DatePicker
                          className='personal-dob'
                          defaultValue={val.dob ? moment(val.dob) : undefined as any}
                          onChange={(date) => this.props.updateRelationField({ ['contactRelations.$.dob']: date, index: val.index })}
                        />
                      </Col>
                      <Col span={3} className='has-text-right' >
                        <span className='text-gray' style={{ marginRight: '2px' }}>{translate('lang:zalo/Fb')}:</span>
                      </Col>
                      <Col span={9}>
                        <InlineEdit
                          value={val.social}
                          field='contactRelations.$.social'
                          onSave={this.props.updateRelationField}
                          additionalField='index'
                          additionalValue={val.index}
                        />
                      </Col>
                    </Row>
                    {data.contact._id.contactBasicInfo.userType === 'student' && (
                      <Row className='align-items-center has-small-top-margin'>
                        <Col span={3}>
                          <span className='text-gray' style={{ marginRight: '2px' }}>{translate('lang:job')}:</span>
                        </Col>
                        <Col span={9}>
                          <InlineEdit
                            value={val.job}
                            field='contactRelations.$.job'
                            onSave={this.props.updateRelationField}
                            additionalField='index'
                            additionalValue={val.index}
                          />
                        </Col>
                        <Col offset={6} xs={6} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Popconfirm title='Are you sure you want to remove this relation?' onConfirm={() => this.removeRelation(val.index)}>
                            <Button type='danger' icon='delete'>
                              Delete this relation
                            </Button>
                          </Popconfirm>
                        </Col>
                      </Row>
                    )}
                    {data.contact._id.contactBasicInfo.userType !== 'student' && (
                      <Row>
                        <Col offset={18} xs={6} style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '5px' }}>
                          <Popconfirm title='Are you sure you want to remove this relation?' onConfirm={() => this.removeRelation(val.index)}>
                            <Button type='danger' icon='delete'>
                              Delete this relation
                            </Button>
                          </Popconfirm>
                        </Col>
                      </Row>
                    )}
                    <hr style={{ border: '1px dashed #D9D9D9', width: '90%' }} />
                  </Row>
                );
              })}
              <Row type='flex'>
                <Col xs={12}></Col>
                <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button onClick={this.addRelation} type='primary' icon='plus'>
                  <span>Add more relation</span>
                  </Button>
                </Col>
              </Row>
            </div>
          </SectionBox>
        )}
        <SectionBox>
          <div style={{ marginTop: '24px' }}>
            <h3>{translate('lang:school')}</h3>
            <Row className='align-items-center has-small-top-margin'>
              <Col span={3}>
                <span className='text-gray' style={{ marginRight: '2px' }}>{translate('lang:name')}:</span>
              </Col>
              <Col span={9}>
                <InlineEdit
                  value={_.get(data, ['contact', '_id', 'schoolInfo', 'schoolName'], undefined)}
                  field='schoolInfo.schoolName'
                  onSave={this.props.updateContact}
                  systemValue={_.get(this.props, ['rootContact', 'schoolInfo', 'schoolName'], undefined)}
                />
              </Col>
              <Col span={3} className='has-text-right' >
                <span className='text-gray' style={{ marginRight: '2px' }}>{translate('lang:grade')}:</span>
              </Col>
              <Col span={9}>
                <InlineEdit
                  value={_.get(data, ['contact', '_id', 'schoolInfo', 'majorGrade'], undefined)}
                  field='schoolInfo.majorGrade'
                  onSave={this.props.updateContact}
                  systemValue={_.get(this.props, ['rootContact', 'schoolInfo', 'majorGrade'], undefined)}
                />
              </Col>
            </Row>
          </div>
        </SectionBox>

        <CompareRootContact
          options={this.state.compareOptions}
          values={this.state.compareRootContact}
          visible={this.state.compareModal}
          onSubmit={this.mergeRootContact}
          onChange={this.changeCompareRootContact}
        />
      </BorderWrapper>
    );
  }
}
