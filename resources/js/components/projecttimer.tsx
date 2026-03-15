import { useState, useEffect } from 'react'

interface ProjectTimerProps {
    projectId: number
    initialSeconds?: number
    onStop?: (seconds: number) => void
}

export default function ProjectTimer({ projectId, initialSeconds = 0, onStop }: ProjectTimerProps) {
    const [isTracking, setIsTracking] = useState(false)
    const [seconds, setSeconds] = useState(initialSeconds)

    useEffect(() => {
        let interval: any
        if (isTracking) {
            interval = setInterval(() => {
                setSeconds(prev => prev + 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isTracking])

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600)
        const mins = Math.floor((totalSeconds % 3600) / 60)
        const secs = totalSeconds % 60
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleStop = () => {
        setIsTracking(false)
        if (onStop) onStop(seconds)
    }

    return (
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700">
            <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-black tabular-nums tracking-wider">{formatTime(seconds)}</span>
            {!isTracking ? (
                <button 
                    onClick={() => setIsTracking(true)}
                    className="bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full hover:bg-indigo-700 transition-all active:scale-95"
                >
                    Start
                </button>
            ) : (
                <button 
                    onClick={handleStop}
                    className="bg-red-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full hover:bg-red-600 transition-all active:scale-95"
                >
                    Stop
                </button>
            )}
        </div>
    )
}
