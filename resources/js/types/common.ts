import type { ReactNode, CSSProperties } from 'react'

export type Direction = 'ltr' | 'rtl'
export type Mode = 'light' | 'dark'

export interface CommonProps {
    id?: string
    className?: string
    children?: ReactNode
    style?: CSSProperties
}

export type TableQueries = {
    total?: number
    pageIndex?: number
    pageSize?: number
    query?: string
    sort?: {
        order: 'asc' | 'desc' | ''
        key: string | number
    }
}

export type TranslationFn = (
    key: string,
    fallback?: string | Record<string, string | number>,
) => string
