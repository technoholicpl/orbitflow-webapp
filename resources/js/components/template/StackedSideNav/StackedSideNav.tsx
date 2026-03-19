import { usePage } from '@inertiajs/react'
import { useState } from 'react'
import {
    SPLITTED_SIDE_NAV_MINI_WIDTH,
    STACKED_SIDE_NAV_SECONDARY_WIDTH,
    DIR_LTR,
    DIR_RTL,
} from '@/constants/theme.constant'
import StackedSideNavMini, { SelectedMenuItem } from './StackedSideNavMini'
import StackedSideNavSecondary from './StackedSideNavSecondary'
import useResponsive from '@/utils/hooks/useResponsive'
import { useThemeStore } from '@/store/themeStore'
import { useRouteKeyStore } from '@/store/routeKeyStore'
import { getAdminNavigationConfig, userNavigationConfig } from '@/configs/navigation.config'
import appConfig from '@/configs/app.config'
import type { User } from '@/types'
import isEmpty from 'lodash/isEmpty'
import useTranslation from '@/utils/hooks/useTranslation'
import type { TranslationFn } from '@/types/common'
import { NavigationTree } from '@/types/navigation'
import { PageProps } from '@inertiajs/core'

interface AuthProps extends PageProps {
    auth: { user: User };
    cp_prefix: string;
    isAdmin: boolean;
}

const stackedSideNavDefaultStyle = {
    width: SPLITTED_SIDE_NAV_MINI_WIDTH,
}

const StackedSideNav = ({
    translationSetup = appConfig.activeNavTranslation,
    navigationTree: manualNavigationTree,
}: {
    translationSetup?: boolean
    navigationTree?: NavigationTree[]
}) => {
    const { props } = usePage<AuthProps>()
    const { auth, cp_prefix, isAdmin } = props
    
    const navConfig = isAdmin ? getAdminNavigationConfig(cp_prefix) : userNavigationConfig
    const navigationTree = manualNavigationTree || navConfig.items
    const userAuthority = auth?.user?.authority

    const { t } = useTranslation(!translationSetup)

    const [selectedMenu, setSelectedMenu] = useState<SelectedMenuItem>({})
    const [activeKeys, setActiveKeys] = useState<string[]>([])

    const mode = useThemeStore((state) => state.mode)
    const direction = useThemeStore((state) => state.direction)

    const currentRouteKey = useRouteKeyStore((state) => state.currentRouteKey)

    const { larger } = useResponsive()

    const navColor = (navType: string, mode: string) => {
        return `${navType}-${mode}`
    }

    const handleChange = (selected: SelectedMenuItem) => {
        setSelectedMenu(selected)
    }

    const handleCollpase = () => {
        setSelectedMenu({})
        setActiveKeys([])
    }

    const handleSetActiveKey = (key: string[]) => {
        setActiveKeys(key)
    }

    const stackedSideNavSecondaryDirStyle = () => {
        let style = {}
        const marginValue = `${-STACKED_SIDE_NAV_SECONDARY_WIDTH}px`
        if (direction === DIR_LTR) {
            style = { marginLeft: marginValue }
        }

        if (direction === DIR_RTL) {
            style = { marginRight: marginValue }
        }

        return style
    }

    return (
        <>
            {larger.md && (
                <div className={`stacked-side-nav`}>
                    <StackedSideNavMini
                        className={`stacked-side-nav-mini ${navColor(
                            'stacked-side-nav-mini',
                            mode,
                        )}`}
                        style={stackedSideNavDefaultStyle}
                        routeKey={currentRouteKey}
                        activeKeys={activeKeys}
                        mode={mode}
                        direction={direction}
                        navigationTree={navigationTree}
                        userAuthority={userAuthority || []}
                        selectedMenu={selectedMenu}
                        t={t as TranslationFn}
                        onChange={handleChange}
                        onSetActiveKey={handleSetActiveKey}
                        sideNavFooter={navConfig.footer}
                    />
                    <div
                        className={`stacked-side-nav-secondary ${navColor(
                            'stacked-side-nav-secondary',
                            mode,
                        )}`}
                        style={{
                            width: STACKED_SIDE_NAV_SECONDARY_WIDTH,
                            ...(isEmpty(selectedMenu)
                                ? stackedSideNavSecondaryDirStyle()
                                : {}),
                        }}
                    >
                        {!isEmpty(selectedMenu) && (
                            <StackedSideNavSecondary
                                title={t(
                                    selectedMenu.translateKey as string,
                                    selectedMenu.title as string,
                                )}
                                menu={selectedMenu.menu}
                                routeKey={currentRouteKey}
                                direction={direction}
                                translationSetup={translationSetup}
                                userAuthority={userAuthority || []}
                                onCollapse={handleCollpase}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default StackedSideNav
