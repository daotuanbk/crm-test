import React, { Component } from 'react';
import './styles.less';

export interface ToolbarButtonProps {
  icon: any;
}

export class ToolbarButton extends Component<ToolbarButtonProps> {
  render() {
    const { icon } = this.props;

    return (
      <i className={`toolbar-button ${icon}`} />
    );
  }
}
