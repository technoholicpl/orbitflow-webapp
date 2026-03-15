import DashboardLayout from '@/layouts/DashboardLayout';
import type { AppLayoutProps } from '@/types';

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <DashboardLayout {...props}>
        {children}
    </DashboardLayout>
);

