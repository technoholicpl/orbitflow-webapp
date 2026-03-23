import { Head, useForm, router } from '@inertiajs/react';
import { Edit2, Plus, Trash2, Rocket, CheckCircle2, Copy, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import React, { useState } from 'react';
import Heading from '@/components/heading';
import {
    Button,
    Card,
    Input,
    Dialog,
    Notification,
    toast,
    Badge,
    Switcher
} from '@/components/ui';
import DashboardLayout from '@/layouts/DashboardLayout';
import SettingsLayout from '@/layouts/settings/layout';
import { store, update, destroy as destroyRoute, clone } from '@/routes/workspace/templates';

interface Task {
    name: string;
    status: string;
}

interface ProjectTemplate {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
    tasks: Task[];
    workspace_id: number | null;
}

interface Props {
    systemTemplates: ProjectTemplate[];
    customTemplates: ProjectTemplate[];
}

export default function TemplatesSettings({ systemTemplates = [], customTemplates = [] }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ProjectTemplate | null>(null);

    const { data, setData, post, patch, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        icon: 'Rocket',
        tasks: [] as Task[],
    });

    const openCreateDialog = () => {
        setEditingTemplate(null);
        reset();
        setData('tasks', [{ name: '', status: 'pending' }]);
        clearErrors();
        setIsDialogOpen(true);
    };

    const openEditDialog = (template: ProjectTemplate) => {
        setEditingTemplate(template);
        setData({
            name: template.name,
            description: template.description || '',
            icon: template.icon || 'Rocket',
            tasks: template.tasks || [],
        });
        clearErrors();
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTemplate) {
            patch(update.url(editingTemplate.id), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.push(<Notification title="Success" type="success">Template updated successfully.</Notification>);
                },
            });
        } else {
            post(store.url(), {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                    toast.push(<Notification title="Success" type="success">Template created successfully.</Notification>);
                },
            });
        }
    };

    const handleDelete = (template: ProjectTemplate) => {
        if (confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
            destroy(destroyRoute.url(template.id), {
                onSuccess: () => toast.push(<Notification title="Success" type="success">Template deleted.</Notification>),
            });
        }
    };

    const handleClone = (template: ProjectTemplate) => {
        if (confirm(`Do you want to activate/clone "${template.name}" to your workspace?`)) {
            router.post(clone.url(template.id), {}, {
                onSuccess: () => toast.push(<Notification title="Success" type="success">Template activated.</Notification>),
            });
        }
    };

    const addTask = () => setData('tasks', [...data.tasks, { name: '', status: 'pending' }]);
    const removeTask = (index: number) => {
        const newTasks = [...data.tasks];
        newTasks.splice(index, 1);
        setData('tasks', newTasks);
    };
    const updateTask = (index: number, name: string) => {
        const newTasks = [...data.tasks];
        newTasks[index].name = name;
        setData('tasks', newTasks);
    };

    return (
        <DashboardLayout title="Project Templates">
            <SettingsLayout>
                <Head title="Project Templates" />

                <div className="space-y-8">
                    <Heading
                        title="Project Templates"
                        description="Start your projects faster with predefined tasks and structures."
                    />

                    {/* System Templates */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Rocket className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-400 text-[12px]">System Templates</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {systemTemplates.map((template) => (
                                <Card key={template.id} className="relative overflow-hidden flex flex-col h-full border-2 border-transparent hover:border-indigo-100 transition-all bg-indigo-50/10">
                                    <div className="flex flex-col gap-4 grow">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-white dark:bg-gray-800 text-indigo-600 rounded-xl shadow-sm">
                                                {/* @ts-ignore */}
                                                {LucideIcons[template.icon] ? React.createElement(LucideIcons[template.icon], { size: 24 }) : <Rocket size={24} />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">{template.name}</h3>
                                                <Badge content="System" innerClass="bg-indigo-500" />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t">
                                        <Button variant="solid" size="sm" className="w-full" icon={<Copy className="w-4 h-4" />} onClick={() => handleClone(template)}>
                                            Activate Template
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Custom Templates */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Plus className="w-5 h-5 text-emerald-500" />
                                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-400 text-[12px]">Custom Templates</h2>
                            </div>
                            <Button onClick={openCreateDialog} variant="solid" size="sm" icon={<Plus className="h-4 w-4" />}>
                                Create Template
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {customTemplates.map((template) => (
                                <Card key={template.id} className="relative overflow-hidden flex flex-col h-full border-2 border-transparent hover:border-emerald-100 transition-all">
                                    <div className="flex flex-col gap-4 grow">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-xl">
                                                {/* @ts-ignore */}
                                                {LucideIcons[template.icon] ? React.createElement(LucideIcons[template.icon], { size: 24 }) : <Rocket size={24} />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">{template.name}</h3>
                                                <Badge content={`${template.tasks.length} Tasks`} innerClass="bg-gray-100 text-gray-700" />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>
                                    </div>
                                    <div className="flex gap-2 mt-6 pt-4 border-t">
                                        <Button size="sm" className="grow" icon={<Edit2 className="h-3.5 w-3.5" />} onClick={() => openEditDialog(template)}>Edit</Button>
                                        <Button size="sm" color="red" variant="plain" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => handleDelete(template)} />
                                    </div>
                                </Card>
                            ))}
                            {customTemplates.length === 0 && (
                                <div className="col-span-full py-12 text-center border-2 border-dashed rounded-3xl text-gray-400">
                                    No custom templates yet. Create your first one to standardize your projects.
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} width={600}>
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">{editingTemplate ? 'Edit Template' : 'Create Template'}</h3>
                        <p className="text-sm text-gray-500 mb-6">Define your project structure and initial tasks.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Template Name</label>
                                    <Input value={data.name} onChange={(e) => setData('name', e.target.value)} invalid={!!errors.name} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Lucide Icon (e.g. Code, Megaphone)</label>
                                    <Input value={data.icon} onChange={(e) => setData('icon', e.target.value)} required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input textArea value={data.description} onChange={(e) => setData('description', e.target.value)} required />
                            </div>

                            <div className="pt-4 border-t">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold">Initial Tasks</h4>
                                    <Button type="button" size="sm" variant="default" icon={<Plus className="w-4 h-4" />} onClick={addTask}>Add Task</Button>
                                </div>
                                <div className="space-y-2">
                                    {data.tasks.map((task, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input className="grow" value={task.name} onChange={e => updateTask(index, e.target.value)} placeholder="Task name..." required />
                                            <Button type="button" variant="plain" color="red" icon={<X className="w-4 h-4" />} onClick={() => removeTask(index)} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end space-x-3">
                                <Button variant="default" type="button" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button variant="solid" type="submit" loading={processing}>{editingTemplate ? 'Update' : 'Create'}</Button>
                            </div>
                        </form>
                    </div>
                </Dialog>
            </SettingsLayout>
        </DashboardLayout>
    );
}
