import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage, useForm } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Dashboard/Account/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import LogoutOtherBrowserSessionsForm from '@/components/logout-other-browser-sessions-form';
import { Button, Input, FormItem } from '@/components/ui';
import DashboardLayout from '@/layouts/DashboardLayout';
import AccountLayout from '@/layouts/account/layout';
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

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: auth.user.name || '',
        email: auth.user.email || '',
        avatar: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(ProfileController.update.url(), {
            preserveScroll: true,
            onSuccess: () => {
                // Handle success if needed
            },
        });
    };

    return (
        <DashboardLayout title="Profile settings">
            <Head title="Profile settings" />

            <AccountLayout>
                <div className="space-y-6">
                    <div>
                        <h4 className="mb-8">Personal information</h4>
                        <form
                            onSubmit={submit}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="relative group">
                                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                                        {auth.user.avatar_url ? (
                                            <img src={`/storage/${auth.user.avatar_url}`} alt={auth.user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="text-2xl font-bold text-primary">
                                                {auth.user.name.charAt(0).toUpperCase()}
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

                            <div className="grid gap-4 md:grid-cols-2">
                                <FormItem
                                    label="Name"
                                    invalid={!!errors.name}
                                    errorMessage={errors.name}
                                >
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
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
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder="Email address"
                                    />
                                </FormItem>
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at ===
                                    null && (
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
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
                                                A new verification link
                                                has been sent to your
                                                email address.
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center justify-end gap-4">
                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
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
                        </form>
                    </div>

                    <div className="border-t border-gray-100 pt-6 dark:border-gray-800">
                        <LogoutOtherBrowserSessionsForm
                            sessions={sessions}
                            action="/settings/other-browser-sessions"
                        />
                    </div>

                    <div className="border-t border-gray-100 pt-6 dark:border-gray-800">
                        <DeleteUser />
                    </div>
                </div>
            </AccountLayout>
        </DashboardLayout>
    );
}



