import { Head } from '@inertiajs/react';
import { Briefcase, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import React from 'react';
import { Card, Badge } from '@/components/ui';
import DashboardLayout from '@/layouts/DashboardLayout';

interface ProjectShowProps {
    project: any;
}

export default function ProjectShow({ project }: ProjectShowProps) {
    return (
        <DashboardLayout title={`Projekt: ${project.name}`}>
            <Head title={`Projekt: ${project.name}`} />
            
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{project.name}</h1>
                            <p className="text-gray-500">{project.client?.company_name || project.client?.name || 'Brak klienta'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500 text-white border-none uppercase text-[10px] font-bold tracking-wider" content={project.status.replace('_', ' ')} />
                        <Badge className="uppercase text-[10px] font-bold tracking-wider" content={`${project.priority} priority`} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="rounded-2xl border-none shadow-sm shadow-indigo-100 dark:shadow-none">
                            <h3 className="font-bold mb-4 text-gray-900 dark:text-gray-100">O projekcie</h3>
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                                {project.description || 'Brak opisu dla tego projektu.'}
                            </p>
                        </Card>

                        <Card className="rounded-2xl border-none shadow-sm shadow-indigo-100 dark:shadow-none">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100">Zadania</h3>
                                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-none font-bold">
                                    {project.tasks?.length || 0}
                                </Badge>
                            </div>

                            {project.tasks && project.tasks.length > 0 ? (
                                <div className="space-y-3">
                                    {project.tasks.map((task: any) => (
                                        <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={task.done_at ? "text-emerald-500" : "text-gray-300"}>
                                                    {task.done_at ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                                                </div>
                                                <span className={task.done_at ? "line-through text-gray-400" : "font-medium"}>{task.name}</span>
                                            </div>
                                            {task.estimated_time && (
                                                <span className="text-xs font-bold text-gray-400">{Math.floor(task.estimated_time / 60)}h</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center text-gray-400">
                                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>Brak zadań w tym projekcie.</p>
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="rounded-2xl border-none shadow-sm shadow-indigo-100 dark:shadow-none bg-indigo-50 dark:bg-gray-800/50">
                            <div className="flex items-center gap-3 mb-4 text-indigo-600">
                                <Clock className="w-5 h-5" />
                                <h4 className="font-bold">Czas pracy</h4>
                            </div>
                            <div className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-1">
                                {Math.floor(project.spent_time / 60)}h {project.spent_time % 60}m
                            </div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Łącznie zaraportowano</p>
                        </Card>

                        <Card className="rounded-2xl border-none shadow-sm shadow-indigo-100 dark:shadow-none">
                            <h4 className="font-bold mb-4 text-gray-900 dark:text-gray-100 italic">Termin</h4>
                            {project.deadline ? (
                                <div className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300">
                                    {new Date(project.deadline).toLocaleDateString()}
                                </div>
                            ) : (
                                <span className="text-gray-400">Bez terminu</span>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
