import { useForm, Head } from '@inertiajs/react';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import ConfirmsPassword from '@/components/confirms-password';
import Heading from '@/components/heading';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button, Tag } from '@/components/ui';
import DashboardLayout from '@/layouts/DashboardLayout';
import AccountLayout from '@/layouts/account/layout';
import { disable, enable, show } from '@/routes/two-factor';
import type { BreadcrumbItem } from '@/types';
import { useTwoFactorAuth } from '@/utils/hooks/use-two-factor-auth';

type Props = {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Two-factor authentication',
        href: show().url,
    },
];



export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    const { post: enable2fa } = useForm();
    const { delete: disable2fa } = useForm();

    return (
        <DashboardLayout title="Two-factor authentication">
            <Head title="Two-factor authentication" />

            <AccountLayout>
                <div className="space-y-6 text-sm">
                    <div>
                        <h4 className="mb-2">2-Step verification</h4>
                        <p className="text-muted-foreground mb-8">
                            Your account holds great value to hackers. Enable
                            two-step verification to safeguard your account!
                        </p>
                    </div>

                    {twoFactorEnabled ? (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <div className="flex items-center gap-2">
                                <Tag className="border-none bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                    Enabled
                                </Tag>
                                <span className="font-medium">
                                    Authentication is active
                                </span>
                            </div>
                            <p className="text-muted-foreground max-w-lg">
                                With two-factor authentication enabled, you will
                                be prompted for a secure, random pin during
                                login, which you can retrieve from the
                                TOTP-supported application on your phone.
                            </p>

                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={errors}
                            />

                            <div className="relative inline pt-4">
                                <ConfirmsPassword
                                    onConfirmed={() =>
                                        disable2fa(disable().url)
                                    }
                                >
                                    <Button
                                        variant="solid"
                                        className="border-none bg-red-600 text-white hover:bg-red-700"
                                        type="button"
                                    >
                                        <ShieldBan className="mr-2 h-4 w-4" />{' '}
                                        Disable 2FA
                                    </Button>
                                </ConfirmsPassword>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-start justify-start space-y-4">
                            <div className="flex items-center gap-2">
                                <Tag className="border-none bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
                                    Disabled
                                </Tag>
                                <span className="font-medium">
                                    Authentication is currently off
                                </span>
                            </div>
                            <p className="text-muted-foreground max-w-lg">
                                When you enable two-factor authentication, you
                                will be prompted for a secure pin during login.
                                This pin can be retrieved from a TOTP-supported
                                application on your phone.
                            </p>

                            <div className="pt-4">
                                {hasSetupData ? (
                                    <ConfirmsPassword
                                        onConfirmed={() =>
                                            setShowSetupModal(true)
                                        }
                                    >
                                        <Button variant="solid" type="button">
                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                            Continue setup
                                        </Button>
                                    </ConfirmsPassword>
                                ) : (
                                    <ConfirmsPassword
                                        onConfirmed={() =>
                                            enable2fa(enable().url, {
                                                onSuccess: () =>
                                                    setShowSetupModal(true),
                                            })
                                        }
                                    >
                                        <Button variant="solid" type="button">
                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                            Enable 2FA
                                        </Button>
                                    </ConfirmsPassword>
                                )}
                            </div>
                        </div>
                    )}

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={errors}
                    />
                </div>
            </AccountLayout>
        </DashboardLayout>
    );
}



