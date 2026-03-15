import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Menu, Search } from 'lucide-react';
import { useState } from 'react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, Button, Dropdown, Drawer, Tooltip } from '@/components/ui';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn, toUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
        icon: LayoutGrid,
    },
];

const rightNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props;
    const getInitials = useInitials();
    const { isCurrentUrl } = useCurrentUrl();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    return (
        <>
            <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden mr-2">
                        <Button
                            variant="plain"
                            className="size-10 p-2"
                            onClick={() => setIsDrawerOpen(true)}
                        >
                            <Menu className="size-6" />
                        </Button>
                        <Drawer
                            title="Navigation"
                            isOpen={isDrawerOpen}
                            onClose={() => setIsDrawerOpen(false)}
                            placement="left"
                            width={280}
                        >
                            <div className="flex flex-col gap-4 p-4">
                                {mainNavItems.map((item) => (
                                    <Link
                                        key={item.title}
                                        href={item.href || '#'}
                                        className="flex items-center gap-2 font-medium"
                                        onClick={() => setIsDrawerOpen(false)}
                                    >
                                        {item.icon && <item.icon className="size-5" />}
                                        <span>{item.title}</span>
                                    </Link>
                                ))}
                                <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
                                {rightNavItems.map((item) => (
                                    <a
                                        key={item.title}
                                        href={toUrl(item.href || '#')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 font-medium"
                                    >
                                        {item.icon && <item.icon className="size-5" />}
                                        <span>{item.title}</span>
                                    </a>
                                ))}
                            </div>
                        </Drawer>
                    </div>

                    <Link
                        href={dashboard().url}
                        prefetch
                        className="flex items-center space-x-2"
                    >
                        <AppLogoIcon className="size-6 fill-current" />
                        <span className="font-bold text-xl hidden sm:block">OrbitFlow</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="ml-8 hidden lg:flex items-center gap-6 h-full">
                        {mainNavItems.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href || '#'}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-blue-600 dark:hover:text-blue-400 relative h-full flex items-center",
                                    isCurrentUrl(item.href || '') && "text-blue-600 dark:text-blue-400 font-bold"
                                )}
                            >
                                {item.title}
                                {isCurrentUrl(item.href || '') && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400" />
                                )}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-1">
                            {rightNavItems.map((item) => (
                                <Tooltip key={item.title} title={item.title}>
                                    <a
                                        href={toUrl(item.href || '#')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                                    >
                                        {item.icon && <item.icon className="size-5" />}
                                    </a>
                                </Tooltip>
                            ))}
                        </div>
                        
                        <Dropdown 
                            renderTitle={
                                <Button
                                    variant="plain"
                                    className="size-10 rounded-full p-1"
                                >
                                    <Avatar 
                                        src={auth.user.avatar} 
                                        shape="circle" 
                                        size={32}
                                    >
                                        {getInitials(auth.user.name)}
                                    </Avatar>
                                </Button>
                            }
                        >
                            <Dropdown.Item variant="custom" className="p-0">
                                <UserMenuContent user={auth.user} />
                            </Dropdown.Item>
                        </Dropdown>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 0 && (
                <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                    <div className="mx-auto flex h-10 items-center px-4 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}






