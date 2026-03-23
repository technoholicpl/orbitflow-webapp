import type { PageProps } from '@inertiajs/core';
import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import Heading from '@/components/heading';
import LogoutOtherBrowserSessionsForm from '@/components/logout-other-browser-sessions-form';
import { Button, Input, FormItem } from '@/components/ui';
import AdminAccountLayout from '@/layouts/account/admin-layout';
import AdminLayout from '@/layouts/adminlayout';

interface AuthProps extends PageProps {
    auth: {
        user: {
            name: string;
            email: string;
            avatar_url?: string;
        }
    };
    cp_prefix: string;
    sessions: any[];
}

export default function AdminProfile({ sessions }: { sessions: any[] }) {
    const { auth, cp_prefix } = usePage<AuthProps>().props;
    const { user } = auth;

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        avatar: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/${cp_prefix}/account/profile`);
    };

    return (
        <AdminLayout title="Profile settings">
            <Head title="Profile settings" />

            <AdminAccountLayout>
                <div className="space-y-6">
                    <section>
                        <Heading
                            title="Personal information"
                            description="Update your personal details and email address."
                        />

                        <form onSubmit={submit} className="mt-6 space-y-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative group">
                                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                                        {user?.avatar_url ? (
                                            <img src={`/storage/${user.avatar_url}`} alt={user?.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-primary">
                                                {user?.name?.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-2 text-center">
                                        <input
                                            type="file"
                                            id="avatar"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setData('avatar', file);
                                                }
                                            }}
                                        />
                                        <label 
                                            htmlFor="avatar"
                                            className="text-xs font-semibold text-primary cursor-pointer hover:underline"
                                        >
                                            Change Photo
                                        </label>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Profile Photo</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Recommended: Square image, max 2MB (JPG, PNG).
                                    </p>
                                    {errors.avatar && <p className="text-xs text-red-500 mt-1">{errors.avatar}</p>}
                                </div>
                            </div>
                            <FormItem
                                label="Name"
                                invalid={!!errors.name}
                                errorMessage={errors.name}
                            >
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    required
                                    autoComplete="name"
                                />
                            </FormItem>

                            <FormItem
                                label="Email address"
                                invalid={!!errors.email}
                                errorMessage={errors.email}
                            >
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                    required
                                    autoComplete="username"
                                />
                            </FormItem>

                            <div className="flex items-center gap-4">
                                <Button
                                    variant="solid"
                                    type="submit"
                                    loading={processing}
                                >
                                    Save changes
                                </Button>

                                {recentlySuccessful && (
                                    <p className="text-sm text-emerald-600">
                                        Saved successfully.
                                    </p>
                                )}
                            </div>
                        </form>
                    </section>

                    <hr className="border-gray-100 dark:border-gray-800" />

                    <section>
                        <LogoutOtherBrowserSessionsForm
                            sessions={sessions}
                            action={`/${cp_prefix}/settings/other-browser-sessions`}
                        />
                    </section>
                </div>
            </AdminAccountLayout>
        </AdminLayout>
    );
}
