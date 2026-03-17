import type { ReactNode } from 'react';
import type { BreadcrumbItem } from '@/types/navigation';

export type CommonLayoutProps = {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
};
