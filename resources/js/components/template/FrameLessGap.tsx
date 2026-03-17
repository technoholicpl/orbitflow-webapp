import { cn } from '@/lib/utils'
import type { CommonProps } from '@/types/common'

export interface FrameLessGapProps extends CommonProps {
    contained?: boolean
}

const FrameLessGap = ({ children, className }: FrameLessGapProps) => {
    return <div className={cn(className, 'p-6')}>{children}</div>
}

export default FrameLessGap
