import React from 'react';
import './SectionBox.less';

interface WrapperProps {}
interface WrapperState {}
export class SectionBox extends React.Component<WrapperProps, WrapperState> {
  render () {
    return (
      <div className='section-box'>
        {this.props.children}
      </div>
    );
  }
}
