import React from 'react';
import './DashboardScreen.less';
import { Authorize } from '@client/components';

interface State {
  //
}

interface Props {
}

export const DashboardScreen = Authorize(class extends React.Component<Props, State> {
  state: State = {
    //
  };

  render() {
    return (
      <div className='dashboard-screen'>
        <div className='root-dashboard'>
          <div className='wrapper-introduction'>
            <div className='title-intro'>Welcome to CRM</div>
            <div>
              <img className='image-logo' src='/static/images/logo.png' />
            </div>
          </div>
        </div>
      </div>
    );
  }
}, [], true, 'admin');
