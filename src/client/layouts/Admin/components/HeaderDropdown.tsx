import React from 'react';
import { Dropdown, Menu, Icon, Avatar } from 'antd';
import './HeaderDropdown.less';
import firebase from 'firebase/app';
import 'firebase/auth';
import { initializeFirebaseApp } from '@client/core';
import { AuthUser, withRematch, initStore } from '@client/store';
import Cookies from 'js-cookie';

const logOut = () => {
  initializeFirebaseApp();
  firebase.auth().signOut();
  localStorage.clear();
  Cookies.remove('isNct');
  window.location.href = '/auth/logout';
};

const menu = (
  <Menu className='dropdownMenu' selectedKeys={[]}>
    <Menu.Item key='userinfo' disabled={true}>
      <Icon type='setting' />
      <span>Account Settings</span>
    </Menu.Item>
    <Menu.Item key='triggerError' disabled={true}>
      <Icon type='close-circle' />
      <span>Report Errors</span>
    </Menu.Item>
    <Menu.Divider />
    <Menu.Item key='logout'>
      <a onClick={logOut}>
        <Icon type='logout' />&nbsp; <span>Log Out</span>
      </a>
    </Menu.Item>
  </Menu>
);

interface Props {
  authUser: AuthUser;
}
const DropdownMenu = (props: Props) => {
  const avatarUrl = props.authUser ? props.authUser.avatarUrl || 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png' : '';

  return (
    <Dropdown overlayClassName='headerDropdown' overlay={menu}>
      <span className={`action account`}>
        <Avatar
          size='small'
          className='avatar'
          src={avatarUrl}
          alt='avatar'
        />
        <span className='name'>{props.authUser ? props.authUser.fullName || props.authUser.email : ''}</span>
      </span>
    </Dropdown>
  );
};

const mapState = (rootState: any) => {
  return {
    authUser: rootState.profileModel.authUser,
  };
};

const mapDispatch = (_rootReducer: any) => {
  return {};
};

const HeaderDropdown = withRematch(initStore, mapState, mapDispatch)(DropdownMenu);

export {
  HeaderDropdown,
};
