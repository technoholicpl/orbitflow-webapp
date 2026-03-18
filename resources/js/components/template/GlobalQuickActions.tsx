import React, { useState } from 'react'
import QuickAddMenu from '@/components/template/QuickAddMenu'
import ClientCreateDrawer from '@/components/shared/ClientCreateDrawer'
import { router, usePage } from '@inertiajs/react'
import { toast, Notification } from '@/components/ui'

const GlobalQuickActions = () => {
    const { props } = usePage<any>()
    const { cp_prefix, isAdmin } = props
    const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false)

    return (
        <>
            <QuickAddMenu 
                onAddClient={() => setIsClientDrawerOpen(true)}
                onAddProject={() => console.log('Add Project')}
                onAddTime={() => console.log('Add Time')}
            />
            <ClientCreateDrawer 
                isOpen={isClientDrawerOpen} 
                onClose={() => setIsClientDrawerOpen(false)}
            />
        </>
    )
}

export default GlobalQuickActions
