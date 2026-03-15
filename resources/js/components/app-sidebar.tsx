import { Link } from '@inertiajs/react';
import { BookOpen, FolderGit2, LayoutGrid } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <aside className="w-64 flex flex-col h-full bg-white dark:bg-gray-900 border-r dark:border-gray-800 sticky top-0">
            <div className="h-16 flex items-center px-4 border-b dark:border-gray-800">
                <Link href={dashboard().url} prefetch>
                    <AppLogo />
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto">
                <NavMain items={mainNavItems} />
            </div>

            <div className="p-2 flex flex-col gap-2">
                <NavFooter items={footerNavItems} />
                <NavUser />
            </div>
        </aside>
    );
}
