import { usePage } from '@inertiajs/react'
import classNames from 'classnames'
import { useState, Suspense, lazy } from 'react'
import NavToggle from '@/components/shared/NavToggle'
import Drawer from '@/components/ui/Drawer'
import appConfig from '@/configs/app.config'
import navigationConfig from '@/configs/navigation.config'
import { DIR_RTL } from '@/constants/theme.constant'
import { useRouteKeyStore } from '@/store/routeKeyStore'
import { useThemeStore } from '@/store/themeStore'
import type { User } from '@/types'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import type { WithHeaderItemProps } from '@/utils/hoc/withHeaderItem';

const VerticalMenuContent = lazy(
    () => import('@/components/template/VerticalMenuContent'),
)

type MobileNavToggleProps = {
    toggled?: boolean
}

type MobileNavProps = {
    translationSetup?: boolean
}

const MobileNavToggle = withHeaderItem<
    MobileNavToggleProps & WithHeaderItemProps
>(NavToggle)

const MobileNav = ({
    translationSetup = appConfig.activeNavTranslation,
}: MobileNavProps) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleOpenDrawer = () => {
        setIsOpen(true)
    }

    const handleDrawerClose = () => {
        setIsOpen(false)
    }

    const direction = useThemeStore((state) => state.direction)
    const currentRouteKey = useRouteKeyStore((state) => state.currentRouteKey)

    const { auth } = usePage<{ auth: { user: User } }>().props
    const userAuthority = auth?.user?.authority

    return (
        <>
            <div className="text-2xl" onClick={handleOpenDrawer}>
                <MobileNavToggle toggled={isOpen} />
            </div>
            <Drawer
                title="Navigation"
                isOpen={isOpen}
                bodyClass={classNames('p-0')}
                width={330}
                placement={direction === DIR_RTL ? 'right' : 'left'}
                onClose={handleDrawerClose}
                onRequestClose={handleDrawerClose}
            >
                <Suspense fallback={<></>}>
                    {isOpen && (
                        <VerticalMenuContent
                            collapsed={false}
                            navigationTree={navigationConfig.items}
                            routeKey={currentRouteKey}
                            userAuthority={userAuthority as string[]}
                            direction={direction}
                            translationSetup={translationSetup}
                            onMenuItemClick={handleDrawerClose}
                        />
                    )}
                </Suspense>
            </Drawer>
        </>
    )
}

export default MobileNav
