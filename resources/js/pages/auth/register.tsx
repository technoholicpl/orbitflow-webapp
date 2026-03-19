import { Form, Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { Button, Input, FormItem } from '@/components/ui';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to create your account"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4">
                            <FormItem
                                label="Name"
                                invalid={!!errors.name}
                                errorMessage={errors.name}
                            >
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    name="name"
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
                                    required
                                    name="email"
                                    placeholder="email@example.com"
                                />
                            </FormItem>

                            <FormItem
                                label="Password"
                                invalid={!!errors.password}
                                errorMessage={errors.password}
                            >
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    name="password"
                                    placeholder="Password"
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
                                    required
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                />
                            </FormItem>

                            <Button
                                variant="solid"
                                type="submit"
                                className="mt-2 w-full"
                                loading={processing}
                                data-test="register-user-button"
                            >
                                Create account
                            </Button>
                        </div>

                        <div className="mt-4">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="border-t border-gray-200 dark:border-gray-800 flex-1 mt-px" />
                                <p className="font-semibold text-xs text-gray-400 text-nowrap">
                                    lub zarejestruj się przez
                                </p>
                                <div className="border-t border-gray-200 dark:border-gray-800 flex-1 mt-px" />
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <Button className="w-full" type="button" variant="default" onClick={() => window.location.href = '/auth/social/google'}>
                                    <div className="flex items-center justify-center gap-2">
                                        <img className="h-[20px] w-[20px]" src="/img/others/google.png" alt="Google" />
                                    </div>
                                </Button>
                                <Button className="w-full" type="button" variant="default" onClick={() => window.location.href = '/auth/social/github'}>
                                    <div className="flex items-center justify-center gap-2">
                                        <img className="h-[20px] w-[20px]" src="/img/others/github.png" alt="Github" />
                                    </div>
                                </Button>
                                <Button className="w-full" type="button" variant="default" onClick={() => window.location.href = '/auth/social/facebook'}>
                                    <div className="flex items-center justify-center gap-2">
                                        <img className="h-[20px] w-[20px]" src="/img/others/facebook.png" alt="Facebook" />
                                    </div>
                                </Button>
                            </div>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}

