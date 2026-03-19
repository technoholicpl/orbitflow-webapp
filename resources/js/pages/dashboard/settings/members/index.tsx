import { Head, useForm, router } from '@inertiajs/react';
import axios from 'axios';
import {  Plus, Trash2, Shield, Mail, RotateCcw } from 'lucide-react';
import React, { useState } from 'react';
import Heading from '@/components/heading';
import {
    Button,
    Card,
    Input,
    Select,
    Switcher,
    Dialog,
    Notification,
    toast,
} from '@/components/ui';
import DashboardLayout from '@/layouts/DashboardLayout';
import SettingsLayout from '@/layouts/settings/layout';
import workspace from '@/routes/workspace';

interface Member {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
    role: string;
    joined_at: string;
    is_owner: boolean;
}

interface Invitation {
    id: number;
    email: string;
    role: string;
    created_at: string;
    token: string;
    is_pending: boolean;
}

interface Props {
    members?: Member[];
    invitations?: Invitation[];
    availableRoles?: string[];
    availablePermissions?: string[];
    workspaceName?: string;
}

export default function WorkspaceMembers({
    members = [],
    invitations = [],
    availableRoles = [],
    availablePermissions = [],
    workspaceName = ''
}: Props) {
    const [isAdding, setIsAdding] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
    const [memberPermissions, setMemberPermissions] = useState<string[]>([]);
    const [isSavingPermissions, setIsSavingPermissions] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        role: 'Employee',
    });

    const updateForm = useForm({
        role: '',
    });

    const deleteForm = useForm({});

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        post(workspace.members.store().url, {
            onSuccess: () => {
                reset();
                setIsAdding(false);
                toast.push(
                    <Notification title="Success" type="success">
                        Member added successfully.
                    </Notification>
                );
            },
        });
    };

    const handleUpdateRole = (id: number, role: string) => {
        updateForm.setData('role', role);
        updateForm.patch(workspace.members.update(id).url, {
            onSuccess: () => {
                toast.push(
                    <Notification title="Success" type="success">
                        Role updated.
                    </Notification>
                );
            },
        });
    };

    const handleRemoveMember = (id: number) => {
        if (confirm('Are you sure you want to remove this member?')) {
            deleteForm.delete(`/settings/members/${id}`, {
                onSuccess: () => {
                    toast.push(
                        <Notification title="Success" type="success">
                            Member removed.
                        </Notification>
                    );
                },
            });
        }
    };

    const handleCancelInvitation = (id: number) => {
        if (confirm('Czy na pewno chcesz anulować to zaproszenie?')) {
            router.delete(`/settings/invitations/${id}`, {
                onSuccess: () => {
                    toast.push(
                        <Notification title="Sukces" type="success">
                            Zaproszenie zostało anulowane.
                        </Notification>
                    );
                },
            });
        }
    };

    const handleResendInvitation = (id: number) => {
        router.post(`/settings/invitations/${id}/resend`, {}, {
            onSuccess: () => {
                toast.push(
                    <Notification title="Sukces" type="success">
                        Zaproszenie zostało wysłane ponownie.
                    </Notification>
                );
            },
        });
    };

    const openPermissions = async (member: Member) => {
        setSelectedMember(member);
        setIsPermissionsOpen(true);
        // Fetch current permissions
        try {
            const response = await axios.get(`/settings/members/${member.id}/permissions`);
            setMemberPermissions(response.data.permissions || []);
        } catch (error) {
            console.error('Failed to fetch permissions', error);
            setMemberPermissions([]);
        }
    };

    const togglePermission = (permission: string) => {
        setMemberPermissions(prev =>
            prev.includes(permission)
                ? prev.filter(p => p !== permission)
                : [...prev, permission]
        );
    };

    const savePermissions = () => {
        if (!selectedMember) return;
        setIsSavingPermissions(true);

        router.patch(`/settings/members/${selectedMember.id}/permissions`, {
            permissions: memberPermissions
        }, {
            onSuccess: () => {
                setIsSavingPermissions(false);
                setIsPermissionsOpen(false);
                toast.push(
                    <Notification title="Success" type="success">
                        Permissions updated.
                    </Notification>
                );
            },
            onError: () => {
                setIsSavingPermissions(false);
                toast.push(
                    <Notification title="Error" type="danger">
                        Failed to update permissions.
                    </Notification>
                );
            }
        });
    };

    const roleOptions = availableRoles.map(role => ({ label: role, value: role }));

    return (
         <DashboardLayout title="Workspace Members">
        <SettingsLayout>
            <Head title="Workspace Members" />

            <div className="space-y-6">
                <Heading
                    title="Workspace Members"
                    description={`Manage members and roles for ${workspaceName}`}
                />

                <Card
                    header={{
                        content: (
                            <div className="flex items-center justify-between w-full">
                                <div>
                                    <h3 className="text-lg font-bold">Members</h3>
                                    <p className="text-sm text-muted-foreground">Manage your team and their access levels.</p>
                                </div>
                                <Button
                                    onClick={() => setIsAdding(!isAdding)}
                                    variant={isAdding ? 'default' : 'solid'}
                                    size="sm"
                                    icon={isAdding ? null : <Plus className="h-4 w-4" />}
                                >
                                    {isAdding ? 'Cancel' : 'Add Member'}
                                </Button>
                            </div>
                        ),
                        bordered: true
                    }}
                >
                    {isAdding && (
                        <form onSubmit={handleAddMember} className="mb-8 p-4 border rounded-xl bg-gray-50 dark:bg-gray-800/50 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="colleague@example.com"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        invalid={!!errors.email}
                                    />
                                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Initial Role</label>
                                    <Select
                                        options={roleOptions}
                                        value={roleOptions.find(opt => opt.value.toLowerCase() === data.role.toLowerCase())}
                                        onChange={(opt: any) => setData('role', opt.value)}
                                    />
                                    {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                                </div>
                            </div>
                            <Button type="submit" variant="solid" loading={processing}>
                                Send Invitation
                            </Button>
                        </form>
                    )}

                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between py-4">
                                <div className="flex items-center space-x-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                                        {member.avatar_url ? (
                                            <img src={`/storage/${member.avatar_url}`} alt={member.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold text-primary">
                                                {member.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{member.name}</p>
                                        <p className="text-xs text-gray-500">{member.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    {member.is_owner ? (
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary border border-primary/20">
                                            Owner
                                        </span>
                                    ) : (
                                        <>
                                            <div className="w-[140px]">
                                                <Select
                                                    size="sm"
                                                    options={roleOptions.filter(opt => opt.value !== 'Owner')}
                                                    value={roleOptions.find(opt => opt.value.toLowerCase() === member.role?.toLowerCase())}
                                                    onChange={(opt: any) => handleUpdateRole(member.id, opt.value)}
                                                    isDisabled={updateForm.processing}
                                                />
                                            </div>
                                            <Button
                                                variant="default"
                                                size="xs"
                                                icon={<Shield className="h-3.5 w-3.5" />}
                                                onClick={() => openPermissions(member)}
                                                title="Permissions"
                                            />
                                            <Button
                                                variant="plain"
                                                size="xs"
                                                className="text-red-500 hover:text-red-600"
                                                icon={<Trash2 className="h-3.5 w-3.5" />}
                                                onClick={() => handleRemoveMember(member.id)}
                                                disabled={deleteForm.processing}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {invitations.map((invitation) => (
                            <div key={`inv-${invitation.id}`} className="flex items-center justify-between py-4 opacity-70">
                                <div className="flex items-center space-x-4">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-600">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-gray-400 italic">Oczekuje na akceptację...</p>
                                        </div>
                                        <p className="text-xs text-gray-500">{invitation.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-500 border border-gray-200 dark:border-gray-700">
                                        {invitation.role}
                                    </span>
                                    <Button
                                        variant="plain"
                                        size="xs"
                                        icon={<RotateCcw className="h-3.5 w-3.5" />}
                                        onClick={() => handleResendInvitation(invitation.id)}
                                        title="Wyślij ponownie"
                                    />
                                    <Button
                                        variant="plain"
                                        size="xs"
                                        className="text-red-500 hover:text-red-600"
                                        icon={<Trash2 className="h-3.5 w-3.5" />}
                                        onClick={() => handleCancelInvitation(invitation.id)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <Dialog
                isOpen={isPermissionsOpen}
                onClose={() => setIsPermissionsOpen(false)}
                width={600}
            >
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">Permissions: {selectedMember?.name}</h3>
                    <p className="text-sm text-gray-500 mb-6">Grant or revoke granular access to specific features.</p>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {availablePermissions.map((permission) => (
                            <div key={permission} className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <span className="text-sm font-medium capitalize">{permission.replace(/_/g, ' ')}</span>
                                <Switcher
                                    checked={memberPermissions.includes(permission)}
                                    onChange={() => togglePermission(permission)}
                                />
                            </div>
                        ))}
                        {availablePermissions.length === 0 && (
                            <p className="text-sm text-gray-400 italic py-4 text-center">No granular permissions available.</p>
                        )}
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <Button variant="default" onClick={() => setIsPermissionsOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="solid" onClick={savePermissions} loading={isSavingPermissions}>
                            Save Changes
                        </Button>
                    </div>
                </div>
            </Dialog>
        </SettingsLayout>
        </DashboardLayout>
    );
}
