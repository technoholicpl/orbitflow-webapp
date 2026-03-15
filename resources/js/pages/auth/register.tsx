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

