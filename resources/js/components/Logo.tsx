import clsx from 'clsx'

interface LogoProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    className?: string
    style?: React.CSSProperties
    logoWidth?: number | string
}

const Logo = (props: LogoProps) => {
    const {
        type = 'full',
        mode = 'light',
        className,
        imgClass,
        style,
        logoWidth = 'auto',
    } = props

    return (
        <div
            className={clsx('logo', className)}
            style={{
                ...style,
                width: logoWidth,
            }}
        >
            <div className="font-bold text-xl uppercase tracking-tighter">
                Orbit<span className="text-blue-600">Flow</span>
            </div>
        </div>
    )
}

export default Logo
