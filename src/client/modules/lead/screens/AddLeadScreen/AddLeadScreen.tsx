import React from 'react';
import './AddLeadScreen.less';
import { Button, Form, message, Row, Col } from 'antd';
import { Authorize } from '@client/components';
import { CustomerProfile, ProductOrder, LeadManagement, Relation } from './index';
import { PERMISSIONS } from '@common/permissions';
import { Formik, FormikContext } from 'formik';
import { Centre, SystemConfig, ProductCourse, ProductCombo } from '@app/crm';
import { User } from '@app/auth';
import firebase from 'firebase/app';
import { getServiceProxy } from '../../../../services';
import * as yup from 'yup';
import Router from 'next/router';
import uuid from 'uuid';
import { AuthUser, withRematch, initStore } from '@client/store';
import { translate } from '@client/i18n';

interface Course {
  index: string;
  courseId: string | undefined;
  discountType: string | undefined;
  discountValue: number | undefined;
  showDiscount: boolean | undefined;
}
interface State {
  userType: string | undefined;
  gender: string | undefined;
  fileList: any;
  firstName: string | undefined;
  lastName: string | undefined;
  dob: Date | string | undefined;
  email: string | undefined;
  phone: string | undefined;
  fb: string | undefined;
  avatar: string | undefined;
  address: string | undefined;
  owner: string | undefined;
  centre: string | undefined;
  job: string | undefined;
  currentStage: string | undefined;
  currentStatus: string | undefined;
  courses: Course[];
  combo: string | undefined;
  unknownCourse: string | undefined;
  centres: Centre[];
  stages: SystemConfig[];
  statuses: SystemConfig[];
  productCourses: ProductCourse[];
  combos: ProductCombo[];
  salesmen: User[];
  relationName: string | undefined;
  relationEmail: string | undefined;
  relationPhone: string | undefined;
  relationType: string | undefined;
  relationDob: string | undefined;
  relationSocial: string | undefined;
  relationJob: string | undefined;
  schoolName: string | undefined;
  majorGrade: string | undefined;
  headerFixed: boolean;
}
interface Props {
  authUser: AuthUser;
}

