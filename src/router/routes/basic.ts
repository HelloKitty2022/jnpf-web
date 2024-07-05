import type { AppRouteRecordRaw } from '/@/router/types';
import { t } from '/@/hooks/web/useI18n';
import { REDIRECT_NAME, LAYOUT, EXCEPTION_COMPONENT, PAGE_NOT_FOUND_NAME } from '/@/router/constant';

// 404 on a page
export const PAGE_NOT_FOUND_ROUTE: AppRouteRecordRaw = {
  path: '/:path(.*)*',
  name: PAGE_NOT_FOUND_NAME,
  component: LAYOUT,
  meta: {
    title: 'ErrorPage',
    hideBreadcrumb: true,
    hideMenu: true,
  },
  children: [
    {
      path: '/:path(.*)*',
      name: PAGE_NOT_FOUND_NAME,
      component: EXCEPTION_COMPONENT,
      meta: {
        title: '',
        hideBreadcrumb: true,
        hideMenu: true,
      },
    },
  ],
};

export const REDIRECT_ROUTE: AppRouteRecordRaw = {
  path: '/redirect',
  component: LAYOUT,
  name: 'RedirectTo',
  meta: {
    title: REDIRECT_NAME,
    hideBreadcrumb: true,
    hideMenu: true,
  },
  children: [
    {
      path: '/redirect/:path(.*)/:_redirect_type(.*)/:_origin_params(.*)?',
      name: REDIRECT_NAME,
      component: () => import('/@/views/basic/redirect/index.vue'),
      meta: {
        title: REDIRECT_NAME,
        hideBreadcrumb: true,
      },
    },
  ],
};

export const ERROR_LOG_ROUTE: AppRouteRecordRaw = {
  path: '/error-log',
  name: 'ErrorLog',
  component: LAYOUT,
  redirect: '/error-log/list',
  meta: {
    title: 'ErrorLog',
    hideBreadcrumb: true,
    hideChildrenInMenu: true,
  },
  children: [
    {
      path: 'list',
      name: 'ErrorLogList',
      component: () => import('/@/views/basic/error-log/index.vue'),
      meta: {
        title: t('routes.basic.errorLogList'),
        hideBreadcrumb: true,
        currentActiveMenu: '/error-log',
      },
    },
  ],
};
export const COMMON_ROUTE: AppRouteRecordRaw = {
  path: '/common-route',
  name: 'commonRoute',
  component: LAYOUT,
  redirect: '/home',
  meta: {
    title: 'commonRoute',
    hideBreadcrumb: true,
    hideChildrenInMenu: true,
  },
  children: [
    {
      path: '/home',
      component: () => import('/@/views/basic/home/index.vue'),
      name: 'home',
      meta: {
        title: 'routes.basic.home',
        defaultTitle: '首页',
        icon: 'icon-ym icon-ym-nav-home',
        affix: true,
      },
    },
    {
      path: '/messageRecord',
      component: () => import('/@/views/basic/messageRecord/index.vue'),
      name: 'messageRecord',
      meta: {
        title: 'routes.basic.messageRecord',
        defaultTitle: '站内消息',
        icon: 'icon-ym icon-ym-sysNotice',
      },
    },
    {
      path: '/profile',
      component: () => import('/@/views/basic/profile/index.vue'),
      name: 'profile',
      meta: {
        title: 'routes.basic.profile',
        defaultTitle: '个人信息',
        icon: 'icon-ym icon-ym-user',
      },
    },
    {
      path: '/externalLink',
      component: () => import('/@/views/common/externalLink/index.vue'),
      name: 'externalLink',
      meta: {
        title: 'routes.basic.externalLink',
        defaultTitle: '链接',
        icon: 'icon-ym icon-ym-generator-link',
      },
    },
    {
      path: '/workFlowDetail',
      component: () => import('/@/views/workFlow/workFlowDetail/index.vue'),
      name: 'workFlowDetail',
      meta: {
        title: 'routes.basic.workFlowDetail',
        defaultTitle: '流程详情',
        icon: 'icon-ym icon-ym-workFlow',
      },
    },
    {
      path: '/emailDetail',
      component: () => import('/@/views/extend/email/DetailPage.vue'),
      name: 'emailDetail',
      meta: {
        title: 'routes.basic.emailDetail',
        defaultTitle: '查看邮件',
        icon: 'icon-ym icon-ym-emailExample',
      },
    },
    {
      path: '/previewModel',
      component: () => import('/@/views/common/dynamicModel/index.vue'),
      name: 'previewModel',
      meta: {
        title: 'routes.basic.previewModel',
        defaultTitle: '功能预览',
        icon: 'icon-ym icon-ym-btn-preview',
      },
    },
  ],
};
