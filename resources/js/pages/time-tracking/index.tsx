import { Head } from '@inertiajs/react'
import DashboardLayout from '@/layouts/DashboardLayout'
import { useState, useEffect } from 'react'

export default function TimeTracking() {
    const [isTracking, setIsTracking] = useState(false)
    const [seconds, setSeconds] = useState(0)

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

    return (
        <DashboardLayout title="Time Tracking">
            <Head title="Time Tracking" />
            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
                    <p className="text-gray-500">Log and monitor your work hours in real-time.</p>
                </header>

                <div className="bg-indigo-600 rounded-3xl p-10 text-white shadow-xl shadow-indigo-200 dark:shadow-none flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-bold uppercase tracking-[0.2em] opacity-60">Active Session</span>
                        <div className="text-7xl font-black tabular-nums">{formatTime(seconds)}</div>
                    </div>
                    
                    <div className="flex gap-4">
                        {!isTracking ? (
                            <button 
                                onClick={() => setIsTracking(true)}
                                className="bg-white text-indigo-600 px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-lg"
                            >
                                Start Timer
                            </button>
                        ) : (
                            <button 
                                onClick={() => setIsTracking(false)}
                                className="bg-red-500 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95 shadow-lg"
                            >
                                Stop Timer
                            </button>
                        )}
                        <button className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-full font-black uppercase tracking-widest hover:bg-white/30 transition-all active:scale-95">Manual Entry</button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 border rounded-xl shadow-sm p-6 flex flex-col gap-4">
                    <h3 className="font-bold">Recent Entries</h3>
                    <div className="divide-y dark:divide-gray-800">
                        <div className="py-4 flex justify-between items-center text-sm">
                            <div className="flex flex-col gap-0.5">
                                <span className="font-bold">Website Redesign - Logo Design</span>
                                <span className="text-gray-400">Client One Ltd</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-black text-gray-700 dark:text-gray-300">02:30:00</span>
                                <span className="text-gray-400 font-medium">Today, 14:20</span>
                            </div>
                        </div>
                        <div className="py-4 flex justify-between items-center text-sm opacity-60">
                            <div className="flex flex-col gap-0.5">
                                <span className="font-bold">System Maintenance</span>
                                <span className="text-gray-400">Internal Project</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-black">01:15:24</span>
                                <span className="text-gray-400 font-medium">Yesterday</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
