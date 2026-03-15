import { Head } from '@inertiajs/react'
import StackedLayout from '@/layouts/stackedlayout'
import { NavigationTree } from '@/types/navigation'

const navigationConfig: NavigationTree[] = [
    { key: 'dashboard', path: '/dashboard', title: 'Dashboard', icon: 'hi-dashboard' },
    { key: 'clients', path: '/clients', title: 'Clients', icon: 'hi-user-group' },
    { 
        key: 'projects', 
        path: '/projects', 
        title: 'Projects', 
        icon: 'hi-project',
        subMenu: [
            { key: 'projects.list', path: '/projects', title: 'List View', icon: '' },
            { key: 'projects.kanban', path: '/projects/kanban', title: 'Kanban', icon: '' },
        ]
    },
    { key: 'time-tracking', path: '/time-tracking', title: 'Time Tracking', icon: 'hi-clock' },
]

interface Project {
    id: number
    name: string
    status: string
    priority: string
}

interface KanbanProps {
    projectsByStatus: Record<string, Project[]>
}

export default function ProjectKanban({ projectsByStatus }: KanbanProps) {
    const statuses = ['new', 'in progress', 'pending', 'completed']

    return (
        <StackedLayout navigationConfig={navigationConfig}>
            <Head title="Project Kanban" />
            <div className="flex flex-col gap-6 h-full">
                <header className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight">Project Kanban</h1>
                        <p className="text-gray-500">Drag and drop projects to update their status.</p>
                    </div>
                </header>

                <div className="flex gap-6 overflow-x-auto pb-6 h-full min-h-[600px]">
                    {statuses.map((status) => (
                        <div key={status} className="shrink-0 w-80 flex flex-col gap-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="font-black text-sm uppercase tracking-widest text-gray-400">{status}</h3>
                                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-[10px] font-bold">{projectsByStatus[status]?.length || 0}</span>
                            </div>
                            
                            <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-3 flex flex-col gap-3 min-h-[200px] border-2 border-dashed dark:border-gray-800">
                                {projectsByStatus[status]?.map((project) => (
                                    <div key={project.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-transparent hover:border-indigo-500 cursor-move transition-all active:scale-95 group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                                                project.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {project.priority}
                                            </span>
                                            <button className="text-gray-300 group-hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">...</button>
                                        </div>
                                        <h4 className="font-bold text-sm mb-1">{project.name}</h4>
                                        <div className="flex items-center gap-2 mt-4">
                                            <div className="w-5 h-5 rounded-full bg-gray-200" />
                                            <span className="text-[10px] text-gray-400 font-bold italic">Assignee Placeholder</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </StackedLayout>
    )
}
