import React, { Component } from 'react';
import './styles.less';

export interface ToolbarProps {
  title: any;
  leftItems: any;
  rightItems: any;
  onNewMessage: () => void;
}

export class Toolbar extends Component<ToolbarProps> {
  render() {
    const { title, leftItems, rightItems } = this.props;

    return (
      <div className='toolbar'>
        <div className='left-items'>{leftItems}</div>
        <h1 className='toolbar-title'>{title}</h1>
        <div onClick={() => this.props.onNewMessage()} className='right-items'>{rightItems}</div>
      </div>
    );
  }
}
