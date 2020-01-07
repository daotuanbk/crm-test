import React from 'react';
import { Spin } from 'antd';
import { initializeFirebaseApp, getMenuConfigs } from '@client/core';
import firebase from 'firebase/app';
import 'firebase/auth';
import { i18n } from '@client/i18n';
import Router from 'next/router';
import { getOrCreateStore, initStore } from '@client/store';
import { AdminLayout } from '@client/layouts';
import { config } from '@client/config';
import { getServiceProxy } from '@client/services';
import './Authorize.less';

interface AuthorizeProps {}

interface AuthorizeState {
  isAuthenticated?: boolean;
  isAuthorized?: boolean;
  openedSubMenu: string[];
  selectedMenuItem: string;
  currentLanguage: string;
}

export const Authorize = (Component: any, permission: any, authenticationRequired?: boolean, layoutName?: string) => {
  return (props: any) => {
    class AuthorizeComponent extends React.Component<AuthorizeProps, AuthorizeState> {
      state: AuthorizeState = {
        isAuthenticated: undefined,
        isAuthorized: undefined,
        openedSubMenu: [''],
        selectedMenuItem: '',
        currentLanguage: '',
      };

      renderAdminLayout = () => {
        return (
          <div>
            {(this.state.isAuthenticated && this.state.isAuthorized) || !authenticationRequired ? (
              <AdminLayout
                openedSubMenu={this.state.openedSubMenu as any}
                selectedMenuItem={this.state.selectedMenuItem}
                currentLanguage={this.state.currentLanguage}
              >
                <Component {...props} />
              </AdminLayout>
            ) : null}
          </div>
        );
      };

      componentDidMount () {
        initializeFirebaseApp();
        firebase.auth().onAuthStateChanged(async (user) => {
          if (!user) {
            this.setState({
              isAuthenticated: false,
            });
          } else {
            const idTokenInfo = await user.getIdTokenResult();
            const token = await user.getIdToken();
            const serviceProxy = getServiceProxy(token);
            const permissions = await serviceProxy.getPermissions(idTokenInfo.claims.user_id);
            const userInfo = await serviceProxy.findUserById(idTokenInfo.claims.user_id);
            let isAuthorized = false;
            if (!permission || permission.length === 0) {
              isAuthorized = true;
            } else if (permission && permission.length && permissions.data) {
              const filterPermission = permission.filter((val: string) => {
                return permissions.data.indexOf(val) === -1;
              });

              if (filterPermission && filterPermission.length) {
                isAuthorized = false;
              } else {
                isAuthorized = true;
              }
            }

            if (isAuthorized) {
              const authUser = {
                id: idTokenInfo.claims.user_id,
                email: idTokenInfo.claims.email,
                fullName: idTokenInfo.claims.name,
                avatarUrl: idTokenInfo.claims.avatarUrl,
                roles: userInfo && userInfo.roles ? userInfo.roles.map((val: any) => val._id) : idTokenInfo.claims.roles,
                permissions: permissions.data || [],
                centreId: userInfo && userInfo.centreId ? userInfo.centreId : undefined,
              };
              getOrCreateStore(initStore, {}).dispatch.profileModel.updateProfileInfo(authUser);

              const pathname = window.location.pathname;
              let openedSubMenu = [] as string[];
              getMenuConfigs().map((subMenu: any) => {
                if (subMenu.items) {
                  subMenu.items.map((item: any) => {
                    if (item.items && item.items.length) {
                      item.items.map((subSubMenu: any) => {
                        if (subSubMenu.path === pathname) {
                          openedSubMenu = [subMenu.name, item.name];
                        }
                      });
                    } else {
                      if (item.path === pathname) {
                        openedSubMenu = [subMenu.name];
                      }
                    }
                  });
                } else {
                  if (subMenu.path === pathname) {
                    openedSubMenu = [subMenu.name];
                  }
                }
              });

              this.setState({
                isAuthenticated: true,
                isAuthorized,
                openedSubMenu,
                selectedMenuItem: pathname,
                currentLanguage: i18n.i18n.language || config.i18n.defaultLang,
              });
            } else {
              this.setState({
                isAuthenticated: true,
                isAuthorized,
              });
            }
          }
        });
      }

      render () {
        if (this.state.isAuthenticated === undefined && this.state.isAuthorized === undefined) {
          return (
            <div className='loader'>
              <Spin spinning={true} />
            </div>
          );
        }

        if (this.state.isAuthenticated === false) {
          if (authenticationRequired) {
            Router.push('/auth/login');
          }
        }

        if (this.state.isAuthorized === false) {
          Router.push('/_error');
        }

        switch (layoutName) {
          case 'admin':
            return this.renderAdminLayout();
          default:
            return this.renderAdminLayout();
        }
      }
    }

    return <AuthorizeComponent />;
  };
};
