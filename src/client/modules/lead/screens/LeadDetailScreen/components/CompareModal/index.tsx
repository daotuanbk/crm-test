import React from 'react';
import { Modal, Checkbox, Radio } from 'antd';
import { translate } from '@client/i18n';
import './styles.less';

interface State {}

interface Props {
  visible: boolean;
  field: string;
  options: any;
  value: any;
  onChange: (payload: any) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => Promise<void>;
}

export class CompareModal extends React.Component<Props, State> {
  render() {
    return (
      <Modal
        title={translate('lang:dataConflicting')}
        visible={this.props.visible}
        onOk={this.props.onSubmit}
        onCancel={this.props.onCancel}
      >
        <h3>{translate('lang:conflictDataNoti')}:</h3>
        {this.props.options &&
        this.props.options.length &&
        this.props.value &&
        this.props.value.length ? (
          this.props.field === 'contactBasicInfo.email' ||
          this.props.field === 'contactBasicInfo.phone' ||
          this.props.field === 'contactBasicInfo.fb' ? (
            <Checkbox.Group
              options={this.props.options}
              value={this.props.value}
              onChange={this.props.onChange}
            ></Checkbox.Group>
          ) : (
            <Radio.Group
              options={this.props.options}
              value={this.props.value[0]}
              onChange={(e) => this.props.onChange([e.target.value])}
            ></Radio.Group>
          )
        ) : (
          <div></div>
        )}
      </Modal>
    );
  }
}