const Screen = class extends React.Component<Props, State> {
  state: State = {
    userType: 'student',
    gender: undefined,
    fileList: [],
    firstName: undefined,
    lastName: undefined,
    dob: undefined,
    email: undefined,
    phone: undefined,
    fb: undefined,
    avatar: undefined,
    address: undefined,
    owner: undefined,
    centre: undefined,
    job: undefined,
    currentStage: 'New',
    currentStatus: undefined,
    productCourses: [],
    combos: [],
    salesmen: [],
    stages: [],
    statuses: [],
    courses: [],
    centres: [],
    combo: undefined,
    unknownCourse: undefined,
    relationName: undefined,
    relationEmail: undefined,
    relationPhone: undefined,
    relationType: undefined,
    relationDob: undefined,
    relationSocial: undefined,
    relationJob: undefined,
    headerFixed: false,
    schoolName: undefined,
    majorGrade: undefined,
  };

  async componentDidMount() {
    let centre;
    let owner;
    if (this.props.authUser && this.props.authUser.permissions &&
      (this.props.authUser.permissions.indexOf(PERMISSIONS.ROLES.GENERALMANAGER) >= 0 || this.props.authUser.permissions.indexOf(PERMISSIONS.ROLES.SALESMAN) >= 0)
      && this.props.authUser.permissions.indexOf(PERMISSIONS.ROLES.ADMIN) < 0) {
      centre = this.props.authUser.centreId;
      owner = this.props.authUser.id;
    }
    const idToken = await firebase.auth().currentUser!.getIdToken();
    const serviceProxy = getServiceProxy(idToken);
    const centres = await serviceProxy.getAllCentres();
    const stages = await serviceProxy.findSystemConfigs('getAllStages', undefined, undefined, undefined, undefined, undefined, undefined) as any;
    const statuses = await serviceProxy.findSystemConfigs('getAllStatuses', undefined, undefined, undefined, undefined, undefined, undefined) as any;
    const productCourses = await serviceProxy.findProductCourse('getAllRecords', undefined, undefined, undefined, undefined, undefined, undefined) as any;
    const combos = await serviceProxy.findProductCombo('getAllRecords', undefined, undefined, undefined, undefined, undefined, undefined) as any;
    const salesmen = await serviceProxy.getAllSalesman() as any;
    const fetchedCourses = productCourses && productCourses.data ? productCourses.data : [];
    const unknownCourse = fetchedCourses.filter((val: ProductCourse) => val.shortName === 'UNK').length ?
      fetchedCourses.filter((val: ProductCourse) => val.shortName === 'UNK')[0]._id : undefined;
    const initialCourse = {
      index: uuid.v4(),
      courseId: fetchedCourses.filter((val: ProductCourse) => val && val.shortName === 'UNK').length ?
        fetchedCourses.filter((val: ProductCourse) => val && val.shortName === 'UNK')[0]._id : undefined,
      discountType: 'PERCENT',
      discountValue: 0,
      showDiscount: false,
    };
    this.setState({
      centres: centres.data,
      statuses: statuses.data,
      stages: stages.data,
      productCourses: productCourses.data,
      combos: combos.data,
      salesmen: salesmen.data,
      unknownCourse,
      courses: [initialCourse],
      centre,
      owner,
    });

    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  handleScroll = (event: any) => {
    const scrollTop = event.target.documentElement.scrollTop;
    if (scrollTop > 90 && !this.state.headerFixed) {
      this.setState({ headerFixed: true });
    } else if (scrollTop < 90) {
      this.setState({ headerFixed: false });
    }
  }

  changeInput = (payload: any) => {
    this.setState(payload);
  }

  calculateTuitionBD = () => {
    if (this.state.courses && this.state.courses.length) {
      return this.state.courses.reduce((sum: number, val: Course) => {
        const tuition = this.state.productCourses.filter((v: ProductCourse) => v._id === val.courseId).length ?
          this.state.productCourses.filter((v: ProductCourse) => v._id === val.courseId)[0].tuitionBeforeDiscount : 0;
        return sum + Number(tuition);
      }, 0);
    } else {
      return 0;
    }
  }

  calculateTuitionAD = () => {
    const filterCombo = this.state.combos.filter((val: ProductCombo) => val._id === this.state.combo);
    let combo: ProductCombo | undefined;
    if (filterCombo && filterCombo.length) {
      combo = filterCombo[0];
    }
    if (this.state.courses && this.state.courses.length) {
      if (combo && combo.discountType === 'FIXED' && this.checkComboCondition()) {
        const totalAdditionalDiscount = this.state.courses.reduce((sum: number, val: Course, _index: number) => {
          const tuition = this.state.productCourses.filter((v: ProductCourse) => v._id === val.courseId).length ?
            this.state.productCourses.filter((v: ProductCourse) => v._id === val.courseId)[0].tuitionBeforeDiscount : 0;
          const discount = val.discountValue ?
            (val.discountType === 'PERCENT' ?
              (Number(tuition) * Number(val.discountValue) / 100) :
              Number(val.discountValue))
            : 0;
          return sum + discount;
        }, 0);
        return Number(combo.discountValue) - Number(totalAdditionalDiscount) > 0 ? Number(combo.discountValue) - Number(totalAdditionalDiscount) : 0;
      } else {
        const tuitionFees = this.state.courses.reduce((sum: number, val: Course, index: number) => {
          const tuition = this.state.productCourses.filter((v: ProductCourse) => v._id === val.courseId).length ?
            this.state.productCourses.filter((v: ProductCourse) => v._id === val.courseId)[0].tuitionBeforeDiscount : 0;
          const discount = val.discountValue ?
            (val.discountType === 'PERCENT' ?
              (Number(tuition) * Number(val.discountValue) / 100) :
              Number(val.discountValue))
            : 0;
          const comboDiscount = this.checkComboConditionForCourse(index) === 'PERCENT' ? (Number(tuition) * Number(combo ? combo.discountValue : 0) / 100) : 0;
          return sum + ((Number(tuition) - Number(discount) - Number(comboDiscount)) > 0 ? Number(tuition) - Number(discount) - Number(comboDiscount) : 0);
        }, 0);
        if (combo && combo.discountType === 'AMOUNT' && this.checkComboCondition()) {
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

  changeCombo = (payload: string) => {
    if (payload) {
      const filterCombo = this.state.combos.filter((val: ProductCombo) => val._id === payload);
      if (filterCombo && filterCombo.length) {
        const combo = filterCombo[0];
        this.setState({ combo: payload });
        if (combo.field === 'courseCount') {
          const conditionValue = (combo.condition === 'eq') ? combo.conditionValue : (combo.conditionValue + 1);
          if (this.state.courses.length >= conditionValue) {
            return;
          } else {
            const courseNeeded = conditionValue - this.state.courses.length;
            const courses = Array.apply(null, { length: courseNeeded } as any).map((_val: any) => {
              return {
                index: uuid.v4(),
                courseId: this.state.unknownCourse || undefined,
                discountType: 'PERCENT',
                discountValue: 0,
                showDiscount: false,
              };
            });
            this.setState({ courses: [...this.state.courses, ...courses] });
          }
        }
      }
    } else {
      this.setState({ combo: payload });
    }
  }

  checkComboCondition = () => {
    if (!this.state.combo) {
      return false;
    } else {
      const filterCombo = this.state.combos.filter((val: ProductCombo) => val._id === this.state.combo);
      const courses = this.state.courses.filter((val: any) => {
        return val.courseId;
      });
      const realCourse = courses.filter((val: any) => val.courseId !== this.state.unknownCourse);
      if (filterCombo && filterCombo.length) {
        const combo = filterCombo[0];
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
      } else {
        return false;
      }
    }
  }

  checkComboConditionForCourse = (courseIndex: number) => {
    if (!this.state.combo) {
      return 'NONE';
    } else {
      const filterCombo = this.state.combos.filter((val: ProductCombo) => val._id === this.state.combo);
      if (filterCombo && filterCombo.length) {
        const combo = filterCombo[0];
        if (combo.field === 'courseCount') {
          if (combo.condition === 'gte') {
            if (this.state.courses.length >= combo.conditionValue) {
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
            if (this.state.courses.length > combo.conditionValue) {
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
            if (this.state.courses.length >= combo.conditionValue) {
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
      } else {
        return 'NONE';
      }
    }
  }

  submit = async () => {
    const stateObj = {
      userType: this.state.userType,
      gender: this.state.gender,
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      dob: this.state.dob,
      email: this.state.email,
      phone: this.state.phone,
      fb: this.state.fb,
      avatar: this.state.avatar,
      address: this.state.address,
      owner: this.state.owner,
      centre: this.state.centre,
      job: this.state.job,
      currentStage: this.state.currentStage,
      currentStatus: this.state.currentStatus,
      combo: this.state.combo,
      relationName: this.state.relationName,
      relationEmail: this.state.relationEmail,
      relationPhone: this.state.relationPhone,
      relationType: this.state.relationType,
      relationDob: this.state.relationDob,
      relationSocial: this.state.relationSocial,
      relationJob: this.state.relationJob,
      schoolName: this.state.schoolName,
      majorGrade: this.state.majorGrade,
      courses: this.state.courses,
    };

    try {
      const idToken = await firebase.auth().currentUser!.getIdToken();
      const serviceProxy = getServiceProxy(idToken);
      const courses = this.state.courses.filter((val: any) => {
        return val.courseId && val.courseId !== this.state.unknownCourse;
      });
      if (courses.length) {
        if (this.state.combo) {
          if (this.checkComboCondition()) {
            await serviceProxy.createLead({
              ...stateObj,
              fileList: [],
              tuition: {
                totalAfterDiscount: this.calculateTuitionAD(),
                remaining: this.calculateTuitionAD(),
              },
            });
            message.success(translate('lang:createSuccess'), 5);
            Router.push('/leads');
          } else {
            message.error(translate('lang:coursesDoNotMeetCondition'), 5);
          }
        } else {
          await serviceProxy.createLead({
            ...stateObj,
            fileList: [],
            tuition: {
              totalAfterDiscount: this.calculateTuitionAD(),
              remaining: this.calculateTuitionAD(),
            },
          });
          message.success(translate('lang:createSuccess'), 4);
          Router.push('/leads');
        }
      } else {
        await serviceProxy.createLead({
          ...stateObj,
          fileList: [],
          tuition: {
            totalAfterDiscount: this.calculateTuitionAD(),
            remaining: this.calculateTuitionAD(),
          },
        });
        message.success('Lead created successfully!', 5);
        Router.push('/leads');
      }
    } catch (error) {
      message.error(error.message, 4);
    }
  }

  render() {
    const validateSchema = {
      userType: yup.string()
        .required(translate('lang:validateUserType')),
      firstName: yup.string().max(50, translate('lang:validateTooLong'))
        // tslint:disable-next-line
        .matches(/[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]$/, translate('lang:validateNameValid'))
        .required(translate('lang:validateFirstNameRequired')),
      lastName: yup.string().max(50, translate('lang:validateTooLong'))
        // tslint:disable-next-line
        .matches(/[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]$/, translate('lang:validateNameValid'))
        .required(translate('lang:validateLastNameRequired')),
      email: yup.string().email(translate('lang:validateEmail')),
      phone: yup.string().matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im, translate('lang:validatePhoneValid')),
      fb: yup.string(),
      address: yup.string(),
      owner: yup.string(),
      centre: yup.string(),
      job: yup.string(),
      relationName: yup.string().max(50, translate('lang:validateTooLong')).matches(/[a-zA-Z ]$/, translate('lang:validateNameValid')),
      relationEmail: yup.string().email('Please enter a valid email'),
      relationPhone: yup.string().matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im, translate('lang:validatePhoneValid')),
      relationType: yup.string(),
      relationDob: yup.string(),
      relationJob: yup.string(),
      relationSocial: yup.string(),
      schoolName: yup.string(),
      majorGrade: yup.string(),
      currentStage: yup.string().required(translate('lang:validateStageRequired')),
      currentStatus: yup.string(),
    };

    const LeadValidateSchema = yup.object().shape(validateSchema as any);

    const initialValues = {
      userType: this.state.userType,
      gender: this.state.gender,
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      phone: this.state.phone,
      fb: this.state.fb,
      address: this.state.address,
      relationName: this.state.relationName,
      relationDob: this.state.relationDob,
      relationEmail: this.state.relationEmail,
      relationPhone: this.state.relationPhone,
      relationType: this.state.relationType,
      relationSocial: this.state.relationSocial,
      relationJob: this.state.relationJob,
      schoolName: this.state.schoolName,
      majorGrade: this.state.majorGrade,
      owner: this.state.owner,
      centre: this.state.centre,
      job: this.state.job,
      currentStage: this.state.currentStage,
      currentStatus: this.state.currentStatus,
      courses: this.state.courses,
    };

    return (
      <div>
        <Formik
          initialValues={initialValues}
          validateOnChange={false}
          validationSchema={LeadValidateSchema}
          validate={(_values) => {
            const errors: any = {};
            if (_values.currentStage === 'New') {
              //
            } else {
              if (!_values.currentStatus) {
                errors.currentStatus = translate('lang:validateStatusRequired');
              }
            }
            return errors;
          }}
          onSubmit={async (_values, formikBag) => {
            await this.submit();
            formikBag.resetForm({});
          }}
        >
          {(context: FormikContext<any>) => (
            <Form>
              <Row style={{ display: 'flex', alignItems: 'center' }}>
                <Col span={12} >
                  <h2 style={{ marginBottom: 0 }}>{translate('lang:addNewLead')}</h2>
                </Col>
                <Col span={12}>
                  <div className={this.state.headerFixed ? 'fixed-header-container' : ''} style={{
                    width: '100%', padding: 10, display: 'flex',
                    justifyContent: 'flex-end', zIndex: 3,
                  }}>
                    <Button style={{ marginRight: '15px' }} onClick={() => Router.push('/leads')}>{translate('lang:discard')}</Button>
                    <Button type='primary' onClick={async () => {
                      try {
                        const validateResult = await context.validateForm();
                        if ((validateResult && !Object.keys(validateResult).length) || !validateResult) {
                          this.submit();
                        }
                      } catch (error) {
                        //
                      }
                    }}>{translate('lang:save')}</Button>
                  </div>
                </Col>
              </Row>
              <CustomerProfile context={context} data={this.state} changeInput={this.changeInput} validateSchema={LeadValidateSchema} />
              {/* <Contact context={context} data={this.state} changeInput={this.changeInput} validateSchema={LeadValidateSchema}/> */}
              <Relation context={context} data={this.state} changeInput={this.changeInput} validateSchema={LeadValidateSchema} />
              <ProductOrder context={context} data={this.state} changeInput={this.changeInput} validateSchema={LeadValidateSchema}
                courses={this.state.productCourses} combos={this.state.combos}
                calculateTuitionAD={this.calculateTuitionAD} calculateTuitionBD={this.calculateTuitionBD}
                changeCombo={this.changeCombo} unknownCourse={this.state.unknownCourse} />
              <LeadManagement context={context} data={this.state} changeInput={this.changeInput} validateSchema={LeadValidateSchema}
                centres={this.state.centres} salesmen={this.state.salesmen} stages={this.state.stages} statuses={this.state.statuses} />
            </Form>
          )}
        </Formik>
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

const AddLeadScreen = Authorize(withRematch(initStore, mapState, mapDispatch)(Screen), [PERMISSIONS.LEADS.CREATE], true, 'admin');
export {
  AddLeadScreen,
};
