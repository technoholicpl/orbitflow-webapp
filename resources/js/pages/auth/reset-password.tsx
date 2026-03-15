import { Form, Head } from '@inertiajs/react';
import { Button, Input, FormItem } from '@/components/ui';
import AuthLayout from '@/layouts/auth-layout';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    return (
        <AuthLayout
            title="Reset password"
            description="Please enter your new password below"
        >
            <Head title="Reset password" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
            >
                {({ processing, errors }) => (
                    <div className="grid gap-4">
                        <FormItem
                            label="Email"
                            invalid={!!errors.email}
                            errorMessage={errors.email}
                        >
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                readOnly
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
                                name="password"
                                autoComplete="new-password"
                                autoFocus
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
                                name="password_confirmation"
                                autoComplete="new-password"
                                placeholder="Confirm password"
                            />
                        </FormItem>

                        <Button
                            variant="solid"
                            type="submit"
                            className="mt-4 w-full"
                            loading={processing}
                            data-test="reset-password-button"
                        >
                            Reset password
                        </Button>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}

