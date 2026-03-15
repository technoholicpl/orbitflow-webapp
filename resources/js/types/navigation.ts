import { CommonProps } from './common'

export interface NavigationTree {
    key: string
    path: string
    title: string
    translateKey?: string
    icon: string
    type?: 'title' | 'group' | 'item'
    authority?: string[]
    subMenu?: NavigationTree[]
}

export interface NavItem {
    title: string;
    url?: string;
    href?: string;
    icon?: any;
    isActive?: boolean;
    items?: NavItem[];
}

export interface BreadcrumbItem {
    title: string;
    href?: string;
}


