import { Link, usePage } from '@inertiajs/react'
import React from 'react'
import { HiOutlineSparkles, HiOutlineArrowRight } from 'react-icons/hi'
import { index as subscriptionRoute } from '@/routes/workspace/subscription'

const TrialBanner = () => {
    const { current_workspace } = usePage<any>().props

    if (!current_workspace?.isOnTrial) {
        return null
    }

    return (
        <div className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 flex items-center justify-between shadow-lg sticky top-0 z-50">
            <div className="flex items-center gap-3 animate-pulse">
                <div className="bg-white/20 p-1.5 rounded-full">
                    <HiOutlineSparkles className="w-4 h-4" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                    <span className="text-sm font-black uppercase tracking-widest">Wersja Testowa</span>
                    <span className="text-xs text-white/80">
                        Korzystasz z planu <b>{current_workspace.plan?.name}</b>. Pozostało <b>{current_workspace.trialDaysRemaining} dni</b> testów. 
                    </span>
                </div>
            </div>
            <Link 
                href={subscriptionRoute().url}
                className="flex items-center gap-2 bg-white text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-sm"
            >
                Uaktualnij Plan <HiOutlineArrowRight className="w-3 h-3" />
            </Link>
        </div>
    )
}

export default TrialBanner
