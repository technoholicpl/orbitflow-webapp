interface WorkTimeProps {
    seconds: number
    className?: string
}

export default function WorkTime({ seconds, className = "" }: WorkTimeProps) {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return (
        <span className={`tabular-nums font-bold ${className}`}>
            {hrs > 0 && <span>{hrs}h </span>}
            {mins > 0 && <span>{mins}m </span>}
            {(hrs === 0 && (mins === 0 || secs > 0)) && <span>{secs}s</span>}
        </span>
    )
}
