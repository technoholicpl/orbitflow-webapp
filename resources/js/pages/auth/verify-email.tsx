import { useForm, Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button, Notification, toast } from '@/components/ui';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/InputOTP/InputOTP';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const [isResending, setIsResending] = useState(false);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/email/verify');
    };

    const resend = (e: React.FormEvent) => {
        e.preventDefault();
        setIsResending(true);
        post('/email/verification-notification', {
            onFinish: () => setIsResending(false),
            onSuccess: () => {
                setData('code', '');
                toast.push(
                    <Notification title="Sukces" type="success">
                        Nowy kod został wysłany na Twój e-mail.
                    </Notification>
                );
            }
        });
    };

    return (
        <AuthLayout
            title="Weryfikacja e-mail"
            description="Wprowadź 6-cyfrowy kod, który wysłaliśmy na Twój adres e-mail, aby aktywować konto."
        >
            <Head title="Weryfikacja e-mail" />

            {status === 'verification-link-sent' && (
                <div className="mb-6 text-center text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-900/30">
                    Nowy kod weryfikacyjny został wysłany na Twój adres e-mail.
                </div>
            )}

            <form onSubmit={submit} className="space-y-8">
                <div className="flex flex-col items-center justify-center gap-4">
                    <InputOTP
                        maxLength={6}
                        value={data.code}
                        onChange={(value) => setData('code', value)}
                        containerClassName="flex justify-center"
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                    
                    {errors.code && (
                        <div className="text-red-500 text-sm font-medium">
                            {errors.code}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <Button
                        variant="solid"
                        type="submit"
                        className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-indigo-500/20"
                        loading={processing}
                        disabled={data.code.length !== 6}
                    >
                        Aktywuj konto
                    </Button>

                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Nie otrzymałeś kodu?
                        </p>
                        <button
                            type="button"
                            onClick={resend}
                            disabled={isResending}
                            className="text-indigo-600 hover:text-indigo-700 font-bold text-sm transition-colors disabled:opacity-50"
                        >
                            {isResending ? 'Wysyłanie...' : 'Wyślij ponownie'}
                        </button>
                    </div>
                </div>

                <div className="pt-4 border-t dark:border-gray-800 text-center text-xs text-gray-400 italic">
                    Podpowiedź: Kod jest ważny przez 60 minut.
                </div>
            </form>
        </AuthLayout>
    );
}

