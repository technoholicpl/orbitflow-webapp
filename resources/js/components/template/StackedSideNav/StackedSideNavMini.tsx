import { useEffect, ReactNode } from 'react'
import Logo from '@/components/template/Logo'
import Menu from '@/components/ui/Menu'
import ScrollBar from '@/components/ui/ScrollBar'
import AuthorityCheck from '@/components/shared/AuthorityCheck'
import {
    SIDE_NAV_CONTENT_GUTTER,
    HEADER_HEIGHT,
} from '@/constants/theme.constant'
import { NAV_ITEM_TYPE_ITEM } from '@/constants/navigation.constant'
import appConfig from '@/configs/app.config'
import navigationIcon from '@/configs/navigation-icon.config'
import useMenuActive from '@/utils/hooks/useMenuActive'
import isEmpty from 'lodash/isEmpty'
import { Link } from "@inertiajs/react"
import type { NavigationTree } from '@/types/navigation'
import type { Direction, Mode } from '@/types/theme'
import type { CommonProps } from '@/types/common'

export type SelectedMenuItem = {
    key?: string
    title?: string
    menu?: NavigationTree[]
    translateKey?: string
}

interface StackedSideNavMiniProps extends CommonProps {
    className?: string
    onChange: (item: SelectedMenuItem) => void
    routeKey: string
    activeKeys: string[]
    onSetActiveKey: (activeKey: string[]) => void
    userAuthority: string[]
    mode: Mode
    direction: Direction
    navigationTree: NavigationTree[]
    selectedMenu: SelectedMenuItem
    t: (
        key: string,
        fallback?: string | Record<string, string | number>,
    ) => string
    sideNavFooter?: ReactNode
}

const StackedSideNavMini = (props: StackedSideNavMiniProps) => {
    const {
        onChange,
        routeKey,
        activeKeys,
        onSetActiveKey,
        direction,
        navigationTree,
        userAuthority,
        mode,
        selectedMenu,
        t,
        sideNavFooter,
        ...rest
    } = props

    const { includedRouteTree } = useMenuActive(navigationTree, routeKey)

    const handleMenuItemSelect = ({
        key,
        title,
        menu,
        translateKey,
    }: SelectedMenuItem) => {
        onChange({ title, menu, translateKey })
        onSetActiveKey([key as string])
    }

    const handleLinkMenuItemSelect = ({ key }: SelectedMenuItem) => {
        onChange({})
        onSetActiveKey([key as string])
    }

    useEffect(() => {
        if (
            includedRouteTree.type !== NAV_ITEM_TYPE_ITEM &&
            !isEmpty(includedRouteTree)
        ) {
            onChange({
                key: includedRouteTree.key,
                title: includedRouteTree.title,
                menu: includedRouteTree.subMenu,
                translateKey: includedRouteTree.translateKey,
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [includedRouteTree.key])

    const defaultActiveKeys =
        activeKeys && activeKeys.length > 0
            ? activeKeys
            : isEmpty(selectedMenu)
              ? []
              : [includedRouteTree.key]

    return (
        <div {...rest} className={`flex flex-col h-full ${rest.className || ''}`}>
            <Link
                id="workspace-switcher"
                href={appConfig.authenticatedEntryPath}
                className="stacked-mini-nav-header flex items-center justify-center shrink-0"
                style={{ height: HEADER_HEIGHT }}
            >
                <Logo
                    imgClass="max-h-10"
                    mode={mode}
                    type="streamline"
                    className={SIDE_NAV_CONTENT_GUTTER}
                />
            </Link>
            <div className="flex-1 overflow-hidden">
                <ScrollBar autoHide direction={direction}>
                    <Menu
                        className="px-4 pb-4"
                        defaultActiveKeys={defaultActiveKeys}
                    >
                        {navigationTree.map((nav) => (
                            <AuthorityCheck
                                key={nav.key}
                                authority={nav.authority}
                                userAuthority={userAuthority}
                            >
                                <div title={t(nav.translateKey, nav.title)}>
                                    {nav.subMenu && nav.subMenu.length > 0 ? (
                                        <Menu.MenuItem
                                            eventKey={nav.key}
                                            className="mb-2"
                                            onSelect={() =>
                                                handleMenuItemSelect({
                                                    key: nav.key,
                                                    title: nav.title,
                                                    menu: nav.subMenu,
                                                    translateKey: nav.translateKey,
                                                })
                                            }
                                        >
                                            <div className="text-2xl">
                                                {navigationIcon[nav.icon]}
                                            </div>
                                        </Menu.MenuItem>
                                    ) : (
                                        <Link
                                            href={nav.path}
                                            className="flex items-center h-full w-full"
                                            onClick={() =>
                                                handleLinkMenuItemSelect({
                                                    key: nav.key,
                                                })
                                            }
                                        >
                                            <Menu.MenuItem
                                                eventKey={nav.key}
                                                className="mb-2"
                                            >
                                                <div className="text-2xl">
                                                    {navigationIcon[nav.icon]}
                                                </div>
                                            </Menu.MenuItem>
                                        </Link>
                                    )}
                                </div>
                            </AuthorityCheck>
                        ))}
                    </Menu>
                </ScrollBar>
            </div>
            
            {sideNavFooter && sideNavFooter}
        </div>
    )
}

export default StackedSideNavMini
