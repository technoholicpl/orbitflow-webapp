import ScrollBar from '@/components/ScrollBar'
import clsx from 'clsx'
import { HEADER_HEIGHT, DIR_LTR, DIR_RTL } from '@/constants/theme.constant'
import { HiOutlineArrowSmLeft, HiOutlineArrowSmRight } from 'react-icons/hi'
import type { NavigationTree } from '@/types/navigation'
import type { Direction } from '@/constants/theme.constant'
import { Link } from '@inertiajs/react'

type StackedSideNavSecondaryProps = {
    className?: string
    title: string
    menu?: NavigationTree[]
    onCollapse: () => void
    direction?: Direction
}

const StackedSideNavSecondary = (props: StackedSideNavSecondaryProps) => {
    const {
        className,
        title,
        menu,
        onCollapse,
        direction,
        ...rest
    } = props

    return (
        <div className={clsx('h-full flex flex-col', className)} {...rest}>
            <div
                className={`flex items-center justify-between gap-4 pl-6 pr-4 shrink-0`}
                style={{ height: HEADER_HEIGHT }}
            >
                <h5 className="font-bold">{title}</h5>
                <button
                    type="button"
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xl"
                    onClick={onCollapse}
                >
                    {direction === DIR_LTR && <HiOutlineArrowSmLeft />}
                    {direction === DIR_RTL && <HiOutlineArrowSmRight />}
                </button>
            </div>
            <ScrollBar
                className="flex-auto"
                direction={direction}
            >
                <div className="px-4 py-2">
                    {menu?.map(item => (
                         <Link
                            key={item.key}
                            href={item.path}
                            className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                         >
                            <span>{item.title}</span>
                         </Link>
                    ))}
                </div>
            </ScrollBar>
        </div>
    )
}

export default StackedSideNavSecondary
