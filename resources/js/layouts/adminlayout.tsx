import { ReactNode } from 'react'
import { Head, usePage } from '@inertiajs/react'
import StackedSideNav from '@/components/template/StackedSideNav'
import Header from '@/components/template/Header'
import MobileNav from '@/components/template/MobileNav'
import UserProfileDropdown from '@/components/template/UserProfileDropdown'
import LayoutBase from '@/components/template/LayoutBase'
import useResponsive from '@/utils/hooks/useResponsive'
import { LAYOUT_STACKED_SIDE } from '@/constants/theme.constant'
import ConfigProvider from '@/components/ui/ConfigProvider'
import { themeConfig } from '@/configs/theme.config'
import { getAdminNavigationConfig } from '@/configs/navigation.config'
import ModeSwitcher from '@/components/template/ThemeConfigurator/ModeSwitcher'
import { PageProps } from '@inertiajs/core'

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
    const { auth, cp_prefix } = usePage<AuthProps>().props

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
                            navigationTree={getAdminNavigationConfig(cp_prefix)} 
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
