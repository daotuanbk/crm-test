import React from 'react';
import { Authorize, BorderWrapper } from '@client/components';
import { Row, Col, message } from 'antd';
import { PERMISSIONS } from '@common/permissions';
import firebase from 'firebase';
import { User, SystemConfig, LeadPaymentTransaction } from '@client/services/service-proxies';
import { getServiceProxy } from '@client/services';
import { config } from '@client/config';
import axios from 'axios';
import { AuthUser, withRematch, initStore } from '@client/store';
import { translate } from '@client/i18n';
import { get } from 'lodash';
import { AppointmentList } from './components/AppointmentList';
import { TaskList } from './components/TaskList';
import { LeadManagement } from './components/LeadManagement';
import { AttachmentList } from './components/AttachmentList';
import { ContactBar } from './components/ContactBar';
import { ProductOrder } from './components/ProductOrder';
import { Header } from './components/Header';
import { LeadStage } from './components/LeadStage';
import { NoteList } from './components/NoteList';
import { PersonalInfo } from './components/PersonalInfo';
import { TuitionInfo } from './components/TuitionInfo';
import './LeadDetailScreen.less';

const CORS = 'https://cors-anywhere.herokuapp.com/';

interface State {
  data: any;
  users: User[];
  statuses: SystemConfig[];
  stages: SystemConfig[];
  transactions: LeadPaymentTransaction[];
  courses: any;
  classes: any;
  notes: any;
  combos: any;
  centres: any;
  salesmen: any;
  classStages: SystemConfig[];
  classStatuses: SystemConfig[];
  rootContact: any;
}

interface Props {
  _id: string;
  authUser: AuthUser;
}

