import { Head, useForm, usePage } from '@inertiajs/react';
import { Trash2, ShieldCheck } from 'lucide-react';
import React from 'react';

import Heading from '@/components/heading';
import {
    Button,
    Card,
    Select,
    Notification,
    toast,
} from '@/components/ui';
import AdminLayout from '@/layouts/adminlayout';
import AdminSettingsLayout from '@/layouts/settings/admin-layout';


interface AdminMember {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
}

interface PageProps {
    admins: AdminMember[];
    availableRoles: string[];
    cp_prefix: string;
    [key: string]: unknown;
}

export default function AdminManagement({ admins, availableRoles }: PageProps) {
    const { props } = usePage<PageProps>();
    const { cp_prefix } = props;

    const updateForm = useForm({
        role: '',
    });

    const deleteForm = useForm({});

    const handleUpdateRole = (id: number, role: string) => {
        updateForm.setData('role', role);
        updateForm.patch(`/${cp_prefix}/admins/${id}/role`, {
            onSuccess: () => {
                toast.push(
                    <Notification title="Success" type="success">
                        Admin role updated.
                    </Notification>
                );
            },
        });
    };

    const handleRemoveAdmin = (id: number) => {
        if (confirm('Are you sure you want to remove this administrator?')) {
            deleteForm.delete(`/${cp_prefix}/admins/${id}`, {
                onSuccess: () => {
                    toast.push(
                        <Notification title="Success" type="success">
                            Admin removed.
                        </Notification>
                    );
                },
            });
        }
    };

    const roleOptions = availableRoles.map(role => ({ label: role, value: role }));

    return (
       <AdminLayout title="Appearance settings">
        <AdminSettingsLayout>
            <Head title="System Administrators" />

            <div className="space-y-6">
                <Heading
                    title="System Administrators"
                    description="Manage administrative users and their global roles."
                />

                <Card
                    header={{
                        content: (
                            <div>
                                <h3 className="text-lg font-bold">Admin Users</h3>
                                <p className="text-sm text-muted-foreground">Global admins with access to the control panel.</p>
                            </div>
                        ),
                        bordered: true
                    }}
                >
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {admins.map((admin) => (
                            <div key={admin.id} className="flex items-center justify-between py-4">
                                <div className="flex items-center space-x-4">
                                    <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                        <ShieldCheck className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{admin.name}</p>
                                        <p className="text-xs text-gray-500">{admin.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div className="w-[160px]">
                                        <Select
                                            size="sm"
                                            options={roleOptions}
                                            value={roleOptions.find(opt => opt.value === admin.role)}
                                            onChange={(opt: any) => handleUpdateRole(admin.id, opt.value)}
                                            isDisabled={updateForm.processing}
                                        />
                                    </div>
                                    <Button
                                        variant="plain"
                                        size="xs"
                                        className="text-red-500 hover:text-red-600"
                                        icon={<Trash2 className="h-3.5 w-3.5" />}
                                        onClick={() => handleRemoveAdmin(admin.id)}
                                        disabled={deleteForm.processing}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </AdminSettingsLayout>
        </AdminLayout>
    );
}
