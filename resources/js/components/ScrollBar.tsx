import clsx from 'clsx'

interface ScrollBarProps {
    children: React.ReactNode
    className?: string
    direction?: 'ltr' | 'rtl'
}

const ScrollBar = ({ children, className, direction }: ScrollBarProps) => {
    return (
        <div className={clsx('overflow-auto custom-scrollbar', className)} dir={direction}>
            {children}
        </div>
    )
}

export default ScrollBar
