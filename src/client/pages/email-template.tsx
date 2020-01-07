import React from 'react';
import { EmailTemplateScreen } from '../modules/email-template';
import { NextContext } from 'next';

interface Props {}
interface State {}
class EmailTemplatePage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <EmailTemplateScreen />
    );
  }
}

export default (EmailTemplatePage);
