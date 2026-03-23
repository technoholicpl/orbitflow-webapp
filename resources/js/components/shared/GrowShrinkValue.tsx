import type { ReactNode, Ref } from 'react'
import { HiArrowUp, HiArrowDown } from 'react-icons/hi'
import { cn } from '@/lib/utils'

type GrowShrinkTagProps = {
    value?: number
    showIcon?: boolean
    prefix?: ReactNode | string
    suffix?: ReactNode | string
    positiveIcon?: ReactNode | string
    negativeIcon?: ReactNode | string
    positiveClass?: string
    negativeClass?: string
    className?: string
    ref?: Ref<HTMLDivElement>
}

const GrowShrinkValue = (props: GrowShrinkTagProps) => {
    const {
        value = 0,
        className,
        prefix,
        suffix,
        positiveIcon,
        negativeIcon,
        showIcon = true,
        positiveClass,
        negativeClass,
        ref,
    } = props

    return (
        <span
            ref={ref}
            className={cn(
                'flex items-center',
                value > 0
                    ? cn('text-success', positiveClass)
                    : cn('text-error', negativeClass),
                className,
            )}
        >
            {value !== 0 && (
                <span>
                    {showIcon &&
                        (value > 0 ? (
                            typeof positiveIcon !== 'undefined' ? (
                                positiveIcon
                            ) : (
                                <HiArrowUp />
                            )
                        ) : typeof negativeIcon !== 'undefined' ? (
                            negativeIcon
                        ) : (
                            <HiArrowDown />
                        ))}
                </span>
            )}
            <span>
                {prefix}
                {value}
                {suffix}
            </span>
        </span>
    )
}

export default GrowShrinkValue
