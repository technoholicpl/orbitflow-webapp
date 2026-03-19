import { Head, useForm } from '@inertiajs/react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import Heading from '@/components/heading';
import {
    Button,
    Card,
    Input,
    Dialog,
    Notification,
    toast,
} from '@/components/ui';
import DashboardLayout from '@/layouts/DashboardLayout';
import SettingsLayout from '@/layouts/settings/layout';
import workspace from '@/routes/workspace';

interface Label {
    id: number;
    name: string;
    slug: string;
    color: string;
    enabled: boolean;
}

interface Props {
    labels: Label[];
    workspaceName: string;
}

export default function LabelsSettings({ labels = [], workspaceName = '' }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLabel, setEditingLabel] = useState<Label | null>(null);

    const { data, setData, post, patch, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        color: '#6366f1',
        enabled: true,
    });

    const openCreateDialog = () => {
        setEditingLabel(null);
        reset();
        clearErrors();
        setIsDialogOpen(true);
    };

    const openEditDialog = (label: Label) => {
        setEditingLabel(label);
        setData({
            name: label.name,
            color: label.color || '#6366f1',
            enabled: label.enabled,
        });
        clearErrors();
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingLabel) {
            patch(workspace.labels.update(editingLabel.id).url, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.push(
                        <Notification title="Success" type="success">
                            Label updated successfully.
                        </Notification>
                    );
                },
            });
        } else {
            post(workspace.labels.store().url, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    reset();
                    toast.push(
                        <Notification title="Success" type="success">
                            Label created successfully.
                        </Notification>
                    );
                },
            });
        }
    };

    const handleDelete = (label: Label) => {
        if (confirm(`Are you sure you want to remove the label "${label.name}"? If it's not used elsewhere, it will be deleted.`)) {
            destroy(workspace.labels.destroy(label.id).url, {
                onSuccess: () => {
                    toast.push(
                        <Notification title="Success" type="success">
                            Label removed.
                        </Notification>
                    );
                },
            });
        }
    };

    const colorPresets = [
        '#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#71717a'
    ];

    return (
        <DashboardLayout title="Labels Settings">
            <SettingsLayout>
                <Head title="Labels Settings" />

                <div className="space-y-6">
                    <Heading
                        title="Labels"
                        description={`Manage labels for ${workspaceName}`}
                    />

                    <Card
                        header={{
                            content: (
                                <div className="flex items-center justify-between w-full">
                                    <div>
                                        <h3 className="text-lg font-bold">Workspace Labels</h3>
                                        <p className="text-sm text-muted-foreground">Labels help you categorize tasks and projects.</p>
                                    </div>
                                    <Button
                                        onClick={openCreateDialog}
                                        variant="solid"
                                        size="sm"
                                        icon={<Plus className="h-4 w-4" />}
                                    >
                                        Add Label
                                    </Button>
                                </div>
                            ),
                            bordered: true
                        }}
                    >
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {labels.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    No labels found for this workspace.
                                </div>
                            ) : (
                                labels.map((label) => (
                                    <div key={label.id} className="flex items-center justify-between py-4 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-xl">
                                        <div className="flex items-center space-x-3">
                                            <div 
                                                className="h-4 w-4 rounded-full shadow-sm border border-black/5" 
                                                style={{ backgroundColor: label.color }}
                                            />
                                            <div>
                                                <p className="text-sm font-bold">{label.name}</p>
                                                <p className="text-xs text-gray-500">{label.slug}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="default"
                                                size="xs"
                                                icon={<Edit2 className="h-3.5 w-3.5" />}
                                                onClick={() => openEditDialog(label)}
                                            />
                                            <Button
                                                variant="plain"
                                                size="xs"
                                                className="text-red-500 hover:text-red-600"
                                                icon={<Trash2 className="h-3.5 w-3.5" />}
                                                onClick={() => handleDelete(label)}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                <Dialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    width={450}
                >
                    <div className="p-6">
                        <h3 className="text-xl font-bold mb-2">
                            {editingLabel ? 'Edit Label' : 'Create Label'}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Define a name and color for your label.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Label Name</label>
                                <Input
                                    placeholder="e.g. High Priority"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    invalid={!!errors.name}
                                    autoFocus
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Color</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {colorPresets.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${data.color === color ? 'border-primary' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setData('color', color)}
                                        />
                                    ))}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="color"
                                        className="h-10 w-12 p-1"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                    />
                                    <Input
                                        placeholder="#000000"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="flex-1 font-mono uppercase"
                                    />
                                </div>
                                {errors.color && <p className="text-xs text-red-500">{errors.color}</p>}
                            </div>

                            <div className="mt-8 flex justify-end space-x-3">
                                <Button variant="default" type="button" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="solid" type="submit" loading={processing}>
                                    {editingLabel ? 'Update Label' : 'Create Label'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Dialog>
            </SettingsLayout>
        </DashboardLayout>
    );
}
