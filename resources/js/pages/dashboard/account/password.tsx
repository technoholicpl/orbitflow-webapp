import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';
import PasswordController from '@/actions/App/Http/Controllers/Dashboard/Account/PasswordController';
import { Button, Input, FormItem } from '@/components/ui';
import DashboardLayout from '@/layouts/DashboardLayout';
import AccountLayout from '@/layouts/account/layout';
import { edit } from '@/routes/user-password';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: edit().url,
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <DashboardLayout title="Password settings">
            <Head title="Password settings" />

            <AccountLayout>
                <div className="space-y-6">
                    <div>
                        <h4 className="mb-2">Password</h4>
                        <p className="text-muted-foreground mb-8">
                            Remember, your password is your digital key to your account. Keep it safe, keep it secure!
                        </p>

                        <Form
                            {...PasswordController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            resetOnError={[
                                'password',
                                'password_confirmation',
                                'current_password',
                            ]}
                            resetOnSuccess
                            onError={(errors) => {
                                if (errors.password) {
                                    passwordInput.current?.focus();
                                }

                                if (errors.current_password) {
                                    currentPasswordInput.current?.focus();
                                }
                            }}
                            className="space-y-6"
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <>
                                    <div className="grid gap-4">
                                        <FormItem
                                            label="Current password"
                                            invalid={!!errors.current_password}
                                            errorMessage={errors.current_password}
                                        >
                                            <Input
                                                id="current_password"
                                                ref={currentPasswordInput}
                                                name="current_password"
                                                type="password"
                                                autoComplete="current-password"
                                                placeholder="•••••••••"
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
                                                name="password"
                                                type="password"
                                                autoComplete="new-password"
                                                placeholder="•••••••••"
                                            />
                                        </FormItem>

                                        <FormItem
                                            label="Confirm password"
                                            invalid={!!errors.password_confirmation}
                                            errorMessage={errors.password_confirmation}
                                        >
                                            <Input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                autoComplete="new-password"
                                                placeholder="•••••••••"
                                            />
                                        </FormItem>
                                    </div>

                                    <div className="flex justify-end items-center gap-4">
                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                                Updated successfully
                                            </p>
                                        </Transition>
                                        <Button
                                            variant="solid"
                                            loading={processing}
                                            data-test="update-password-button"
                                            type="submit"
                                        >
                                            Update Password
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            </AccountLayout>
        </DashboardLayout>
    );
}



