import { Head, useForm, router } from '@inertiajs/react'
import * as LucideIcons from 'lucide-react'
import React, { useState } from 'react'
import { 
    HiOutlineTrash, 
    HiOutlinePencil, 
    HiOutlinePlus,
    HiOutlineTerminal,
    HiOutlineCheckCircle,
    HiOutlineX
} from 'react-icons/hi'
import { 
    Button, 
    Input, 
    Table, 
    Notification, 
    toast, 
    Card, 
    Badge, 
    Drawer,
    Switcher
} from '@/components/ui'
import AdminLayout from '@/layouts/adminlayout'
import { store, update, destroy } from '@/routes/admin/templates'

interface Task {
    name: string
    status: string
}

interface ProjectTemplate {
    id: number
    name: string
    slug: string
    description: string
    icon: string
    tasks: Task[]
    is_active: boolean
}

interface Props {
    templates: ProjectTemplate[]
}

export default function TemplatesIndex({ templates }: Props) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null)

    const { data, setData, post, patch, processing, reset, errors } = useForm({
        name: '',
        description: '',
        icon: 'Rocket',
        tasks: [] as Task[],
        is_active: true
    })

    const handleCreate = () => {
        setSelectedTemplate(null)
        reset()
        setData('tasks', [{ name: '', status: 'pending' }])
        setIsEditModalOpen(true)
    }

    const handleEdit = (template: ProjectTemplate) => {
        setSelectedTemplate(template)
        setData({
            name: template.name,
            description: template.description || '',
            icon: template.icon || 'Rocket',
            tasks: template.tasks || [],
            is_active: !!template.is_active
        })
        setIsEditModalOpen(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedTemplate) {
            patch(update.url(selectedTemplate.id), {
                onSuccess: () => {
                    setIsEditModalOpen(false)
                    toast.push(<Notification title="Success" type="success">Template updated successfully</Notification>)
                }
            })
        } else {
            post(store.url(), {
                onSuccess: () => {
                    setIsEditModalOpen(false)
                    toast.push(<Notification title="Success" type="success">Template created successfully</Notification>)
                }
            })
        }
    }

    const handleDelete = (id: number) => {
        if (confirm('Are you sure? This will permanently delete this system template.')) {
            router.delete(destroy.url(id), {
                onSuccess: () => toast.push(<Notification title="Deleted" type="success">Template deleted successfully</Notification>)
            })
        }
    }

    const addTask = () => {
        setData('tasks', [...data.tasks, { name: '', status: 'pending' }])
    }

    const removeTask = (index: number) => {
        const newTasks = [...data.tasks]
        newTasks.splice(index, 1)
        setData('tasks', newTasks)
    }

    const updateTask = (index: number, name: string) => {
        const newTasks = [...data.tasks]
        newTasks[index].name = name
        setData('tasks', newTasks)
    }

    return (
        <AdminLayout>
            <Head title="System Project Templates" />
            <div className="flex flex-col gap-8">
                <header className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold">Project Templates</h1>
                        <p className="text-gray-500 text-sm">Create and manage system templates that will be proposed to all users.</p>
                    </div>
                    <Button variant="solid" icon={<HiOutlinePlus />} onClick={handleCreate}>
                        Add Template
                    </Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map(template => (
                        <Card key={template.id} className="relative overflow-hidden flex flex-col h-full border-2 border-transparent hover:border-indigo-100 transition-all">
                            <div className="flex flex-col gap-4 grow">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                                            {/* @ts-ignore */}
                                            {LucideIcons[template.icon] ? React.createElement(LucideIcons[template.icon], { size: 24 }) : <LucideIcons.Rocket size={24} />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">{template.name}</h3>
                                            <div className="flex gap-2 mt-1">
                                                {(!template.is_active) && <Badge content="Inactive" innerClass="bg-red-500" />}
                                                <Badge content={`${template.tasks.length} Tasks`} innerClass="bg-gray-100 text-gray-700" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">{template.description}</p>
                                
                                <div className="space-y-2 mt-2">
                                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Initial Tasks</h4>
                                    <ul className="space-y-1">
                                        {template.tasks.slice(0, 3).map((task, idx) => (
                                            <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                                <HiOutlineCheckCircle className="text-emerald-500" /> {task.name}
                                            </li>
                                        ))}
                                        {template.tasks.length > 3 && (
                                            <li className="text-[10px] text-gray-400 italic">+{template.tasks.length - 3} more tasks</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-6 pt-4 border-t">
                                <Button size="sm" className="grow" icon={<HiOutlinePencil />} onClick={() => handleEdit(template)}>Edit</Button>
                                <Button size="sm" color="red" variant="default" icon={<HiOutlineTrash />} onClick={() => handleDelete(template.id)} />
                            </div>
                        </Card>
                    ))}
                    {templates.length === 0 && (
                        <div className="col-span-full py-20 bg-white dark:bg-gray-900 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-gray-400 gap-4">
                            <LucideIcons.Layout className="text-4xl opacity-20" />
                            <p className="font-medium tracking-wide">No system templates found.</p>
                            <Button size="sm" onClick={handleCreate}>Create First Template</Button>
                        </div>
                    )}
                </div>
            </div>

            <Drawer 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)}
                onRequestClose={() => setIsEditModalOpen(false)}
                title={selectedTemplate ? `Edit Template: ${selectedTemplate.name}` : 'Create New Template'}
                width={600}
                footer={
                    <div className="flex justify-end gap-2 w-full">
                        <Button type="button" variant="plain" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="solid" loading={processing} form="template-form">
                           {selectedTemplate ? 'Save Changes' : 'Create Template'}
                        </Button>
                    </div>
                }
            >
                <form id="template-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Template Name</label>
                                <Input value={data.name} onChange={e => setData('name', e.target.value)} placeholder="e.g. Marketing Campaign" required />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Lucide Icon</label>
                                <Input value={data.icon} onChange={e => setData('icon', e.target.value)} placeholder="e.g. Megaphone, Code, Layout" required />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold uppercase text-gray-500">Description</label>
                            <Input textArea value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Explain what this template is for..." required />
                        </div>

                        <div className="flex items-center gap-2">
                            <Switcher checked={data.is_active} onChange={val => setData('is_active', val)} />
                            <span className="text-xs font-bold">Active (Visible to users)</span>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-900">Task List</h4>
                                <Button type="button" size="sm" variant="default" icon={<HiOutlinePlus />} onClick={addTask}>Add Task</Button>
                            </div>
                            <div className="space-y-2">
                                {data.tasks.map((task, index) => (
                                    <div key={index} className="flex gap-2 animate-in slide-in-from-right-2">
                                        <Input 
                                            className="grow" 
                                            value={task.name} 
                                            onChange={e => updateTask(index, e.target.value)} 
                                            placeholder="Task name..." 
                                            required 
                                        />
                                        <Button type="button" variant="plain" color="red" icon={<HiOutlineX />} onClick={() => removeTask(index)} />
                                    </div>
                                ))}
                                {data.tasks.length === 0 && (
                                    <p className="text-sm text-gray-400 italic text-center py-4">No tasks added yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </Drawer>
        </AdminLayout>
    )
}
