import { Head, useForm } from '@inertiajs/react';
import { 
    Edit2, Plus, Trash2, Activity
} from 'lucide-react';
import React, { useState } from 'react';
import Heading from '@/components/heading';
import {
    Button,
    Card,
    Dialog,
    Notification,
    toast,
} from '@/components/ui';
import DashboardLayout from '@/layouts/DashboardLayout';
import SettingsLayout from '@/layouts/settings/layout';
import workspace from '@/routes/workspace';
import { actionIcons } from '@/components/action-types/icon-picker';
import { ActionTypeForm } from '@/components/action-types/action-type-form';

interface ActionType {
    id: number;
    workspace_id: number | null;
    name: string;
    description: string | null;
    color: string;
    icon: string;
    system: boolean;
}

interface Props {
    actionTypes: ActionType[];
    systemTemplates: ActionType[];
    workspaceName: string;
}

export default function ActionTypesSettings({ 
    actionTypes = [], 
    systemTemplates = [],
    workspaceName = '' 
}: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingActionType, setEditingActionType] = useState<ActionType | null>(null);

    const { data, setData, post, patch, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        description: '',
        color: '#6366f1',
        icon: 'Activity',
    });

    const openCreateDialog = () => {
        setEditingActionType(null);
        reset();
        clearErrors();
        setIsDialogOpen(true);
    };

    const openEditDialog = (at: ActionType) => {
        if (at.system) return;
        setEditingActionType(at);
        setData({
            name: at.name,
            description: at.description || '',
            color: at.color || '#6366f1',
            icon: at.icon || 'Activity',
        });
        clearErrors();
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingActionType) {
            patch(workspace.actionTypes.update(editingActionType.id).url, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.push(
                        <Notification title="Success" type="success">
                            Action type updated successfully.
                        </Notification>
                    );
                },
            });
        } else {
            post(workspace.actionTypes.store().url, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                    toast.push(
                        <Notification title="Success" type="success">
                            Action type created successfully.
                        </Notification>
                    );
                },
            });
        }
    };

    const handleDelete = (at: ActionType) => {
        const confirmMsg = at.system 
            ? `Are you sure you want to remove the template "${at.name}" from this workspace?` 
            : `Are you sure you want to delete the custom action type "${at.name}"?`;
            
        if (confirm(confirmMsg)) {
            destroy(workspace.actionTypes.destroy(at.id).url, {
                onSuccess: () => {
                    toast.push(
                        <Notification title="Success" type="success">
                            {at.system ? 'Action template removed.' : 'Action type deleted.'}
                        </Notification>
                    );
                },
            });
        }
    };

    const handleAttach = (at: ActionType) => {
        post(workspace.actionTypes.attach(at.id).url, {
            onSuccess: () => {
                toast.push(
                    <Notification title="Success" type="success">
                        System template "{at.name}" added to workspace.
                    </Notification>
                );
            },
        });
    };

    return (
        <DashboardLayout title="Action Types Settings">
            <SettingsLayout>
                <Head title="Action Types Settings" />

                <div className="space-y-6">
                    <Heading
                        title="Action Types"
                        description={`Manage action templates for ${workspaceName}. Customize your workspace with system templates or create your own.`}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-6">
                            <Card
                                header={{
                                    content: (
                                        <div className="flex items-center justify-between w-full">
                                            <div>
                                                <h3 className="text-lg font-bold">Active Workspace Actions</h3>
                                                <p className="text-sm text-muted-foreground">Action types currently available in your workspace.</p>
                                            </div>
                                            <Button
                                                onClick={openCreateDialog}
                                                variant="solid"
                                                size="sm"
                                                icon={<Plus className="h-4 w-4" />}
                                            >
                                                Create Custom
                                            </Button>
                                        </div>
                                    ),
                                    bordered: true
                                }}
                            >
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {actionTypes.length === 0 ? (
                                        <div className="py-8 text-center text-muted-foreground italic text-sm">
                                            No actions added yet. Start by adding a system template or creating your own.
                                        </div>
                                    ) : (
                                        actionTypes.map((at) => (
                                            <div key={at.id} className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-xl">
                                                <div className="flex items-center space-x-3">
                                                    <div 
                                                        className="h-10 w-10 flex items-center justify-center rounded-lg shadow-sm border border-black/5" 
                                                        style={{ backgroundColor: at.color, color: 'white' }}
                                                    >
                                                        {actionIcons[at.icon] || <Activity className="h-4 w-4" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2">
                                                            <p className="text-sm font-bold">{at.name}</p>
                                                            {at.system && (
                                                                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                                    System
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-500 line-clamp-1">{at.description || 'No description'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {!at.system && (
                                                        <Button
                                                            variant="default"
                                                            size="xs"
                                                            icon={<Edit2 className="h-3.5 w-3.5" />}
                                                            onClick={() => openEditDialog(at)}
                                                        />
                                                    )}
                                                    <Button
                                                        variant="plain"
                                                        size="xs"
                                                        className="text-red-500 hover:text-red-600"
                                                        icon={<Trash2 className="h-3.5 w-3.5" />}
                                                        onClick={() => handleDelete(at)}
                                                        title={at.system ? "Remove from Workspace" : "Delete Custom Action"}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </div>

                        <div className="md:col-span-1">
                            <Card
                                header={{
                                    content: (
                                        <div className="flex items-center justify-between w-full">
                                            <div>
                                                <h3 className="text-lg font-bold">Templates</h3>
                                                <p className="text-xs text-muted-foreground">Available system actions.</p>
                                            </div>
                                        </div>
                                    ),
                                    bordered: true
                                }}
                            >
                                <div className="space-y-4">
                                    {systemTemplates.length === 0 ? (
                                        <div className="py-4 text-center text-muted-foreground italic text-xs">
                                            All system templates are active.
                                        </div>
                                    ) : (
                                        systemTemplates.map((at) => (
                                            <div key={at.id} className="p-3 border rounded-xl hover:border-indigo-500/50 transition-all group">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <div 
                                                            className="h-8 w-8 flex items-center justify-center rounded-lg shadow-sm" 
                                                            style={{ backgroundColor: at.color, color: 'white' }}
                                                        >
                                                            {actionIcons[at.icon]}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold">{at.name}</p>
                                                            <p className="text-[10px] text-gray-500 line-clamp-1">{at.description}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="xs"
                                                        variant="plain"
                                                        icon={<Plus className="h-3.5 w-3.5" />}
                                                        onClick={() => handleAttach(at)}
                                                        className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Add to Workspace"
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>

                <Dialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    width={500}
                >
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">
                            {editingActionType ? 'Edit Custom Action' : 'Create Custom Action'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Customize your workspace with a unique action template.
                        </p>

                        <ActionTypeForm 
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsDialogOpen(false)}
                            submitLabel={editingActionType ? 'Update Action Type' : 'Create Action Type'}
                        />
                    </div>
                </Dialog>
            </SettingsLayout>
        </DashboardLayout>
    );
}
