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
import { Search } from 'lucide-react';
import NotificationDropdown from '@/components/template/NotificationDropdown';
import TrialBanner from '@/components/TrialBanner';
import { toast, Notification } from '@/components/ui';
import CommandPalette from '@/components/template/CommandPalette';
import { useQuickActionsStore } from '@/store/quickActionsStore';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function DashboardLayout({ children, title = 'Dashboard' }: DashboardLayoutProps) {
    const { larger, smaller } = useResponsive();
    const { auth, flash } = usePage<any>().props;

    React.useEffect(() => {
        if (flash?.success) {
            toast.push(
                <Notification title="Informacja" type="success">
                    {flash.success}
                </Notification>
            );
        }
        if (flash?.error) {
            toast.push(
                <Notification title="Błąd" type="danger">
                    {flash.error}
                </Notification>
            );
        }
    }, [flash]);

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
                        <TrialBanner />
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
                                    <button 
                                        onClick={() => useQuickActionsStore.getState().toggleSearch()}
                                        className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all group"
                                    >
                                        <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Szukaj...</span>
                                        <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-white dark:bg-gray-900 px-1.5 font-mono text-[10px] font-medium text-gray-400">
                                            Ctrl+K
                                        </kbd>
                                    </button>
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
                <CommandPalette />
            </LayoutBase>
        </ConfigProvider>
    );
}
