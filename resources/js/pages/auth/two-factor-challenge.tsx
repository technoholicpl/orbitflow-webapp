import type { PageProps } from '@inertiajs/core';
import { Form, Head, usePage } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import {
    Button,
    Input,
    FormItem,
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/two-factor/login';
import { OTP_MAX_LENGTH } from '@/utils/hooks/use-two-factor-auth';

interface AuthProps extends PageProps {
    cp_prefix: string;
}

export default function TwoFactorChallenge() {
    const { cp_prefix } = usePage<AuthProps>().props;
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Recovery code',
                description:
                    'Please confirm access to your account by entering one of your emergency recovery codes.',
                toggleText: 'login using an authentication code',
            };
        }

        return {
            title: 'Authentication code',
            description:
                'Enter the authentication code provided by your authenticator application.',
            toggleText: 'login using a recovery code',
        };
    }, [showRecoveryInput]);

    const toggleRecoveryMode = useMemo(() => (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    }, [showRecoveryInput]);

    return (
        <AuthLayout
            title={authConfigContent.title}
            description={authConfigContent.description}
        >
            <Head title="Two-factor authentication" />

            <div className="space-y-6">
                <Form
                    {...store.form()}
                    action={cp_prefix ? `/${cp_prefix}${store.url()}` : store.url()}
                    className="space-y-4"
                    resetOnError
                    resetOnSuccess={!showRecoveryInput}
                >
                    {({ errors, processing, clearErrors }) => (
                        <>
                            {showRecoveryInput ? (
                                <>
                                    <FormItem
                                        label="Recovery Code"
                                        invalid={!!errors.recovery_code}
                                        errorMessage={errors.recovery_code}
                                    >
                                        <Input
                                            name="recovery_code"
                                            type="text"
                                            placeholder="Enter recovery code"
                                            autoFocus={showRecoveryInput}
                                            required
                                        />
                                    </FormItem>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                    <div className="flex w-full items-center justify-center">
                                        <InputOTP
                                            name="code"
                                            maxLength={OTP_MAX_LENGTH}
                                            value={code}
                                            onChange={(value) => setCode(value)}
                                            disabled={processing}
                                            pattern={REGEXP_ONLY_DIGITS}
                                        >
                                            <InputOTPGroup className="gap-2">
                                                <InputOTPSlot index={0} />
                                                <InputOTPSlot index={1} />
                                                <InputOTPSlot index={2} />
                                                <InputOTPSlot index={3} />
                                                <InputOTPSlot index={4} />
                                                <InputOTPSlot index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    <InputError message={errors.code} />
                                </div>
                            )}

                            <Button
                                variant="solid"
                                type="submit"
                                className="w-full"
                                loading={processing}
                            >
                                Continue
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                <span>or you can </span>
                                <button
                                    type="button"
                                    className="cursor-pointer text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    onClick={() =>
                                        toggleRecoveryMode(clearErrors)
                                    }
                                >
                                    {authConfigContent.toggleText}
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AuthLayout>
    );
}

