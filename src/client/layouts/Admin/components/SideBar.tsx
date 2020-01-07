import React from 'react';
import { Layout, Menu, Icon } from 'antd';
import './SideBar.less';
import { withNamespaces } from '@client/i18n';
import { getMenuConfigs, checkPermission } from '@client/core';
import { withRematch, initStore, AuthUser } from '@client/store';

interface Props {
  menuCollapsed: boolean;
  menuWidth: number;
  collapsedWidth: number;
  menuTheme: 'dark'|'light';
  selectedMenuItem: string;
  openedSubMenu: string[];
  openSubMenuChange: (newOpenSubMenu: string[]) => void;
}
interface State {}
export class SideBarMenu extends React.Component<Props & {authUser: AuthUser}, State> {
  state: State = {
    selectedMenuItem: '',
    openedSubMenu: [],
  };

  openSubMenuChange = (openKeys: string[]) => {
    this.props.openSubMenuChange(openKeys);
  }

  render () {
    const translate = (this.props as any).t;
    const getMenuItem = (item: any) => {
      if (checkPermission(this.props.authUser, item.permission)) {
        return (
          <Menu.Item key={item.path}>
            <a href={item.path}>
              {item.icon ? <span><Icon type={item.icon} /></span> : <div></div>}<span>{translate(`lang:${item.name}`)}</span>
            </a>
          </Menu.Item>
        );
      }
      return;
    };

    const getSubMenus = (subMenu: any) => {
      let render = false;
      if (subMenu.permission && !checkPermission(this.props.authUser, subMenu.permission)) {
        render = false;
        return;
      }
      if (subMenu && subMenu.items) {
        for (const item of subMenu.items) {
          if (checkPermission(this.props.authUser, item.permission)) {
            render = true;
            break;
          }
        }
        if (render) {
          return (
            <Menu.SubMenu key={subMenu.name} title={<span><Icon type={subMenu.icon} /><span>{translate(`lang:${subMenu.name}`)}</span></span>}>
              {subMenu.items.map((item: any) => item.items && item.items.length ? getSubMenus(item) : getMenuItem(item))}
            </Menu.SubMenu>
          );
        }
        return;
      } else {
        return getMenuItem(subMenu);
      }
    };

    const menuProps: any = {};
    if (!this.props.menuCollapsed) {
      menuProps.openKeys = this.props.openedSubMenu;
    }
    return (
      <Layout.Sider
        trigger={null}
        collapsible={true}
        collapsed={this.props.menuCollapsed}
        breakpoint='lg'
        width={this.props.menuWidth}
        collapsedWidth={this.props.collapsedWidth}
        theme={this.props.menuTheme}
        className='sider'
      >
        <div className='logo' id='logo'>
            <a href='/users'>
              <img src='https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg' alt='logo' />
              <h1>Techkids Edu</h1>
            </a>
        </div>

        <Menu
          key='Menu'
          mode='inline'
          inlineCollapsed={this.props.menuCollapsed}
          theme={this.props.menuTheme}
          style={{ padding: '16px 0', width: '100%' }}
          className='sider'
          onOpenChange={(openKeys: any) => this.openSubMenuChange(openKeys.constructor === Array ? openKeys : [openKeys])}
          selectedKeys={[this.props.selectedMenuItem]}
          {...menuProps}
        >
          {getMenuConfigs().map((item) => getSubMenus(item))}
        </Menu>
      </Layout.Sider>
    );
  }
}

const mapState = (rootState: any) => {
  return {
    authUser: rootState.profileModel.authUser,
  };
};

const mapDispatch = (_rootReducer: any) => {
  return {};
};

const SideBar = withRematch<Props>(initStore, mapState, mapDispatch)(withNamespaces('lang')(SideBarMenu));

export {
  SideBar,
};
