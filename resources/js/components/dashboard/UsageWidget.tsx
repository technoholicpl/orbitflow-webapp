import React from 'react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { Progress } from '@/components/ui'

interface UsageItem {
    label: string
    usage: number
    limit: number | string
    percentage: number
    is_unlimited: boolean
}

interface UsageWidgetProps {
    usageSummary: UsageItem[]
}

export default function UsageWidget({ usageSummary }: UsageWidgetProps) {
    if (!usageSummary || usageSummary.length === 0) return null

    return (
        <AdaptiveCard className="h-full">
            <h4 className="font-bold mb-4">Workspace Usage</h4>
            <div className="flex flex-col gap-6">
                {usageSummary.map((item, index) => (
                    <div key={index} className="flex flex-col gap-2">
                        <div className="flex justify-between items-end">
                            <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                            <span className="text-xs font-bold text-gray-500">
                                {item.usage} / {item.is_unlimited ? '∞' : item.limit}
                            </span>
                        </div>
                        <Progress 
                            percent={item.percentage} 
                            size="sm" 
                            showInfo={false}
                            customColorClass={item.percentage > 90 ? 'bg-red-500' : 'bg-primary'} 
                        />
                    </div>
                ))}
            </div>
        </AdaptiveCard>
    )
}
