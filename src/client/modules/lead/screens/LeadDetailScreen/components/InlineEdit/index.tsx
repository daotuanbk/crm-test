import React from 'react';
import { Icon, Row, Col } from 'antd';
import { CompareModal } from '../CompareModal';
import './styles.less';

interface State {
  editing: boolean;
  options: any;
  selectedOptions: any;
}

interface Props {
  value: string;
  field: string;
  additionalField?: string;
  additionalValue?: string;
  systemValue?: any;
  compareRootContact?: (payload: any, selected: any) => Promise<void>;
  onSave: (value: any) => Promise<void>;
}

export class InlineEdit extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);

    (this as any).setWrapperRef = (this as any).setWrapperRef.bind(this);
    (this as any).handleClickOutside = (this as any).handleClickOutside.bind(this);
  }

  state: State = {
    editing: false,
    options: [],
    selectedOptions: [],
  };

  componentDidMount() {
    this.setState({
      options: this.props.systemValue ? this.props.systemValue.constructor === Array ? this.props.systemValue : [this.props.systemValue] : [],
    });
  }

  setWrapperRef(node: any) {
    (this as any).wrapperRef = node;
  }

  handleClickOutside(event: any) {
    if ((this as any).wrapperRef && !(this as any).wrapperRef.contains(event.target)) {
      this.cancel();
    }
  }

  toggleEdit = (e: any) => {
    e.stopPropagation();
    if (this.state.editing) {
      this.cancel();
    } else {
      this.edit();
    }
  };

  edit = () => {
    this.setState({
      editing: true,
    }, () => {
      (this as any).domElm.focus();
    });
  };

  save = async () => {
    this.setState({
      editing: false,
    });
    if (this.props.onSave && this.isValueChanged()) {
      const obj = {} as any;
      obj[this.props.field] = (this as any).domElm.textContent;
      if (this.props.additionalField) {
        obj[this.props.additionalField] = this.props.additionalValue;
      }
      if (this.props.systemValue) {
        if (this.props.systemValue.constructor === Array) {
          if (this.props.systemValue.length) {
            if (this.props.systemValue.indexOf((this as any).domElm.textContent) >= 0) {
              await this.props.onSave(obj);
            } else {
              this.setState({
                options: [(this as any).domElm.textContent, ...this.props.systemValue],
                selectedOptions: [(this as any).domElm.textContent, ...this.props.systemValue],
              });
            }
          } else {
            await this.props.onSave(obj);
          }
        } else {
          if (this.props.systemValue !== (this as any).domElm.textContent) {
            this.setState({
              options: [(this as any).domElm.textContent, this.props.systemValue],
              selectedOptions: [(this as any).domElm.textContent, this.props.systemValue],
            });
          } else {
            await this.props.onSave(obj);
          }
        }
      } else {
        await this.props.onSave(obj);
      }
    } else {
      return;
    }
  };

  cancel = () => {
    this.setState({
      editing: false,
    });
  };

  reset = () => {
    (this as any).domElm.textContent = this.props.value;
    this.cancel();
  }

  isValueChanged = () => {
    return this.props.value !== (this as any).domElm.textContent;
  };

  handleKeyDown = async (e: any) => {
    const { key } = e;
    switch (key) {
      case 'Enter':
        await this.save();
        break;
      case 'Escape':
        this.reset();
        break;
    }
  };

  changeSelected = (payload: any) => {
    if (payload && payload.length) {
      this.setState({
        selectedOptions: payload,
      });
    }
  }

  onSubmit = async () => {
    const obj = {} as any;
    if (this.state.selectedOptions && this.state.selectedOptions.length) {
      if (this.props.field === 'contactBasicInfo.email' || this.props.field === 'contactBasicInfo.phone' || this.props.field === 'contactBasicInfo.fb') {
        if (this.state.selectedOptions.indexOf((this as any).domElm.textContent) >= 0) {
          obj[this.props.field] = (this as any).domElm.textContent;
        } else {
          obj[this.props.field] = this.state.selectedOptions[0];
          (this as any).domElm.textContent = this.state.selectedOptions[0];
        }
      } else {
        obj[this.props.field] = this.state.selectedOptions[0];
        (this as any).domElm.textContent = this.state.selectedOptions[0];
      }
    } else {
      obj[this.props.field] = (this as any).domElm.textContent;
    }
    if (this.props.additionalField) {
      obj[this.props.additionalField] = this.props.additionalValue;
    }
    await this.props.onSave({
      ...obj,
    });
    if (this.props.compareRootContact) {
      await this.props.compareRootContact(obj[this.props.field], {
        [this.props.field]: this.state.selectedOptions[0],
      });
    }
    this.setState({
      selectedOptions: [],
      options: [],
    });
  }

  onCancel = async () => {
    this.setState({
      selectedOptions: [],
      options: [],
    });
    const obj = {} as any;
    obj[this.props.field] = (this as any).domElm.textContent;
    if (this.props.additionalField) {
      obj[this.props.additionalField] = this.props.additionalValue;
    }
    await this.props.onSave(obj);
  }

  render() {
    const { editing } = this.state;
    return (
      <Row className='align-items-center'>
        <Col span={editing ? 18 : 24}>
          <div
            style={{ flex: 1, wordBreak: 'break-all', cursor: 'text', padding: '5px' }}
            className={editing ? 'editing inline-edit-div' : 'inline-edit-div'}
            onClick={this.toggleEdit}
            contentEditable={editing}
            ref={(domNode) => {
              (this as any).domElm = domNode;
            }}
            onKeyDown={this.handleKeyDown}
            {...this.props}
          >
            {this.props.value}
          </div>
        </Col>
        {
          (editing ? <Col span={5} className='has-flex-end has-small-left-margin'>
            <Icon type='check-circle' style={{ color: '#1890ff', fontSize: '18px', cursor: 'pointer' }} onClick={this.save} />
            <Icon type='close-circle' style={{ color: 'red', fontSize: '18px', marginLeft: '5px', cursor: 'pointer' }} onClick={this.reset} />
          </Col> : null)

        }
        <CompareModal visible={this.state.options && this.state.options.length >= 2}
          options={this.state.options}
          field={this.props.field}
          value={this.state.selectedOptions}
          onChange={this.changeSelected}
          onSubmit={this.onSubmit}
          onCancel={this.onCancel}
        />
      </Row>
    );
  }
}
