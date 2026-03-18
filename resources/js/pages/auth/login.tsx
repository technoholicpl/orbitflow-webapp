import { Form, Head } from '@inertiajs/react';
import Logo from '@/components/template/Logo';
import TextLink from '@/components/text-link';
import { Button, Checkbox, Input, FormItem } from '@/components/ui';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { useThemeStore } from '@/store/themeStore';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const mode = useThemeStore((state) => state.mode);

    return (
        <AuthLayout
            title="Welcome back!"
            description="Please enter your credentials to sign in!"
        >
            <Head title="Log in" />

            <div className="mb-8">
                <Logo
                    type="streamline"
                    mode={mode}
                    imgClass="mx-auto"
                    logoWidth={60}
                />
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
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
                                    placeholder="admin-01@ecme.com"
                                    autoComplete="email"
                                    autoFocus
                                />
                            </FormItem>

                            <FormItem
                                label="Password"
                                invalid={!!errors.password}
                                errorMessage={errors.password}
                                extra={
                                    canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-xs font-semibold underline"
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )
                                }
                            >
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    placeholder="••••••"
                                    autoComplete="current-password"
                                />
                            </FormItem>

                            <div className="flex items-center justify-between">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                >
                                    Remember me
                                </Checkbox>
                            </div>

                            <Button
                                variant="solid"
                                type="submit"
                                className="mt-2 w-full"
                                loading={processing}
                                data-test="login-button"
                            >
                                Sign In
                            </Button>
                        </div>

                        <div className="mt-8">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="border-t border-gray-200 dark:border-gray-800 flex-1 mt-[1px]" />
                                <p className="font-semibold text-xs text-gray-400">
                                    or countinue with
                                </p>
                                <div className="border-t border-gray-200 dark:border-gray-800 flex-1 mt-[1px]" />
                            </div>

                            <div className="flex items-center gap-2">
                                <Button className="flex-1" type="button" variant="default">
                                    <div className="flex items-center justify-center gap-2">
                                        <img className="h-[20px] w-[20px]" src="/img/others/google.png" alt="Google" />
                                        <span>Google</span>
                                    </div>
                                </Button>
                                <Button className="flex-1" type="button" variant="default">
                                    <div className="flex items-center justify-center gap-2">
                                        <img className="h-[20px] w-[20px]" src="/img/others/github.png" alt="Github" />
                                        <span>Github</span>
                                    </div>
                                </Button>
                            </div>
                        </div>

                        {canRegister && (
                            <div className="mt-6 text-center text-sm">
                                <span className="text-gray-500">Don't have an account yet?{' '}</span>
                                <TextLink href={register()} className="font-bold">
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 text-center text-sm font-medium text-emerald-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
