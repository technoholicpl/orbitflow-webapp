import NavToggle from '@/components/shared/NavToggle'
import { useThemeStore } from '@/store/themeStore'
import type { CommonProps } from '@/types/common'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useResponsive from '@/utils/hooks/useResponsive'

const SideNavToggleBase = ({ className }: CommonProps) => {
    const { layout, setSideNavCollapse } = useThemeStore((state) => state)

    const sideNavCollapse = layout.sideNavCollapse

    const { larger } = useResponsive()

    const onCollapse = () => {
        setSideNavCollapse(!sideNavCollapse)
    }

    return (
        <>
            {larger.md && (
                <div className={className} role="button" onClick={onCollapse}>
                    <NavToggle className="text-2xl" toggled={sideNavCollapse} />
                </div>
            )}
        </>
    )
}

const SideNavToggle = withHeaderItem(SideNavToggleBase)

export default SideNavToggle
