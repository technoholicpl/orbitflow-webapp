import React from 'react'
import QuickAddMenu from '@/components/template/QuickAddMenu'
import ClientCreateDrawer from '@/components/shared/ClientCreateDrawer'
import ProjectCreateDrawer from '@/components/shared/ProjectCreateDrawer'
import TimeEntryModal from '@/components/shared/TimeEntryModal'
import { useQuickActionsStore } from '@/store/quickActionsStore'

const GlobalQuickActions = () => {
    const { 
        isClientDrawerOpen, 
        setClientDrawerOpen,
        isProjectDrawerOpen, 
        setProjectDrawerOpen,
        isTimeModalOpen, 
        setTimeModalOpen 
    } = useQuickActionsStore()

    return (
        <>
            <QuickAddMenu 
                onAddClient={() => setClientDrawerOpen(true)}
                onAddProject={() => setProjectDrawerOpen(true)}
                onAddTime={() => setTimeModalOpen(true)}
            />
            <ClientCreateDrawer 
                isOpen={isClientDrawerOpen} 
                onClose={() => setClientDrawerOpen(false)}
            />
            <ProjectCreateDrawer
                isOpen={isProjectDrawerOpen}
                onClose={() => setProjectDrawerOpen(false)}
            />
            <TimeEntryModal
                isOpen={isTimeModalOpen}
                onClose={() => setTimeModalOpen(false)}
            />
        </>
    )
}

export default GlobalQuickActions
