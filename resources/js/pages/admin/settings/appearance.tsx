import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import AdminLayout from '@/layouts/adminlayout';
import AdminSettingsLayout from '@/layouts/settings/admin-layout';

export default function AdminAppearance() {
    return (
        <AdminLayout title="Appearance settings">
            <Head title="Appearance settings" />

            <AdminSettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Appearance settings"
                        description="Update your account's appearance settings"
                    />
                    <AppearanceTabs />
                </div>
            </AdminSettingsLayout>
        </AdminLayout>
    );
}
