import React from 'react';
import { BorderWrapper } from '@client/components';
import { Row, Col, Icon, Input } from 'antd';
import { translate } from '@client/i18n';
import moment from 'moment';
import './styles.less';

interface State {
  display: boolean;
  newNote: string;
}

interface Props {
  notes: any;
  createNewNote: (payload: any) => Promise<void>;
}

export class NoteList extends React.Component<Props, State> {
  state: State = {
    display: true,
    newNote: '',
  };

  toggleDisplay = () => {
    this.setState({
      display: !this.state.display,
    });
  }

  createNewNote = async () => {
    if (this.state.newNote) {
      await this.props.createNewNote({
        content: this.state.newNote,
      });
      this.setState({
        newNote: '',
      });
    }
  }

  render () {
    return (
      <BorderWrapper style={{marginTop: '24px'}}>
        <div>
          <Row>
            <Col xs={12}>
              <h3>{translate('lang:notes')}</h3>
            </Col>
            <Col xs={12} style={{display: 'flex', justifyContent: 'flex-end'}}>
              <div style={{display: 'flex', justifyContent: 'flex-end', width: '50%'}}>
                <span style={{marginRight: '10px'}}>{this.props.notes.length || 0}</span>
                <Icon onClick={this.toggleDisplay} type={this.state.display ? 'up-square' : 'down-square'} style={{color: '#aaa', fontSize: '18px', cursor: 'pointer'}}></Icon>
              </div>
            </Col>
            {
              this.state.display ?
              <Col xs={24}>
                {
                  this.props.notes.map((val: any, index: number) => {
                    return <h4 key={index}>{moment(val.createdAt).format('HH:mm, DD/MM/YYYY')}: {val.content}</h4>;
                  })
                }
                <Input placeholder={translate('lang:enterNewNote')} value={this.state.newNote} onChange={(e) => this.setState({newNote: e.target.value})} onPressEnter={this.createNewNote}/>
              </Col> : <div></div>
            }
          </Row>
        </div>
      </BorderWrapper>
    );
  }
}
