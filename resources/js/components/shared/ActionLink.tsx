import classNames from '@/utils/classNames'
import { Link } from "@inertiajs/react"
import type { CommonProps } from '@/@types/common'
import type { ComponentPropsWithoutRef } from 'react'

interface ActionLink extends CommonProps, ComponentPropsWithoutRef<'a'> {
    themeColor?: boolean
    to?: string
    href?: string
    reloadDocument?: boolean
}

const ActionLink = (props: ActionLink) => {
    const {
        children,
        className,
        themeColor = true,
        to,
        reloadDocument,
        href = '',
        ...rest
    } = props

    const classNameProps = {
        className: classNames(
            themeColor && 'text-primary',
            'hover:underline',
            className,
        ),
    }

    return to ? (
        <Link
            href={to}
            {...classNameProps}
            {...(rest as any)}
        >
            {children}
        </Link>
    ) : (
        <a href={href} {...classNameProps} {...(rest as any)}>
            {children}
        </a>
    )
}

export default ActionLink


