import { useState } from 'react'
import { Head } from '@inertiajs/react'
import DashboardLayout from '@/layouts/DashboardLayout'
import ProjectSheet from '@/components/projectsheet'
import ProjectTimer from '@/components/projecttimer'
import WorkTime from '@/components/WorkTime'

interface Project {
    id: number
    name: string
    description: string
    status: string
    priority: string
    deadline: string
    total_time?: number
    client_id?: number
    client?: { company_name: string }
}

interface ProjectsListProps {
    projects: Project[]
    clients: any[]
}

export default function ProjectsList({ projects, clients }: ProjectsListProps) {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined)

    const handleNewProject = () => {
        setSelectedProject(undefined)
        setIsSheetOpen(true)
    }

    const handleEditProject = (project: Project) => {
        setSelectedProject(project)
        setIsSheetOpen(true)
    }

    return (
        <DashboardLayout>
            <Head title="Projects" />
            <div className="flex flex-col gap-6">
                <header className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                        <p className="text-gray-500">Track and manage your workspace projects.</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="bg-white border hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium shadow-sm transition-all active:scale-95 text-sm uppercase tracking-widest">Filter</button>
                        <button 
                            onClick={handleNewProject}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all active:scale-95 text-sm uppercase tracking-widest"
                        >
                            New Project
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects && projects.length > 0 ? projects.map((project) => (
                        <div key={project.id} className="bg-white dark:bg-gray-900 border-2 rounded-2xl shadow-sm hover:border-indigo-500 transition-all p-6 flex flex-col gap-6 group">
                            <div className="flex justify-between items-start">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    project.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                                    project.priority === 'high' ? 'bg-orange-100 text-orange-700' : 
                                    project.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'
                                }`}>
                                    {project.priority}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleEditProject(project)}
                                        className="text-[10px] font-black uppercase text-gray-400 hover:text-indigo-600 tracking-tighter"
                                    >
                                        Edit
                                    </button>
                                    <span className="text-xs text-gray-300 font-medium italic">#{project.id}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <h3 className="font-black text-xl leading-tight group-hover:text-indigo-600 transition-colors uppercase">{project.name}</h3>
                                <p className="text-sm text-gray-400 font-medium line-clamp-2 italic">{project.description}</p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <ProjectTimer projectId={project.id} initialSeconds={project.total_time || 0} />
                                
                                <div className="flex items-center justify-between pb-4 border-b dark:border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase border-2 border-indigo-100 dark:border-indigo-800">
                                            {project.client?.company_name?.substring(0, 2) || 'CL'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-300 uppercase leading-none mb-1">Client</span>
                                            <span className="text-sm font-bold text-gray-600 dark:text-gray-300 truncate max-w-[120px]">{project.client?.company_name || 'No Client'}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black text-gray-300 uppercase leading-none mb-1 text-right">Deadline</span>
                                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">{new Date(project.deadline).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-gray-300 uppercase leading-none mb-1">Status</span>
                                    <span className="font-black text-indigo-600 uppercase tracking-widest">{project.status}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-gray-300 uppercase leading-none mb-1 text-right">Total Time</span>
                                    <WorkTime seconds={project.total_time || 0} className="text-gray-600 dark:text-gray-400" />
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center border-4 border-dashed rounded-3xl text-gray-300 italic font-black uppercase tracking-[0.2em]">No projects found.</div>
                    )}
                </div>
            </div>

            <ProjectSheet 
                isOpen={isSheetOpen} 
                onOpenChange={setIsSheetOpen} 
                project={selectedProject}
                clients={clients}
            />
        </DashboardLayout>
    )
}