const Screen = class extends React.Component<Props, State> {
  state: State = {
    data: {},
    users: [],
    stages: [],
    statuses: [],
    classStages: [],
    classStatuses: [],
    transactions: [],
    courses: [],
    classes: [],
    notes: [],
    combos: [],
    centres: [],
    salesmen: [],
    rootContact: undefined,
  };

  async componentDidMount() {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const leadNoteFilter = JSON.stringify({
      leadId: this.props._id,
      contactId: this.props._id,
    });

    const [data, users, stages, statuses, classStages, classStatuses, productCourses, combos, classes, notes, centres, salesmen]: any = await Promise.all([
      serviceProxy.findLeadById(this.props._id),
      serviceProxy.getAllUsers(),
      serviceProxy.findSystemConfigs('getAllStages', undefined, undefined, undefined, undefined, undefined, undefined),
      serviceProxy.findSystemConfigs('getAllStatuses', undefined, undefined, undefined, undefined, undefined, undefined),
      serviceProxy.findSystemConfigs('getAllClassStages', undefined, undefined, undefined, undefined, undefined, undefined),
      serviceProxy.findSystemConfigs('getAllClassStatus', undefined, undefined, undefined, undefined, undefined, undefined),
      serviceProxy.findProductCourse('getAllRecords', undefined, undefined, undefined, undefined, undefined, undefined),
      serviceProxy.findProductCombo('getAllRecords', undefined, undefined, undefined, undefined, undefined, undefined),
      serviceProxy.getAllClasses(),
      serviceProxy.findLeadNote('getByLeadOrContactId', leadNoteFilter),
      serviceProxy.getAllCentres(),
      serviceProxy.getAllSalesman(),
    ] as any);

    const allCourses = productCourses && productCourses.data ? productCourses.data : [];
    if (data) {
      const transactions = await serviceProxy.findLeadPaymentTransaction(data._id) as any;
      let rootContact;
      if (data.contact && data.contact._id && data.contact._id.rootContactId) {
        rootContact = await serviceProxy.findRootContactById(data.contact._id.rootContactId);
      }

      this.setState({
        data,
        users: users.data,
        stages: stages.data,
        statuses: statuses.data,
        classStages: classStages.data,
        classStatuses: classStatuses.data,
        combos: combos.data,
        transactions,
        courses: allCourses,
        notes: notes.data,
        classes: classes.data,
        centres: centres.data,
        salesmen: salesmen.data,
        rootContact,
      });
    }
  }

  changeInput = (payload: any, callback?: any) => {
    this.setState({
      data: {
        ...this.state.data,
        ...payload,
        contact: {
          ...this.state.data.contact,
          ...payload.contact,
          _id: {
            ...get(this.state, ['data', 'contact', '_id'], {}),
            ...get(payload, ['contact', '_id'], {}),
            contactBasicInfo: {
              ...get(this.state, ['data', 'contact', '_id', 'contactBasicInfo'], {}),
              ...get(payload, ['contact', '_id', 'contactBasicInfo'], {}),
            },
            schoolInfo: {
              ...get(this.state, ['data', 'contact', '_id', 'schoolInfo'], {}),
              ...get(payload, ['contact', '_id', 'schoolInfo'], {}),
            },
          },
        },
        productOrder: {
          ...this.state.data.productOrder,
          ...payload.productOrder,
        },
        tuition: {
          ...this.state.data.tuition,
          ...payload.tuition,
        },
      },
    }, callback);
  }

  changeTransaction = (payload: any) => {
    this.setState({
      transactions: this.state.transactions.map((val: any) => {
        return val._id === payload._id ? {
          ...val,
          ...payload,
        } : val;
      }),
    });
  }

  addTransaction = (payload: any) => {
    this.setState({
      transactions: [payload, ...this.state.transactions],
    });
  }

  calculateTuitionBD = () => {
    const courses = this.state.data && this.state.data.productOrder && this.state.data.productOrder.courses ? this.state.data.productOrder.courses : [];
    return courses.reduce((sum: number, val: any) => {
      return sum + Number(val.tuitionBeforeDiscount);
    }, 0);
  }

  calculateTuitionAD = () => {
    const combo = this.state.data && this.state.data.productOrder && this.state.data.productOrder.comboId ? this.state.data.productOrder.comboId : undefined;
    const courses = this.state.data && this.state.data.productOrder && this.state.data.productOrder.courses ? this.state.data.productOrder.courses : [];
    if (courses && courses.length) {
      if (combo && combo.discountType === 'FIXED' && this.checkComboCondition(combo, courses)) {
        const totalAdditionalDiscount = courses.reduce((sum: number, val: any, _index: number) => {
          const tuition = val.tuitionBeforeDiscount || 0;
          const discount = val.discountValue ?
            (val.discountType === 'PERCENT' ?
              (Number(tuition) * Number(val.discountValue) / 100) :
              Number(val.discountValue))
            : 0;
          return sum + discount;
        }, 0);
        return Number(combo.discountValue) - Number(totalAdditionalDiscount) > 0 ? Number(combo.discountValue) - Number(totalAdditionalDiscount) : 0;
      } else {
        const tuitionFees = courses.reduce((sum: number, val: any, _index: number) => {
          const tuition = val.tuitionBeforeDiscount || 0;
          const discount = val.discountValue ?
            (val.discountType === 'PERCENT' ?
              (Number(tuition) * Number(val.discountValue) / 100) :
              Number(val.discountValue))
            : 0;
          const comboDiscount = this.checkComboConditionForCourse(_index, combo, courses) === 'PERCENT' ? (Number(tuition) * Number(combo ? combo.discountValue : 0) / 100) : 0;
          return sum + ((Number(tuition) - Number(discount) - Number(comboDiscount)) > 0 ? Number(tuition) - Number(discount) - Number(comboDiscount) : 0);
        }, 0);
        if (combo && combo.discountType === 'AMOUNT' && this.checkComboCondition(combo, courses)) {
          return (Number(tuitionFees) - Number(combo.discountValue)) > 0 ? (Number(tuitionFees) - Number(combo.discountValue)) : 0;
        } else {
          return tuitionFees;
        }
      }
    } else {
      if (combo && combo.discountType === 'FIXED' && combo.field === 'courseCount' && combo.conditionValue < 0 && combo.condition === 'gt') return combo.discountValue;
      else return 0;
    }
  }

  checkComboConditionForCourse = (courseIndex: number, combo: any, courses: any) => {
    if (!combo) {
      return 'NONE';
    } else {
      if (combo.field === 'courseCount') {
        if (combo.condition === 'gte') {
          if (courses.length >= combo.conditionValue) {
            if (combo.discountType === 'PERCENT') {
              return 'PERCENT';
            } else if (combo.discountType === 'AMOUNT') {
              return 'AMOUNT';
            } else if (combo.discountType === 'FIXED') {
              return 'FIXED';
            } else {
              return 'NONE';
            }
          } else {
            return 'NONE';
          }
        } else if (combo.condition === 'gt') {
          if (courses.length > combo.conditionValue) {
            if (combo.discountType === 'PERCENT') {
              return 'PERCENT';
            } else if (combo.discountType === 'AMOUNT') {
              return 'AMOUNT';
            } else if (combo.discountType === 'FIXED') {
              return 'FIXED';
            } else {
              return 'NONE';
            }
          } else {
            return 'NONE';
          }
        } else if (combo.condition === 'eq') {
          if (courses.length >= combo.conditionValue) {
            if (courseIndex < combo.conditionValue) {
              if (combo.discountType === 'PERCENT') {
                return 'PERCENT';
              } else if (combo.discountType === 'AMOUNT') {
                return 'AMOUNT';
              } else if (combo.discountType === 'FIXED') {
                return 'FIXED';
              } else {
                return 'NONE';
              }
            } else {
              return 'NONE';
            }
          } else {
            return 'NONE';
          }
        } else {
          return 'NONE';
        }
      } else if (combo.field === 'tuitionBD') {
        if (this.calculateTuitionBD() >= combo.conditionValue) {
          if (combo.discountType === 'PERCENT') {
            return 'PERCENT';
          } else if (combo.discountType === 'AMOUNT') {
            return 'AMOUNT';
          } else if (combo.discountType === 'FIXED') {
            return 'FIXED';
          } else {
            return 'NONE';
          }
        } else {
          return 'NONE';
        }
      } else {
        // If there's any other type of combo, handle it here
        return 'NONE';
      }
    }
  }

  checkComboCondition = (combo: any, courses: any) => {
    if (!combo) {
      return false;
    } else {
      const realCourse = courses.filter((val: any) => val.shortName !== 'UNK');
      if (combo.field === 'courseCount') {
        if (combo.condition !== 'gt') {
          if (courses.length >= combo.conditionValue && realCourse.length) {
            return true;
          } else {
            return false;
          }
        } else {
          if (courses.length > combo.conditionValue && realCourse.length) {
            return true;
          } else {
            return false;
          }
        }
      } else if (combo.field === 'tuitionBD') {
        if (this.calculateTuitionBD() >= combo.conditionValue) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  updateRemainingAndTuitionAD = async () => {
    const tuitionAD = this.calculateTuitionAD();
    const totalPayment = this.state.transactions.reduce((sum: number, val: any) => sum + Number(val.amount), 0);
    const remaining = Number(tuitionAD) - Number(totalPayment);
    this.setState({
      data: {
        ...this.state.data,
        tuition: {
          totalAfterDiscount: tuitionAD,
          remaining,
        },
      },
    });
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      await serviceProxy.updateLead(this.state.data._id, {
        operation: 'updateDetail',
        payload: {
          tuition: {
            totalAfterDiscount: tuitionAD,
            remaining,
          },
        },
      });
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  };

  updateLead = async (payload: any) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      await serviceProxy.updateLead(this.state.data._id, {
        operation: 'updateDetail',
        payload,
      });
      message.success(translate('lang:updateSuccess'), 1);
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  };

  updateContact = async (payload: any) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      await serviceProxy.updateLead(this.state.data._id, {
        operation: 'updateContact',
        payload: {
          _id: this.state.data.contact._id._id,
          ...payload,
        },
      });
      if (Object.keys(payload)[0].indexOf('contactBasicInfo') >= 0) {
        this.changeInput({
          contact: {
            _id: {
              contactBasicInfo: {
                [Object.keys(payload)[0].split('.')[1]]: Object.values(payload)[0],
              },
            },
          },
        });
      }
      message.success(translate('lang:updateSuccess'), 1);
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  };

  updateRelation = async () => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    if (this.state.data && this.state.data.contact && this.state.data.contact._id && this.state.data.contact._id.contactRelations) {
      try {
        await serviceProxy.updateLead(this.state.data._id, {
          operation: 'updateContact',
          payload: {
            _id: this.state.data.contact._id._id,
            contactRelations: this.state.data.contact._id.contactRelations,
          },
        });
      } catch (error) {
        message.error(error.message || translate('lang:internalError'));
      }
    }
  };

  updateRelationField = async (payload: any) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      if (this.state.data && this.state.data.contact && this.state.data.contact._id && this.state.data.contact._id._id) {
        await serviceProxy.updateContact(this.state.data.contact._id._id, {
          operation: 'updateRelations',
          payload,
        });
        message.success(translate('lang:updateSuccess'), 1);
      }
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  };

  updateCourse = async (payload: any, noMessage?: boolean) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      if (this.state.data && this.state.data.productOrder && this.state.data.productOrder._id) {
        await serviceProxy.updateLeadProductOrder(this.state.data.productOrder._id, {
          operation: 'updateCourses',
          payload,
        });
        if (!noMessage) {
          message.success(translate('lang:updateSuccess'), 1);
        }
      }
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  }

  deleteCourse = async (payload: any) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      if (this.state.data && this.state.data.productOrder && this.state.data.productOrder._id) {
        await serviceProxy.updateLeadProductOrder(this.state.data.productOrder._id, {
          operation: 'deleteCourse',
          payload,
        });
        message.success(translate('lang:deleteSuccess'), 1);
      }
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  }

  addCourse = async (payload: any) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      if (this.state.data && this.state.data.productOrder && this.state.data.productOrder._id) {
        await serviceProxy.updateLeadProductOrder(this.state.data.productOrder._id, {
          operation: 'addCourse',
          payload,
        });
        message.success(translate('lang:createSuccess'), 1);
      } else {
        const result = await serviceProxy.createLeadProductOrder({
          leadId: this.state.data._id,
          courseCount: 0,
          courses: [],
        }) as any;
        this.changeInput({
          productOrder: {
            _id: result.id,
            courseCount: 0,
            courses: [],
          },
        });
        await serviceProxy.updateLeadProductOrder(result.id, {
          operation: 'addCourse',
          payload,
        });
        message.success(translate('lang:createSuccess'), 1);
      }
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  }

  syncClassLms = async (oldClassId: string, newClassId: string) => {
    if (!this.state.data || !this.state.data.contact || (!this.state.data.contact.email && !this.state.data.contact.phone)) return;
    const classes = this.state.data && this.state.data.productOrder && this.state.data.productOrder.courses ?
      this.state.data.productOrder.courses.map((val: any) => val.classId).filter((val: string) => val) : [];
    const parent = this.state.data && this.state.data.contact._id && this.state.data.contact._id.contactRelations && this.state.data.contact._id.contactRelations[0] ? {
      firstName: this.state.data.contact._id.contactRelations[0].fullName,
      lastName: '',
      relation: this.state.data.contact._id.contactRelations[0].relation,
      email: [this.state.data.contact._id.contactRelations[0].email],
      phoneNo: [this.state.data.contact._id.contactRelations[0].phone],
    } : {};
    const lmsUser = await axios.post(`${CORS}${config.lms.apiUrl}/users/create-or-update-student`, {
      _id: this.state.data.lmsStudentId,
      email: this.state.data.contact ? this.state.data.contact.email : '',
      phoneNo: this.state.data.contact ? this.state.data.contact.phone : '',
      firstName: this.state.data.contact ? this.state.data.contact.firstName : '',
      lastName: this.state.data.contact ? this.state.data.contact.lastName : '',
      name: this.state.data.contact ? this.state.data.contact.fullName : '',
      password: 123456,
      details: {
        fbLink: this.state.data.contact ? this.state.data.contact.fb : '',
        address: this.state.data.contact ? this.state.data.contact.address : '',
        recentClasses: classes,
        parent,
      },
      studentClasses: classes,
      studentCenter: this.state.data.centre ? this.state.data.centre._id : undefined,
      gender: this.state.data.contact && this.state.data.contact._id && this.state.data.contact._id.contactBasicInfo && this.state.data.contact._id.contactBasicInfo.gender ?
        this.state.data.contact._id.contactBasicInfo.gender : undefined,
      dob: this.state.data.contact && this.state.data.contact._id && this.state.data.contact._id.contactBasicInfo && this.state.data.contact._id.contactBasicInfo.dob ?
        new Date(this.state.data.contact._id.contactBasicInfo.dob).getTime() : undefined,
      oldClassId,
      newClassId,
      tuition: this.state.data.tuition ? this.state.data.tuition : undefined,
      isDebtTuition: this.state.data.tuition && this.state.data.tuition.remaining > 0 ? true : false,
    }, {});
    if (lmsUser && lmsUser.data) {
      await this.updateLead({
        lmsStudentId: lmsUser.data._id,
      });
      if (this.state.data && this.state.data.contact && this.state.data.contact._id && this.state.data.contact._id.rootContactId) {
        const idToken = await firebase.auth().currentUser!.getIdToken();
        const serviceProxy = getServiceProxy(idToken);
        await serviceProxy.updateRootContact(this.state.data.contact._id.rootContactId, {
          operation: 'updateDetail',
          payload: {
            lmsStudentId: lmsUser.data._id,
          },
        });
      }
    }
  }

  addCombo = async (payload: any) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      if (this.state.data && this.state.data.productOrder && this.state.data.productOrder._id) {
        await serviceProxy.updateLeadProductOrder(this.state.data.productOrder._id, {
          operation: 'addCombo',
          payload,
        });
        message.success(translate('lang:createSuccess'), 1);
      } else {
        const result = await serviceProxy.createLeadProductOrder({
          leadId: this.state.data._id,
          courseCount: 0,
          courses: [],
        }) as any;
        this.changeInput({
          productOrder: {
            _id: result.id,
            courseCount: 0,
            courses: [],
          },
        });
        await serviceProxy.updateLeadProductOrder(result.id, {
          operation: 'addCombo',
          payload,
        });
        message.success(translate('lang:createSuccess'), 1);
      }
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  }

  removeCombo = async () => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      if (this.state.data && this.state.data.productOrder && this.state.data.productOrder._id) {
        await serviceProxy.updateLeadProductOrder(this.state.data.productOrder._id, {
          operation: 'removeCombo',
        });
        message.success(translate('lang:updateSuccess'), 1);
      } else {
        message.success(translate('lang:updateSuccess'), 1);
      }
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  }

  createPaymentTransaction = async (payload: any) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      await serviceProxy.createLeadPaymentTransaction({
        ...payload,
        leadId: this.state.data._id,
      });
      message.success(translate('lang:createSuccess'), 1);
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  }

  editPaymentTransaction = async (id: string, payload: any) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      await serviceProxy.updateLeadPaymentTransaction(id, {
        operation: 'updateDetail',
        payload,
      });
      message.success(translate('lang:updateSuccess'), 1);
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  }

  createNewNote = async (payload: any) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      await serviceProxy.createLeadNote({
        ...payload,
        leadId: this.props._id,
      });
      this.setState({
        notes: [...this.state.notes, payload],
      });
      message.success(translate('lang:createSuccess'), 1);
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  }

  findMapping = async (payload: string) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      return await serviceProxy.findMapping(payload, 'findByKey');
    } catch (_error) {
      return undefined;
    }
  }

  findRootContact = async (id: string) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      return await serviceProxy.findRootContactById(id);
    } catch (_error) {
      return undefined;
    }
  }

  manualUpdateRootContact = async (_id: string, payload: any) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      return await serviceProxy.updateRootContact(_id, {
        operation: 'manualSynchronize',
        payload,
      });
    } catch (_error) {
      return undefined;
    }
  }

  mergeRootContact = async (_id: string, payload: any) => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    try {
      return await serviceProxy.updateRootContact(_id, {
        operation: 'mergeRootContacts',
        payload,
      });
    } catch (error) {
      message.error(error.message || translate('lang:internalError'));
    }
  }

  render() {
    const unknownCourse = this.state.courses.filter((val: any) => val.shortName === 'UNK').length ?
      this.state.courses.filter((val: any) => val.shortName === 'UNK')[0]._id : undefined;
    return (
      <div style={{ background: '#f0f2f5' }} className='lead-detail-screen'>
        <Row gutter={30} style={{ display: 'flex', alignItems: 'flex-end' }}>
          <Col xs={16}>
            <Header data={this.state.data} />
          </Col>
          <Col xs={8} style={{ marginBottom: '10px' }}>
            <ContactBar data={this.state.data} id={this.props._id} />
          </Col>
        </Row>
        <Row gutter={30}>
          <Col xs={16}>
            <PersonalInfo data={this.state.data}
              changeInput={this.changeInput}
              findMapping={this.findMapping}
              updateContact={this.updateContact}
              updateRelation={this.updateRelation}
              updateRelationField={this.updateRelationField}
              rootContact={this.state.rootContact}
              findRootContact={this.findRootContact}
              manualUpdateRootContact={this.manualUpdateRootContact}
              mergeRootContact={this.mergeRootContact}
            />

            <LeadStage data={this.state.data} stages={this.state.stages} statuses={this.state.statuses} changeInput={this.changeInput} updateLead={this.updateLead} />

            <BorderWrapper style={{ marginTop: '24px' }}>
              <ProductOrder
                data={this.state.data}
                statuses={this.state.classStatuses}
                stages={this.state.classStages}
                transactions={this.state.transactions}
                courses={this.state.courses}
                updateCourse={this.updateCourse}
                changeInput={this.changeInput}
                checkComboConditionForCourse={this.checkComboConditionForCourse}
                checkComboCondition={this.checkComboCondition}
                deleteCourse={this.deleteCourse}
                addCourse={this.addCourse}
                addCombo={this.addCombo}
                removeCombo={this.removeCombo}
                syncClassLms={this.syncClassLms}
                unknownCourse={unknownCourse}
                tuitionAD={this.calculateTuitionAD()}
                classes={this.state.classes}
                combos={this.state.combos}
                updateRemainingAndTuitionAD={this.updateRemainingAndTuitionAD}
              />

              <TuitionInfo
                tuitionAD={this.calculateTuitionAD()}
                data={this.state.data}
                transactions={this.state.transactions}
                createPaymentTransaction={this.createPaymentTransaction}
                checkComboConditionForCourse={this.checkComboConditionForCourse}
                changeInput={this.changeInput}
                updateLead={this.updateLead}
                updateRemainingAndTuitionAD={this.updateRemainingAndTuitionAD}
                updateCourse={this.updateCourse}
                editPaymentTransaction={this.editPaymentTransaction}
                changeTransaction={this.changeTransaction}
                addTransaction={this.addTransaction}
              />
            </BorderWrapper>

            <LeadManagement data={this.state.data} id={this.props._id} users={this.state.users} centres={this.state.centres} salesmen={this.state.salesmen}
              updateLead={this.updateLead} changeInput={this.changeInput} authUser={this.props.authUser}
            />
          </Col>
          <Col xs={8}>
            <TaskList users={this.state.users as any} _id={this.props._id} />

            <AppointmentList users={this.state.users} id={this.props._id} />

            <NoteList notes={this.state.notes} createNewNote={this.createNewNote} />

            <AttachmentList id={this.props._id} />
          </Col>
        </Row>
      </div>
    );
  }
};

const mapState = (rootState: any) => {
  return {
    authUser: rootState.profileModel.authUser,
  };
};

const mapDispatch = (_rootReducer: any) => {
  return {};
};

const LeadDetailScreen = Authorize(withRematch(initStore, mapState, mapDispatch)(Screen), [PERMISSIONS.LEADS.VIEW], true, 'admin');

export {
  LeadDetailScreen,
};
