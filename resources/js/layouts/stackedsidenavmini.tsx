import { useEffect } from 'react'
import Logo from '@/components/Logo'
import ScrollBar from '@/components/ScrollBar'
import {
    SIDE_NAV_CONTENT_GUTTER,
    HEADER_HEIGHT,
} from '@/constants/theme.constant'
import { NAV_ITEM_TYPE_ITEM } from '@/constants/navigation.constant'
import isEmpty from 'lodash/isEmpty'
import { Link } from '@inertiajs/react'
import type { NavigationTree } from '@/types/navigation'
import type { Direction, Mode } from '@/constants/theme.constant'
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
    activeKeys: string[]
    onSetActiveKey: (activeKey: string[]) => void
    mode: Mode
    direction: Direction
    navigationTree: NavigationTree[]
    selectedMenu: SelectedMenuItem
}

const StackedSideNavMini = (props: StackedSideNavMiniProps) => {
    const {
        onChange,
        activeKeys,
        onSetActiveKey,
        direction,
        navigationTree,
        mode,
        selectedMenu,
        ...rest
    } = props

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

    return (
        <div {...rest}>
            <div
                className="stacked-mini-nav-header flex items-center justify-center px-4"
                style={{ height: HEADER_HEIGHT }}
            >
                <Logo
                    imgClass="max-h-10"
                    mode={mode}
                    type="streamline"
                />
            </div>
            <ScrollBar direction={direction} className="h-full">
                <div className="flex flex-col gap-2 p-4">
                    {navigationTree.map((nav) => (
                        <div key={nav.key} title={nav.title}>
                            {nav.subMenu && nav.subMenu.length > 0 ? (
                                <button
                                    className={`p-2 rounded-lg transition-colors w-full flex justify-center ${
                                        activeKeys.includes(nav.key) 
                                        ? 'bg-blue-100 text-blue-600' 
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                    onClick={() =>
                                        handleMenuItemSelect({
                                            key: nav.key,
                                            title: nav.title,
                                            menu: nav.subMenu,
                                            translateKey: nav.translateKey,
                                        })
                                    }
                                >
                                    <div className="text-2xl">
                                        {/* Icon component will go here */}
                                        <i className={nav.icon} /> 
                                    </div>
                                </button>
                            ) : (
                                <Link
                                    href={nav.path}
                                    className={`p-2 rounded-lg transition-colors w-full flex justify-center ${
                                        activeKeys.includes(nav.key) 
                                        ? 'bg-blue-100 text-blue-600' 
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                    onClick={() =>
                                        handleLinkMenuItemSelect({
                                            key: nav.key,
                                        })
                                    }
                                >
                                    <div className="text-2xl">
                                        <i className={nav.icon} />
                                    </div>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollBar>
        </div>
    )
}

export default StackedSideNavMini
