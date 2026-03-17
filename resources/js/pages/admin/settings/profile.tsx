import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import Heading from '@/components/heading';
import { Button, Input, FormItem } from '@/components/ui';
import AdminLayout from '@/layouts/adminlayout';
import AdminSettingsLayout from '@/layouts/settings/admin-layout';
import LogoutOtherBrowserSessionsForm from '@/components/logout-other-browser-sessions-form';
import type { PageProps } from '@inertiajs/core';

interface AuthProps extends PageProps {
    auth: {
        user: {
            name: string;
            email: string;
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
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/${cp_prefix}/settings/profile`);
    };

    return (
        <AdminLayout title="Profile settings">
            <Head title="Profile settings" />

            <AdminSettingsLayout>
                <div className="space-y-6">
                    <section>
                        <Heading
                            title="Personal information"
                            description="Update your personal details and email address."
                        />
                        
                        <form onSubmit={submit} className="mt-6 space-y-6">
                            <FormItem
                                label="Name"
                                invalid={!!errors.name}
                                errorMessage={errors.name}
                            >
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
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
                                    onChange={(e) => setData('email', e.target.value)}
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
            </AdminSettingsLayout>
        </AdminLayout>
    );
}
