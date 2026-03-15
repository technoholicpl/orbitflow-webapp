import { useState, ReactNode } from 'react'
import { usePage } from '@inertiajs/react'
import StackedSideNav from './stackedsidenav'
import useResponsive from '@/hooks/useResponsive'
import type { NavigationTree } from '@/types/navigation'
import { Dropdown, Button, Avatar, ConfigProvider } from '@/components/ui'
import { UserMenuContent } from '@/components/user-menu-content'
import LayoutBase from '@/components/template/LayoutBase'
import { LAYOUT_STACKED_SIDE } from '@/constants/theme.constant'
import { themeConfig } from '@/configs/theme.config'

interface StackedLayoutProps {
    children: ReactNode
    navigationConfig?: NavigationTree[]
}

const StackedLayout = ({ children, navigationConfig }: StackedLayoutProps) => {
    const { larger } = useResponsive()
    const { auth } = usePage().props as any

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
                className="app-layout-stacked-side flex flex-auto flex-col min-h-screen"
            >
                <div className="flex flex-auto min-w-0">
                    {larger.lg && <StackedSideNav navigationConfig={navigationConfig} />}
                    <div className="flex flex-col flex-auto min-h-screen min-w-0 relative w-full">
                        <header className="h-16 border-b bg-white dark:bg-gray-900 flex items-center px-4 justify-between sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                 {/* Mobile Nav Trigger will go here */}
                            </div>
                            <div className="flex items-center gap-4">
                                <Dropdown 
                                    renderTitle={
                                        <Button
                                            variant="plain"
                                            className="size-10 rounded-full p-1"
                                        >
                                            <Avatar 
                                                src={auth.user.avatar} 
                                                shape="circle" 
                                                size={32}
                                            >
                                                {auth.user.name.substring(0, 2).toUpperCase()}
                                            </Avatar>
                                        </Button>
                                    }
                                >
                                    <Dropdown.Item variant="custom" className="p-0">
                                        <UserMenuContent user={auth.user} />
                                    </Dropdown.Item>
                                </Dropdown>
                            </div>
                        </header>
                        <main className="h-full flex flex-auto flex-col p-4">
                            {children}
                        </main>
                    </div>
                </div>
            </LayoutBase>
        </ConfigProvider>
    )
}

export default StackedLayout





