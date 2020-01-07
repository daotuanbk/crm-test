import React from 'react';
import { BorderWrapper, SectionBox } from '@client/components';
import { Row, Col, Icon, Upload, Spin, message } from 'antd';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { config } from '@client/config';
import { LeadAttachment } from '@client/services/service-proxies';
import { timeAgo } from '@client/core/';
import { translate } from '@client/i18n';
import './styles.less';

interface State {
  data: any[];
  before: any;
  after: any;
  sortBy: string;
  pageSize: number;
  loading: boolean;
  fileList: any[];
  isShowing: boolean;
}

interface Props {
  id: string;
}
export class AttachmentList extends React.Component<Props, State> {
  state: State = {
    data: [],
    before: undefined,
    after: undefined,
    sortBy: 'createdAt|des',
    pageSize: 10,
    loading: true,
    fileList: [],
    isShowing: true,
  };

  async componentDidMount() {
    const serviceProxy = await this.getServiceProxy();
    const attachments = await serviceProxy.findLeadAttachments(
      'getByLeadOrContactId',
      JSON.stringify({
        leadId: this.props.id,
        contactId: this.props.id,
      }),
      undefined,
      undefined,
      undefined,
      'createdAt|des',
      undefined,
      undefined,
    );
    const nextState: any = {
      loading: false,
    };
    if (attachments && attachments.data) {
      nextState.data = attachments.data;
    }
    this.setState(nextState);
  }

  getServiceProxy = async () => {
    const idToken = await firebase.auth().currentUser!.getIdToken();
    return getServiceProxy(idToken);
  };

  handleUploadChange = async ({ file, fileList }: any) => {
    this.setState({ fileList: [...fileList] });
    if (file.status !== 'uploading') {
      const nextState = { fileList: [] } as any;
      try {
        const serviceProxy = await this.getServiceProxy();
        const attachment = {
          leadId: this.props.id,
          contactId: this.props.id,
          url: file.response,
        };
        const result = await serviceProxy.createLeadAttachment(attachment) as any;
        const newAttachment = await serviceProxy.findLeadAttachmentById(result && result.id);
        nextState.data = [
          newAttachment,
          ...this.state.data,
        ];
      } catch (e) {
        message.error(e.response || translate('lang:internalError'));
      }
      this.setState(nextState);
    }
  }

  renderAttachments = () => {
    const { data, loading, isShowing } = this.state;

    if (!isShowing) return null;

    if (loading) {
      return <div style={{ height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin /></div>;
    }

    const sortedData = data.sort((a: any, b: any) => {
      return b.createdAt - a.createdAt;
    });

    if (!sortedData || !sortedData.length) return null;

    return (
      <SectionBox>
        {
          sortedData.map((item: LeadAttachment) => {
            return (
              <Row>
                <div style={{ padding: '15px 0px 0px 0px', overflow: 'hidden' }}>
                  <Col xs={3}>
                    <Icon type='file' style={{ fontSize: '40px' }} />
                  </Col>
                  <Col xs={21}>
                    <a href={`${config.url.main}/temp/attachment/${item.url}`} target='_blank'>{item.title}</a>
                    <br/>
                    <span>{`${item.createdBy && (item.createdBy as any).fullName || 'Admin'}, ${timeAgo((item as any).createdAt)}`}</span>
                  </Col>
                </div>
              </Row>
            );
          })
        }
      </SectionBox>
    );
  };

  render() {
    const uploadProps = {
      action: `${config.url.api}/upload-attachment`,
      onChange: this.handleUploadChange,
      multiple: true,
      name: 'attachment',
    };
    const { isShowing, data } = this.state;

    return (
      <React.Fragment>
        <div style={{ marginTop: '24px' }}>
          <BorderWrapper>
            <Row>
              <Col xs={12}>
                <h3>{translate('lang:attachments')}</h3>
              </Col>
              <Col xs={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '50%' }}>
                  <span style={{ marginRight: '10px' }}>{data.length || 0}</span>
                  <Icon
                    type={`${isShowing ? 'up-square' : 'down-square'}`}
                    onClick={() => {
                      this.setState({
                        isShowing: !isShowing,
                      });
                    }}
                    style={{ color: '#aaa', fontSize: '18px', cursor: 'pointer' }} />
                </div>
              </Col>
              <Col xs={12} offset={12} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                <Upload {...uploadProps} fileList={this.state.fileList}>
                  <a >{translate('lang:addFile')}</a>
                </Upload>
              </Col>
            </Row>
            <Row>
              {
                this.renderAttachments()
              }
            </Row>
            <Row>
            </Row>
          </BorderWrapper>
        </div>
      </React.Fragment>
    );
  }
}
