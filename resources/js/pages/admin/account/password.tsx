import { Transition } from '@headlessui/react';
import type { PageProps } from '@inertiajs/core';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import Heading from '@/components/heading';
import { Button, Input, FormItem } from '@/components/ui';
import AdminAccountLayout from '@/layouts/account/admin-layout';
import AdminLayout from '@/layouts/adminlayout';


interface AuthProps extends PageProps {
    cp_prefix: string;
}

export default function AdminPassword() {
    const { cp_prefix } = usePage<AuthProps>().props;
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, put, processing, errors, reset, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/${cp_prefix}/settings/password`, {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AdminLayout title="Password settings">
            <Head title="Password settings" />

            <AdminAccountLayout>
                <div className="space-y-6">
                    <section>
                        <Heading
                            title="Update password"
                            description="Ensure your account is using a long, random password to stay secure."
                        />

                        <form onSubmit={submit} className="mt-6 space-y-6">
                            <FormItem
                                label="Current password"
                                invalid={!!errors.current_password}
                                errorMessage={errors.current_password}
                            >
                                <Input
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) =>
                                        setData(
                                            'current_password',
                                            e.target.value,
                                        )
                                    }
                                    autoComplete="current-password"
                                />
                            </FormItem>

                            <FormItem
                                label="New password"
                                invalid={!!errors.password}
                                errorMessage={errors.password}
                            >
                                <Input
                                    id="password"
                                    ref={passwordInput}
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    autoComplete="new-password"
                                />
                            </FormItem>

                            <FormItem
                                label="Confirm password"
                                invalid={!!errors.password_confirmation}
                                errorMessage={errors.password_confirmation}
                            >
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    autoComplete="new-password"
                                />
                            </FormItem>

                            <div className="flex items-center gap-4">
                                <Button
                                    variant="solid"
                                    type="submit"
                                    loading={processing}
                                >
                                    Update Password
                                </Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm font-medium text-emerald-600">
                                        Password updated.
                                    </p>
                                </Transition>
                            </div>
                        </form>
                    </section>
                </div>
            </AdminAccountLayout>
        </AdminLayout>
    );
}
