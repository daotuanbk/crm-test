import React from 'react';
import { BorderWrapper } from '@client/components';
import { Radio, Row, Col, Input, DatePicker, Icon, Upload, Modal, Form, message } from 'antd';
import { validateField } from '@client/core';
import { config } from '@app/config';
import axios, { AxiosResponse } from 'axios';
import { translate } from '@client/i18n';
const RadioGroup = Radio.Group;

interface State {
  previewVisible: boolean;
  previewImage: string;
  isUploading: boolean;
}
interface Props {
  context: any;
  data: any;
  changeInput: (payload: any) => void;
  validateSchema: any;
}
export class CustomerProfile extends React.Component<Props, State> {
  state: State = {
    previewVisible: false,
    previewImage: '',
    isUploading: false,
  };

  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = (file: any) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  handleChange = (obj: any) => {
    const fileExtensionRegex = /\.(gif|jpg|jpeg|tiff|png|JPG|PNG|JPEG|GIF|TIFF)$/;
    const filterFileList = obj.fileList.filter((val: any) => {
      return !fileExtensionRegex.test(val.name);
    });
    this.props.changeInput({ fileList: obj.fileList });
    if (filterFileList.length) {
      message.error(translate('lang:validateImageExtension'), 5);
    }
  }

  beforeUpload = (file: any) => {
    const fileExtensionRegex = /\.(gif|jpg|jpeg|tiff|png|JPG|PNG|JPEG|GIF|TIFF)$/;
    let allowedUpload = true;
    if (!fileExtensionRegex.test(file.name)) {
      allowedUpload = false;
    }
    if (!allowedUpload) {
      // message.error('Ảnh không quá 2MB và chỉ nhận các định dạng PNG, JPG, JPEG.', 5);
    } else {
      this.uploadImage(file);
    }
    return false;
  }

