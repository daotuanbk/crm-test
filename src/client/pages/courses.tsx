import React from 'react';
import { CourseScreen } from '../modules/courses';
import { NextContext } from 'next';

interface Props {}
interface State {}
class CoursesPage extends React.Component<Props, State> {
  static async getInitialProps (_context: NextContext) {
    return {
      namespacesRequired: ['common'],
    };
  }

  render () {
    return (
      <CourseScreen />
    );
  }
}

export default (CoursesPage);
