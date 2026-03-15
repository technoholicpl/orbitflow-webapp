export type Direction = 'ltr' | 'rtl'
export type Mode = 'light' | 'dark'

export interface CommonProps {
    className?: string
    children?: React.ReactNode
    style?: React.CSSProperties
}
