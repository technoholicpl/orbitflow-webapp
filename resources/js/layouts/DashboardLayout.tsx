import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import StackedSideNav from '@/components/template/StackedSideNav';
import Header from '@/components/template/Header';
import MobileNav from '@/components/template/MobileNav';
import UserProfileDropdown from '@/components/template/UserProfileDropdown';
import LayoutBase from '@/components/template/LayoutBase';
import useResponsive from '@/utils/hooks/useResponsive';
import { LAYOUT_STACKED_SIDE } from '@/constants/theme.constant';
import ConfigProvider from '@/components/ui/ConfigProvider';
import { themeConfig } from '@/configs/theme.config';
import { userNavigationConfig } from '@/configs/navigation.config';
import ModeSwitcher from '@/components/template/ThemeConfigurator/ModeSwitcher';
import GlobalQuickActions from '@/components/template/GlobalQuickActions';
import GlobalTimer from '@/components/GlobalTimer';
import NotificationDropdown from '@/components/template/NotificationDropdown';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
    const { larger, smaller } = useResponsive();
    const { auth } = usePage<{ auth: { user: any } }>().props;

    return (
        <ConfigProvider
            value={{
                ...themeConfig,
                mode: 'light',
                locale: 'en',
            }}
        >
            <LayoutBase
                type={LAYOUT_STACKED_SIDE}
                className="app-layout-stacked-side flex flex-auto flex-col"
            >
                <Head title={title} />
                <div className="flex flex-auto min-w-0">
                    {larger.lg && <StackedSideNav navigationTree={userNavigationConfig.items} />}
                    <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
                        <Header
                            className="shadow-sm dark:shadow-2xl"
                            headerStart={
                                <div className="flex items-center gap-4">
                                    {smaller.lg && <MobileNav />}
                                    {larger.lg && <GlobalTimer />}
                                </div>
                            }
                            headerEnd={
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <GlobalQuickActions />
                                    <NotificationDropdown />
                                    <ModeSwitcher />
                                    <UserProfileDropdown hoverable={false} />
                                </div>
                            }
                        />
                        <main className="h-full flex flex-auto flex-col p-6">
                            {smaller.lg && (
                                <div className="mb-4">
                                    <GlobalTimer />
                                </div>
                            )}
                            {children}
                        </main>
                    </div>
                </div>
            </LayoutBase>
        </ConfigProvider>
    );
}
