import { Form, Head, usePage, Link } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button, Input, FormItem } from '@/components/ui';
import AuthLayout from '@/layouts/auth-layout';
import { PageProps } from '@inertiajs/core';

interface AuthProps extends PageProps {
    cp_prefix: string;
}

export default function ForgotPassword({ status }: { status?: string }) {
    const { cp_prefix } = usePage<AuthProps>().props;

    return (
        <AuthLayout
            title="Forgot password"
            description="Enter your email to receive a password reset link"
        >
            <Head title="Forgot password" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="space-y-6">
                <Form 
                    action={cp_prefix ? `/${cp_prefix}/forgot-password` : '/forgot-password'}
                    method="post"
                >
                    {({ processing, errors }) => (
                        <>
                            <FormItem
                                label="Email address"
                                invalid={!!errors.email}
                                errorMessage={errors.email}
                            >
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    placeholder="email@example.com"
                                />
                            </FormItem>

                            <div className="my-6 flex items-center justify-start">
                                <Button
                                    variant="solid"
                                    className="w-full"
                                    loading={processing}
                                    data-test="email-password-reset-link-button"
                                >
                                    Email password reset link
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Or, return to</span>
                    <Link 
                        href={cp_prefix ? `/${cp_prefix}/login` : '/login'}
                        className="text-primary hover:underline"
                    >
                        log in
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}

