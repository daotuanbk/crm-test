import React from 'react';
import { LmsCourseScreen } from '../modules/lms-courses';
import { NextContext } from 'next';

interface Props {}
interface State {}
class LmsCousesPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <LmsCourseScreen />
    );
  }
}

export default (LmsCousesPage);
