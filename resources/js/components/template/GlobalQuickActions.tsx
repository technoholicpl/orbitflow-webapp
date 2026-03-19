import React, { useState } from 'react'
import QuickAddMenu from '@/components/template/QuickAddMenu'
import ClientCreateDrawer from '@/components/shared/ClientCreateDrawer'
import ProjectCreateDrawer from '@/components/shared/ProjectCreateDrawer'
import TimeEntryModal from '@/components/shared/TimeEntryModal'
import { usePage } from '@inertiajs/react'

const GlobalQuickActions = () => {
    const { props } = usePage<any>()
    const { cp_prefix, isAdmin } = props
    const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false)
    const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false)
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false)

    return (
        <>
            <QuickAddMenu 
                onAddClient={() => setIsClientDrawerOpen(true)}
                onAddProject={() => setIsProjectDrawerOpen(true)}
                onAddTime={() => setIsTimeModalOpen(true)}
            />
            <ClientCreateDrawer 
                isOpen={isClientDrawerOpen} 
                onClose={() => setIsClientDrawerOpen(false)}
            />
            <ProjectCreateDrawer
                isOpen={isProjectDrawerOpen}
                onClose={() => setIsProjectDrawerOpen(false)}
            />
            <TimeEntryModal
                isOpen={isTimeModalOpen}
                onClose={() => setIsTimeModalOpen(false)}
            />
        </>
    )
}

export default GlobalQuickActions
