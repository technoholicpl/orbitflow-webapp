import React from 'react'
import { router, usePage } from '@inertiajs/react'
import { Avatar, Dropdown, Badge, Notification, toast } from '@/components/ui'
import type { User } from '@/types'
import workspaceRoutes from '@/routes/workspace'

const WorkspaceSwitcher = () => {
    const { props: pageProps } = usePage<{ auth: { user: User }, isAdmin: boolean }>()
    const user = pageProps.auth.user
    const isAdmin = pageProps.isAdmin
    const workspaces = user?.workspaces || []
    const currentWorkspaceId = user?.current_workspace_id

    const handleSwitchWorkspace = (workspaceId: number) => {
        if (workspaceId === currentWorkspaceId) return;

        router.post(workspaceRoutes.switch(workspaceId).url, {}, {
            onSuccess: () => {
                toast.push(
                    <Notification title="Success" type="success">
                        Workspace switched successfully.
                    </Notification>
                );
            }
        });
    }

    if (isAdmin || workspaces.length === 0) {
        return null
    }

    return (
        <div className="flex items-center justify-center pb-6 shrink-0">
            <Dropdown
                placement="right-end"
                renderTitle={
                    <div className="cursor-pointer group relative">
                        <Avatar
                            shape="circle"
                            src={user?.avatar_url}
                            className="ring-2 ring-transparent group-hover:ring-indigo-500 transition-all"
                        >
                            {user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Badge 
                            className="absolute -top-1 -right-1 border-2 border-white dark:border-gray-900" 
                            innerClass="bg-emerald-500"
                        />
                    </div>
                }
            >
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Switch Workspace</p>
                </div>
                {workspaces.map((workspace) => (
                    <Dropdown.Item
                        key={workspace.id}
                        eventKey={workspace.id.toString()}
                        className="flex items-center justify-between min-w-[200px]"
                        onClick={() => handleSwitchWorkspace(workspace.id)}
                    >
                        <div className="flex items-center gap-3">
                            <Avatar size="sm" shape="round" className="bg-indigo-100 text-indigo-600">
                                {workspace.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <div className="flex flex-col">
                                <span className={`text-sm ${workspace.id === currentWorkspaceId ? 'font-bold text-indigo-600' : 'font-medium'}`}>
                                    {workspace.name}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            {workspace.id === currentWorkspaceId && (
                                <Badge innerClass="bg-indigo-500" content="Current" />
                            )}
                            {workspace.owner_id === user.id && (
                                <Badge innerClass="bg-amber-500" content="Owner" />
                            )}
                        </div>
                    </Dropdown.Item>
                ))}
                <Dropdown.Item variant="divider" />
                <Dropdown.Item 
                    eventKey="manage" 
                    onClick={() => router.get(workspaceRoutes.members.index().url)}
                    className="text-xs text-gray-500 hover:text-indigo-600"
                >
                    Manage Workspaces
                </Dropdown.Item>
            </Dropdown>
        </div>
    )
}

export default WorkspaceSwitcher
