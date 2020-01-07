import React from 'react';
import { SingleSelectWithSearch } from '@client/components';
import firebase from 'firebase';
import { getServiceProxy } from '@client/services';
import { notification } from 'antd';
import _ from 'lodash';

interface Course {
  _id: string;
  shortName: string;
}

interface Props {
  style: any;
  onChange: (value: any) => any;
}

interface State {
  courses: Course[];
  loading: boolean;
}

const searchCourse = async (courseName: string) => {
  const idToken = await firebase.auth().currentUser!.getIdToken();
  const serviceProxy = getServiceProxy(idToken);
  try {
    const response = await serviceProxy.findProductCourse(
      undefined,
      courseName,
      undefined,
      10,
      'name|asc',
      undefined,
      undefined,
    );

    return response.data;
  } catch (err) {
    notification.error({
      message: 'Error searching course',
      description: err.toString(),
      placement: 'bottomRight',
    });
    return [];
  }
};

export class ProductFilter extends React.Component<Props, State> {
  state: State = {
    courses: [],
    loading: false,
  };

  searchCourseAndUpdateOptions = async (searchString: string) => {
    this.setState({ loading: true });
    const courses = await searchCourse(searchString);
    this.setState({
      courses,
      loading: false,
    });
  }

  componentDidMount = async () => {
    await this.searchCourseAndUpdateOptions('');
  }

  render() {
    const { style, onChange, ...restProps } = this.props;
    const { courses, loading } = this.state;
    const options = courses.map((course: Course) => ({
      display: course.shortName,
      value: course._id,
    }));
    const resetOptionsBeforeHandleOnChange = (value: any) => {
      onChange(value);
    };
    return (
      <SingleSelectWithSearch
        {...restProps}
        label='Product'
        placeholder='Search here'
        options={options}
        loading={loading}
        onChange={resetOptionsBeforeHandleOnChange}
        onSearch={this.searchCourseAndUpdateOptions}
        style={style}
      />
    );
  }
}
