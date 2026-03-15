import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import { Dropdown, Button } from '@/components/ui';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';

export function NavUser() {
    const { auth } = usePage().props as any;

    return (
        <div className="mt-auto border-t dark:border-gray-800 p-2">
            <Dropdown 
                renderTitle={
                    <Button
                        variant="plain"
                        className="w-full flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <UserInfo user={auth.user} />
                        <ChevronsUpDown className="size-4 text-gray-500" />
                    </Button>
                }
            >
                <Dropdown.Item variant="custom" className="p-0">
                    <UserMenuContent user={auth.user} />
                </Dropdown.Item>
            </Dropdown>
        </div>
    );
}
