import React from 'react';
import './AuthLayout.less';
import { initializeFirebaseApp, hasSignInOption } from '@client/core';
import { Divider } from 'antd';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase/app';
import 'firebase/auth';
import { FooterLink } from './components/FooterLink';
import { getServiceProxy } from '@client/services';
import { ForgotPasswordModal } from './components/ForgotPasswordModal';

interface Props {
  pageName: 'login' | 'register';
}
interface State {
  clientOnly: boolean;
  forgotPasswordModal: boolean;
}

export class AuthLayout extends React.Component<Props, State> {
  uiConfig: any;

  constructor(props: any) {
    super(props);
    this.state = {
      clientOnly: false,
      forgotPasswordModal: false,
    };
  }

  componentDidMount = () => {
    const signInOptions = [];
    if (hasSignInOption('facebook')) {
      signInOptions.push(firebase.auth.FacebookAuthProvider.PROVIDER_ID);
    }
    if (hasSignInOption('google')) {
      signInOptions.push(firebase.auth.GoogleAuthProvider.PROVIDER_ID);
    }
    this.uiConfig = {
      signInFlow: 'popup',
      signInOptions,
      callbacks: {
        signInSuccessWithAuthResult: (
          _authResult: any,
          _redirectUrl?: string,
        ) => {
          (async () => {
            // create mongodb record
            const [serviceProxy, idToken] = await Promise.all([
              getServiceProxy(),
              firebase.auth().currentUser!.getIdToken(true),
            ]);
            await serviceProxy.registerUser({idToken});

            const form = document.getElementById('form');
            const input = document.createElement('input');
            input.type = 'text';
            input.name = 'token';
            input.value = idToken;
            form!.appendChild(input);
            (form as any).submit();
          })();
          return false;
        },
        signInFailure: async (error: any) => {
          // tslint:disable-next-line:no-console
          console.log(error);
        },
      },
    };

    initializeFirebaseApp();
    this.setState({
      clientOnly: true,
    });
  }

  closeForgotPassword = () => {
    this.setState({
      forgotPasswordModal: false,
    });
  }

  openForgotPassword = () => {
    this.setState({
      forgotPasswordModal: true,
    });
  }

  render() {
    return (
      <div className='auth-container'>
        <div className='form-wrapper'>
          <div className='logo'>
            <span>Techkids Software</span>
          </div>

          {this.props.children}

          <Divider dashed={true} />

          {this.state.clientOnly && <StyledFirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()} className='oauth-container' />}

          <FooterLink pageName={this.props.pageName} openForgotPassword={this.openForgotPassword} />

          <ForgotPasswordModal visible={this.state.forgotPasswordModal} onCancel={this.closeForgotPassword} />
        </div>
      </div>
    );
  }
}
