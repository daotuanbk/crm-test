import React from 'react';
import { initializeFirebaseApp } from '@client/core';

export class Page extends React.Component {
  componentDidMount = () => {
    initializeFirebaseApp();
  }

  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}
