import { useContext } from 'react'
import { Card } from '@/components/ui'
import type { CardProps } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { LayoutContext } from '@/utils/hooks/useLayout'

type AdaptableCardProps = CardProps

const AdaptiveCard = (props: AdaptableCardProps) => {
    const context = useContext(LayoutContext)
    const adaptiveCardActive = context?.adaptiveCardActive

    const { className, bodyClass, ...rest } = props

    return (
        <Card
            className={cn(
                className,
                adaptiveCardActive && 'border-none dark:bg-transparent',
            )}
            bodyClass={cn(bodyClass, adaptiveCardActive && 'p-0')}
            {...rest}
        />
    )
}

export default AdaptiveCard


