import { cn } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import { PiBellDuotone } from 'react-icons/pi'

const NotificationToggle = ({
    className,
    dot,
}: {
    className?: string
    dot: boolean
}) => {
    return (
        <div className={cn('text-2xl', className)}>
            {dot ? (
                <Badge badgeStyle={{ top: '3px', right: '6px' }}>
                    <PiBellDuotone />
                </Badge>
            ) : (
                <PiBellDuotone />
            )}
        </div>
    )
}

export default NotificationToggle
