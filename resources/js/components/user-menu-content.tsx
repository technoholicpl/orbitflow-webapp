import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import { Dropdown } from '@/components/ui';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <div className="min-w-[240px]">
            <div className="flex items-center gap-2 px-3 py-2 text-left text-sm border-b dark:border-gray-700">
                <UserInfo user={user} showEmail={true} />
            </div>
            
            <div className="p-1">
                <Link
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors cursor-pointer"
                    href={edit()}
                    prefetch
                    onClick={cleanup}
                >
                    <Settings className="size-4" />
                    <span>Settings</span>
                </Link>
            </div>
            
            <div className="border-t dark:border-gray-700 p-1">
                <Link
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors cursor-pointer w-full text-left"
                    href={logout()}
                    method="post"
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="size-4" />
                    <span>Log out</span>
                </Link>
            </div>
        </div>
    );
}

