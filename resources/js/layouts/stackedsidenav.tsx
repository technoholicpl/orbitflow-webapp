import { useState } from 'react'
import {
    SPLITTED_SIDE_NAV_MINI_WIDTH,
    STACKED_SIDE_NAV_SECONDARY_WIDTH,
    DIR_LTR,
    DIR_RTL,
} from '@/constants/theme.constant'
import StackedSideNavMini, { SelectedMenuItem } from './stackedsidenavmini'
import StackedSideNavSecondary from './stackedsidenavsecondary'
import useResponsive from '@/hooks/useResponsive'
import { useThemeStore } from '@/store/themeStore'
import { NavigationTree } from '@/types/navigation'
import isEmpty from 'lodash/isEmpty'

const stackedSideNavDefaultStyle = {
    width: SPLITTED_SIDE_NAV_MINI_WIDTH,
}

const StackedSideNav = ({
    navigationConfig = [],
}: {
    navigationConfig?: NavigationTree[]
}) => {
    const [selectedMenu, setSelectedMenu] = useState<SelectedMenuItem>({})
    const [activeKeys, setActiveKeys] = useState<string[]>([])

    const mode = useThemeStore((state) => state.mode)
    const direction = useThemeStore((state) => state.direction)

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
                        activeKeys={activeKeys}
                        mode={mode}
                        direction={direction}
                        navigationTree={navigationConfig}
                        selectedMenu={selectedMenu}
                        onChange={handleChange}
                        onSetActiveKey={handleSetActiveKey}
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
                                title={selectedMenu.title as string}
                                menu={selectedMenu.menu}
                                direction={direction}
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
