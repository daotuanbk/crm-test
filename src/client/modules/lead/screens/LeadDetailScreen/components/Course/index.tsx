import React from 'react';
import { Icon, Row, Col, Popconfirm, message, Popover } from 'antd';
import { SectionBox } from '@client/components';
import { ProgressClassBox } from '../ProgressClassBox';
import TextArea from 'antd/lib/input/TextArea';
import { translate } from '@client/i18n';
import './styles.less';

interface State {
  display: boolean;
}

interface Props {
  data: any;
  statuses: any;
  stages: any;
  arrangedAt: any;
  centre: any;
  changeStatus: (payload: any, id: string) => Promise<void>;
  changeStage: (payload: any, id: string, sendAutoMail?: boolean) => Promise<void>;
  changePropStage: (payload: any, id: string) => void;
  changeArrangedAt: (payload: any, id: string) => Promise<void>;
  openEditModal: () => void;
  openClassModal: () => void;
  deleteCourse: (index: string) => Promise<void>;
}

export class Course extends React.Component<Props, State> {
  state: State = {
    display: true,
  };

  toggleDisplay = () => {
    this.setState({
      display: !this.state.display,
    });
  }

  render () {
    return (
      <SectionBox key={this.props.data._id}>
        <div style={{margin: '24px 0px'}}>
          <Row>
            <Col xs={12}>
              <h3>{translate('lang:course')} {this.props.data.shortName ? this.props.data.shortName : ''}</h3>
            </Col>
            <Col xs={12} style={{display: 'flex', justifyContent: 'flex-end'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', width: '50%'}}>
                <Icon type='edit' className='hover-icon' onClick={() => {
                  if (this.props.data.class || this.props.data.classId) {
                    message.error(translate('lang:cannotEditCourseAssignedClass'), 3);
                  }
                  else {
                    this.props.openEditModal();
                  }
                }} style={{color: '#aaa', fontSize: '18px', cursor: 'pointer'}}></Icon>
                <Popconfirm title={translate('lang:deleteCourseConfirm')} onConfirm={() => {
                  if (this.props.data.class) {
                    message.error(translate('lang:cannotDeleteCourseAssignedClass'), 3);
                  } else if (this.props.data.tuition) {
                    message.error(translate('lang:cannotDeleteTuitionCourse'), 3);
                  } else {
                    this.props.deleteCourse(this.props.data.index);
                  }
                }}>
                  <Icon type='delete' className='hover-icon' style={{color: '#aaa', fontSize: '18px', cursor: 'pointer'}}></Icon>
                </Popconfirm>
                <Icon type='lock' style={{color: '#aaa', fontSize: '18px', cursor: 'pointer'}}></Icon>
                <Icon className='hover-icon' type={this.state.display ? 'up-square' : 'down-square'} style={{color: '#aaa', fontSize: '18px', cursor: 'pointer'}} onClick={this.toggleDisplay}></Icon>
              </div>
            </Col>
            { this.state.display ?
              <Col xs={24}>
                <div>
                  <h4>{translate('lang:admissionProgress')}</h4>
                  <ProgressClassBox
                    arrangedAt={this.props.arrangedAt}
                    stages={this.props.stages}
                    statuses={this.props.statuses}
                    stage={this.props.data.stage}
                    status={this.props.data.status}
                    centre={this.props.centre}
                    changeArrangedAt={(payload: any) => this.props.changeArrangedAt(payload, this.props.data.index)}
                    changeStatus={(payload: any) => this.props.changeStatus(payload, this.props.data.index)}
                    changeStage={(payload: any, sendAutoMail?: boolean) => this.props.changeStage(payload, this.props.data.index, sendAutoMail)}
                    changePropStage={(payload: any) => this.props.changePropStage(payload, this.props.data.index)}
                  />
                </div>
                <Row>
                  <Col xs={12} style={{marginTop: '10px'}}>
                    <h4>{translate('lang:interviewerComment')}</h4>
                  </Col>
                  <Col xs={12} style={{display: 'flex', justifyContent: 'flex-end', marginTop: '10px'}}>
                    <Popover
                        overlayStyle={{width: '600px'}}
                        placement='bottom'
                        title={this.props.data.name}
                        content={<TextArea
                            value={this.props.data.comment}
                            autosize={{ minRows: 4, maxRows: 15 }}
                            placeholder='Comment' />}>
                      <span style={{overflow: 'hidden'}}>{this.props.data.comment}</span>
                    </Popover>
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} style={{marginTop: '10px'}}>
                    <h4>{translate('lang:enrolledClass')}</h4>
                  </Col>
                  <Col xs={12} style={{display: 'flex', justifyContent: 'flex-end', marginTop: '10px'}}>
                    <h4><a>{this.props.data.class ? this.props.data.class : <span className='text-red'>{translate('lang:notSelectedYet')}</span>}
                      <Icon type='edit' style={{fontSize: '16px', cursor: 'pointer', color: '#1890ff', marginLeft: '5px'}} onClick={this.props.openClassModal}></Icon>
                    </a></h4>
                  </Col>
                </Row>
              </Col> : <div></div>
            }
          </Row>
        </div>
      </SectionBox>
    );
  }
}
