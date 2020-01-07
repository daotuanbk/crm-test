import React from 'react';
import { EmailTemplateConfigScreen } from '../modules/email-template';
import { NextContext } from 'next';

interface Props {}
interface State {}
class EmailTemplateConfigPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <EmailTemplateConfigScreen />
    );
  }
}

export default (EmailTemplateConfigPage);
