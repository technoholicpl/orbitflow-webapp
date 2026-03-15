import {
    NAV_ITEM_TYPE_TITLE,
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE,
} from '@/constants/navigation.constant'

import type { NavigationTree } from '@/@types/navigation'

const adminNavigationConfig: NavigationTree[] = [
    {
        key: 'admin.dashboard',
        path: '/admin/dashboard',
        title: 'Dashboard',
        translateKey: 'nav.admin.dashboard',
        icon: 'dashboard',
        type: NAV_ITEM_TYPE_ITEM,
        authority: ['admin'],
        subMenu: [],
    },
    {
        key: 'admin.users',
        path: '/admin/users',
        title: 'Users',
        translateKey: 'nav.admin.users',
        icon: 'users',
        type: NAV_ITEM_TYPE_ITEM,
        authority: ['admin'],
        subMenu: [],
    },
    {
        key: 'admin.subscriptions',
        path: '/admin/subscriptions',
        title: 'Subscriptions',
        translateKey: 'nav.admin.subscriptions',
        icon: 'subscription',
        type: NAV_ITEM_TYPE_ITEM,
        authority: ['admin'],
        subMenu: [],
    },
    {
        key: 'admin.orders',
        path: '/admin/orders',
        title: 'Orders',
        translateKey: 'nav.admin.orders',
        icon: 'order',
        type: NAV_ITEM_TYPE_ITEM,
        authority: ['admin'],
        subMenu: [],
    },
    {
        key: 'admin.cms',
        path: '',
        title: 'CMS',
        translateKey: 'nav.admin.cms',
        icon: 'cms',
        type: NAV_ITEM_TYPE_TITLE,
        authority: ['admin'],
        subMenu: [
            {
                key: 'admin.cms.pages',
                path: '/admin/pages',
                title: 'Info Pages',
                translateKey: 'nav.admin.cms.pages',
                icon: 'pages',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['admin'],
                subMenu: [],
            },
            {
                key: 'admin.cms.blog',
                path: '/admin/blog',
                title: 'Blog',
                translateKey: 'nav.admin.cms.blog',
                icon: 'blog',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['admin'],
                subMenu: [],
            },
        ],
    },
]

const userNavigationConfig: NavigationTree[] = [
    {
        key: 'user.dashboard',
        path: '/dashboard',
        title: 'Dashboard',
        translateKey: 'nav.user.dashboard',
        icon: 'dashboard',
        type: NAV_ITEM_TYPE_ITEM,
        authority: ['user'],
        subMenu: [],
    },
     {
        key: 'user.projects',
        path: '',
        title: 'Projects',
        translateKey: 'nav.user.projects',
        icon: 'project',
        type: NAV_ITEM_TYPE_TITLE,
        authority: ['user'],
        subMenu: [
            {
                key: 'user.projects.list',
                path: '/projects',
                title: 'List View',
                translateKey: 'nav.user.projects.list',
                icon: 'list',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['user'],
                subMenu: [],
            },
            {
                key: 'user.projects.kanban',
                path: '/projects/kanban',
                title: 'Kanban',
                translateKey: 'nav.user.projects.kanban',
                icon: 'kanban',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['user'],
                subMenu: [],
            },
            {
                key: 'user.time-tracking',
                path: '/time-tracking',
                title: 'Time Tracking',
                translateKey: 'nav.user.time-tracking',
                icon: 'clock',
                type: NAV_ITEM_TYPE_ITEM,
                authority: ['user'],
                subMenu: [],
            },
        ],
    },
    {
        key: 'user.tasks',
        path: '/tasks',
        title: 'Tasks',
        translateKey: 'nav.user.tasks',
        icon: 'task',
        type: NAV_ITEM_TYPE_ITEM,
        authority: ['user'],
        subMenu: [],
    },
]

export { adminNavigationConfig, userNavigationConfig }

export default userNavigationConfig
