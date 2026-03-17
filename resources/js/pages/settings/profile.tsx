import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import { Button, Input, FormItem } from '@/components/ui';
import DashboardLayout from '@/layouts/DashboardLayout';
import SettingsLayout from '@/layouts/settings/layout';
import LogoutOtherBrowserSessionsForm from '@/components/logout-other-browser-sessions-form';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
    sessions,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    sessions: any[];
}) {
    const { auth } = usePage().props;

    return (
        <DashboardLayout title="Profile settings">
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div>
                        <h4 className="mb-8">Personal information</h4>
                        <Form
                            {...ProfileController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            className="space-y-6"
                        >
                            {({ processing, recentlySuccessful, errors }) => (
                                <>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormItem 
                                            label="Name" 
                                            invalid={!!errors.name}
                                            errorMessage={errors.name}
                                        >
                                            <Input
                                                id="name"
                                                defaultValue={auth.user.name}
                                                name="name"
                                                required
                                                autoComplete="name"
                                                placeholder="Full name"
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
                                                defaultValue={auth.user.email}
                                                name="email"
                                                required
                                                autoComplete="username"
                                                placeholder="Email address"
                                            />
                                        </FormItem>
                                    </div>

                                    {mustVerifyEmail &&
                                        auth.user.email_verified_at === null && (
                                            <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
                                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                                    Your email address is
                                                    unverified.{' '}
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="font-semibold underline decoration-amber-500/30 underline-offset-4 transition-colors hover:decoration-amber-500"
                                                    >
                                                        Click here to resend the
                                                        verification email.
                                                    </Link>
                                                </p>

                                                {status ===
                                                    'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                        A new verification link has
                                                        been sent to your email
                                                        address.
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                    <div className="flex justify-end items-center gap-4">
                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                                                Saved successfully
                                            </p>
                                        </Transition>
                                        <Button
                                            variant="solid"
                                            loading={processing}
                                            data-test="update-profile-button"
                                            type="submit"
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                        <LogoutOtherBrowserSessionsForm 
                            sessions={sessions}
                            action="/settings/other-browser-sessions"
                        />
                    </div>

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                        <DeleteUser />
                    </div>
                </div>
            </SettingsLayout>
        </DashboardLayout>
    );
}



