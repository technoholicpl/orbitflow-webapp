import type { PageProps } from '@inertiajs/core';
import { Head, useForm, usePage } from '@inertiajs/react';
import { 
    Edit2, Plus, Trash2, Activity
} from 'lucide-react';
import React, { useState } from 'react';
import { ActionTypeForm } from '@/components/action-types/action-type-form';
import { actionIcons } from '@/components/action-types/icon-picker';
import Heading from '@/components/heading';
import {
    Button,
    Card,
    Dialog,
    Notification,
    toast,
} from '@/components/ui';
import AdminLayout from '@/layouts/adminlayout';
import AdminSettingsLayout from '@/layouts/settings/admin-layout';

interface ActionType {
    id: number;
    name: string;
    description: string | null;
    color: string;
    icon: string;
    system: boolean;
}

interface AuthProps extends PageProps {
    cp_prefix: string;
}

interface Props {
    actionTypes: ActionType[];
}

export default function ActionTypesAdmin({ actionTypes = [] }: Props) {
    const { props } = usePage<AuthProps>();
    const { cp_prefix } = props;
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
            patch(`/${cp_prefix}/settings/action-types/${editingActionType.id}`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.push(
                        <Notification title="Success" type="success">
                            System action type updated successfully.
                        </Notification>
                    );
                },
            });
        } else {
            post(`/${cp_prefix}/settings/action-types`, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                    toast.push(
                        <Notification title="Success" type="success">
                            System action type created successfully.
                        </Notification>
                    );
                },
            });
        }
    };

    const handleDelete = (at: ActionType) => {
        if (confirm(`Are you sure you want to delete the system action type "${at.name}"? This will affect all workspaces using this template.`)) {
            destroy(`/${cp_prefix}/settings/action-types/${at.id}`, {
                onSuccess: () => {
                    toast.push(
                        <Notification title="Success" type="success">
                            System action type deleted.
                        </Notification>
                    );
                },
            });
        }
    };

    return (
        <AdminLayout title="System Action Types">
            <AdminSettingsLayout>
                <Head title="System Action Types" />

                <div className="space-y-6">
                    <Heading
                        title="System Action Types"
                        description="Manage global action templates provided to all workspaces."
                    />

                    <Card
                        header={{
                            content: (
                                <div className="flex items-center justify-between w-full">
                                    <div>
                                        <h3 className="text-lg font-bold">System Templates</h3>
                                        <p className="text-sm text-muted-foreground">These actions are available to all users by default.</p>
                                    </div>
                                    <Button
                                        onClick={openCreateDialog}
                                        variant="solid"
                                        size="sm"
                                        icon={<Plus className="h-4 w-4" />}
                                    >
                                        Add System Action
                                    </Button>
                                </div>
                            ),
                            bordered: true
                        }}
                    >
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {actionTypes.map((at) => (
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
                                                <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                    System
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">{at.description || 'No description'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="default"
                                            size="xs"
                                            icon={<Edit2 className="h-3.5 w-3.5" />}
                                            onClick={() => openEditDialog(at)}
                                        />
                                        <Button
                                            variant="plain"
                                            size="xs"
                                            className="text-red-500 hover:text-red-600"
                                            icon={<Trash2 className="h-3.5 w-3.5" />}
                                            onClick={() => handleDelete(at)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <Dialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    width={500}
                >
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">
                            {editingActionType ? 'Edit System Action' : 'Create System Action'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Define a global template for all workspaces.
                        </p>

                        <ActionTypeForm 
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsDialogOpen(false)}
                            submitLabel={editingActionType ? 'Update Template' : 'Create Template'}
                        />
                    </div>
                </Dialog>
            </AdminSettingsLayout>
        </AdminLayout>
    );
}