  uploadImage = async (image: any) => {
    const formData = new FormData();
    formData.append('image', image.originFileObj ? image.originFileObj : image);

    try {
      await this.setState({
        isUploading: true,
      });
      const result: AxiosResponse = await axios({
        method: 'post',
        url: `${config.web.api.prefix}/upload-image`,
        data: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      this.props.changeInput({
        avatar: {
          uid: image.uid,
          url: result.data,
        },
      });
      this.setState({
        isUploading: false,
      });
    } catch (error) {
      message.error(translate('lang:internalError'), 4);
      this.setState({
        isUploading: false,
      });
      // tslint:disable-next-line
      console.log(error);
    }
  }

  render() {
    const { previewVisible, previewImage } = this.state;
    const uploadButton = (
      <div>
        <Icon type='plus' />
        <div className='ant-upload-text'>Upload</div>
      </div>
    );
    return (
      <div className='wrapper-custom-profile'>
        <h3>{translate('lang:customerProfile')}</h3>
        <BorderWrapper>
          <Row gutter={20} type='flex'>
            <Col xs={24} className='default-margin'>
              <div>{translate('lang:roles')} <span style={{ color: 'red' }}>*</span></div>
              <RadioGroup onChange={(e) => {
                this.props.context.setFieldError('userType', '');
                this.props.context.setFieldValue('userType', e.target.value);
                this.props.changeInput({ userType: e.target.value });
              }} value={this.props.data.userType}>
                <Radio value={'student'}>{translate('lang:student')}</Radio>
                <Radio value={'parent'}>{translate('lang:parent')}</Radio>
              </RadioGroup>
              <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.userType ? 'error' : undefined} help={this.props.context.errors.userType}>
                <Input style={{ display: 'none' }} />
              </Form.Item>
            </Col>
            <Col xs={12} className='default-margin'>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.firstName ? 'error' : undefined} help={this.props.context.errors.firstName}>
                  <div>{translate('lang:firstName')} <span style={{ color: 'red' }}>*</span></div>
                  <Input type='text' value={this.props.data.firstName} onChange={(e) => {
                    this.props.context.setFieldValue('firstName', e.target.value);
                    this.props.changeInput({ firstName: e.target.value });
                  }}
                    onBlur={() => validateField({
                      fieldName: 'firstName',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  ></Input>
                </Form.Item>
              </div>
            </Col>
            <Col xs={12} className='default-margin'>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.lastName ? 'error' : undefined} help={this.props.context.errors.lastName}>
                  <div>{translate('lang:lastName')} <span style={{ color: 'red' }}>*</span></div>
                  <Input type='text' value={this.props.data.lastName} onChange={(e) => {
                    this.props.context.setFieldValue('lastName', e.target.value);
                    this.props.changeInput({ lastName: e.target.value });
                  }}
                    onBlur={() => validateField({
                      fieldName: 'lastName',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  ></Input>
                </Form.Item>
              </div>
            </Col>
            <Col xs={12} className='default-margin'>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.dob ? 'error' : undefined} help={this.props.context.errors.dob}>
                  <div>{translate('lang:dateOfBirth')}</div>
                  <DatePicker style={{ width: '100%' }} onChange={(date) => {
                    this.props.context.setFieldValue('dob', date);
                    this.props.changeInput({ dob: date });
                  }} />
                </Form.Item>
              </div>
            </Col>
            <Col xs={12} className='default-margin'>
              <div>
                <Form.Item style={{ marginBottom: '0px' }}>
                  <div>{translate('lang:gender')}</div>
                  <RadioGroup onChange={(e) => {
                    this.props.context.setFieldValue('gender', e.target.value);
                    this.props.changeInput({ gender: e.target.value });
                  }} value={this.props.data.gender}>
                    <Radio value={'male'}>{translate('lang:male')}</Radio>
                    <Radio value={'female'}>{translate('lang:female')}</Radio>
                  </RadioGroup>
                </Form.Item>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.gender ? 'error' : undefined} help={this.props.context.errors.gender}>
                  <Input style={{ display: 'none' }} />
                </Form.Item>
              </div>
            </Col>
            {
              this.props.data.userType === 'student' ?
                <div style={{ width: '100%' }}>
                  <Col xs={12} className='default-margin'>
                    <div>
                      <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.schoolName ? 'error' : undefined} help={this.props.context.errors.schoolName}>
                        <div>{translate('lang:schoolName')}</div>
                        <Input type='text' value={this.props.data.schoolName} onChange={(e) => {
                          this.props.context.setFieldValue('schoolName', e.target.value);
                          this.props.changeInput({ schoolName: e.target.value });
                        }}
                          onBlur={() => validateField({
                            fieldName: 'schoolName',
                            validateSchema: this.props.validateSchema,
                            context: this.props.context,
                          })}
                        ></Input>
                      </Form.Item>
                    </div>
                  </Col>
                  <Col xs={12} className='default-margin'>
                    <div>
                      <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.majorGrade ? 'error' : undefined} help={this.props.context.errors.majorGrade}>
                        <div>{translate('lang:grade')}</div>
                        <Input type='text' value={this.props.data.majorGrade} onChange={(e) => {
                          this.props.context.setFieldValue('majorGrade', e.target.value);
                          this.props.changeInput({ majorGrade: e.target.value });
                        }}
                          onBlur={() => validateField({
                            fieldName: 'majorGrade',
                            validateSchema: this.props.validateSchema,
                            context: this.props.context,
                          })}
                        ></Input>
                      </Form.Item>
                    </div>
                  </Col>
                </div> : <div></div>
            }
            <Col xs={12} className='default-margin'>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.email ? 'error' : undefined} help={this.props.context.errors.email}>
                  <div>{translate('lang:email')}</div>
                  <Input type='text'
                    value={this.props.data.email}
                    onChange={(e) => {
                      this.props.context.setFieldValue('email', e.target.value);
                      this.props.changeInput({ email: e.target.value });
                    }}
                    onBlur={() => validateField({
                      fieldName: 'email',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  ></Input>
                </Form.Item>
              </div>
            </Col>
            <Col xs={12} className='default-margin'>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.phone ? 'error' : undefined} help={this.props.context.errors.phone}>
                  <div>{translate('lang:phone')}</div>
                  <Input type='text'
                    value={this.props.data.phone}
                    onChange={(e) => {
                      this.props.context.setFieldValue('phone', e.target.value);
                      this.props.changeInput({ phone: e.target.value });
                    }}
                    onBlur={() => validateField({
                      fieldName: 'phone',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  ></Input>
                </Form.Item>
              </div>
            </Col>
            <Col xs={12} className='default-margin'>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.fb ? 'error' : undefined} help={this.props.context.errors.fb}>
                  <div>{translate('lang:fbLink')}</div>
                  <Input type='text'
                    value={this.props.data.fb}
                    onChange={(e) => {
                      this.props.context.setFieldValue('fb', e.target.value);
                      this.props.changeInput({ fb: e.target.value });
                    }}
                    onBlur={() => validateField({
                      fieldName: 'fb',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  ></Input>
                </Form.Item>
              </div>
            </Col>
            <Col xs={12} className='default-margin'>
              <div>
                <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.address ? 'error' : undefined} help={this.props.context.errors.address}>
                  <div>{translate('lang:address')}</div>
                  <Input type='text'
                    value={this.props.data.address}
                    onChange={(e) => {
                      this.props.context.setFieldValue('address', e.target.value);
                      this.props.changeInput({ address: e.target.value });
                    }}
                    onBlur={() => validateField({
                      fieldName: 'address',
                      validateSchema: this.props.validateSchema,
                      context: this.props.context,
                    })}
                  ></Input>
                </Form.Item>
              </div>
            </Col>
            <Col xs={12}>
              <div>
                <div style={{ marginBottom: 3 }}>{translate('lang:avatar')}</div>
                <Upload
                  beforeUpload={this.beforeUpload}
                  listType='picture-card'
                  fileList={this.props.data.fileList}
                  onPreview={this.handlePreview}
                  onChange={this.handleChange}
                >
                  {this.props.data.fileList.length >= 1 ? null : uploadButton}
                </Upload>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                  <img alt='example' style={{ width: '100%' }} src={previewImage} />
                </Modal>
              </div>
            </Col>
            {
              this.props.data.userType === 'parent' ?
                <Col xs={12} className='default-margin'>
                  <div>
                    <Form.Item style={{ marginBottom: '0px' }} validateStatus={this.props.context.errors.job ? 'error' : undefined} help={this.props.context.errors.job}>
                      <div>{translate('lang:job')}</div>
                      <Input type='text'
                        value={this.props.data.job}
                        onChange={(e) => {
                          this.props.context.setFieldValue('job', e.target.value);
                          this.props.changeInput({ job: e.target.value });
                        }}
                        onBlur={() => validateField({
                          fieldName: 'job',
                          validateSchema: this.props.validateSchema,
                          context: this.props.context,
                        })}
                      ></Input>
                    </Form.Item>
                  </div>
                </Col> : <div></div>
            }
          </Row>
        </BorderWrapper>
      </div>
    );
  }
}
