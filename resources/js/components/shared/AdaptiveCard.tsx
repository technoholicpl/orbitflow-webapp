import classNames from '@/utils/classNames'
import { Card } from '@/components/ui'
import { useContext } from 'react'
import { LayoutContext } from '@/utils/hooks/useLayout'
import type { CardProps } from '@/components/ui/Card'

type AdaptableCardProps = CardProps

const AdaptiveCard = (props: AdaptableCardProps) => {
    const context = useContext(LayoutContext)
    const adaptiveCardActive = context?.adaptiveCardActive

    const { className, bodyClass, ...rest } = props

    return (
        <Card
            className={classNames(
                className,
                adaptiveCardActive && 'border-none dark:bg-transparent',
            )}
            bodyClass={classNames(bodyClass, adaptiveCardActive && 'p-0')}
            {...rest}
        />
    )
}

export default AdaptiveCard


