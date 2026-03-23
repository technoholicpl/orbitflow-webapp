import type { PageProps } from '@inertiajs/core'
import { Head, usePage } from '@inertiajs/react'
import type { ReactNode } from 'react'
import Header from '@/components/template/Header'
import LayoutBase from '@/components/template/LayoutBase'
import MobileNav from '@/components/template/MobileNav'
import StackedSideNav from '@/components/template/StackedSideNav'
import ModeSwitcher from '@/components/template/ThemeConfigurator/ModeSwitcher'
import UserProfileDropdown from '@/components/template/UserProfileDropdown'
import ConfigProvider from '@/components/ui/ConfigProvider'
import { getAdminNavigationConfig } from '@/configs/navigation.config'
import { themeConfig } from '@/configs/theme.config'
import { LAYOUT_STACKED_SIDE } from '@/constants/theme.constant'
import useResponsive from '@/utils/hooks/useResponsive'

interface AuthProps extends PageProps {
    auth: { user: any };
    cp_prefix: string;
}

interface AdminLayoutProps {
    children: ReactNode
    title?: string
}

const AdminLayout = ({ children, title = 'Admin Panel' }: AdminLayoutProps) => {
    const { larger, smaller } = useResponsive()
    const { cp_prefix } = usePage<AuthProps>().props

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
                    {larger.lg && (
                        <StackedSideNav 
                            navigationTree={getAdminNavigationConfig(cp_prefix).items} 
                        />
                    )}
                    <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
                        <Header
                            className="shadow-sm dark:shadow-2xl"
                            headerStart={<>{smaller.lg && <MobileNav />}</>}
                            headerEnd={
                                <div className="flex items-center gap-4">
                                    <ModeSwitcher />
                                    <UserProfileDropdown hoverable={false} />
                                </div>
                            }
                        />
                        <main className="h-full flex flex-auto flex-col p-6">
                            {children}
                        </main>
                    </div>
                </div>
            </LayoutBase>
        </ConfigProvider>
    )
}

export default AdminLayout
