import type { PageProps } from '@inertiajs/core';
import { Link, usePage } from '@inertiajs/react';
import React from 'react';
import {
    PiUserCircleDuotone,
    PiLockKeyDuotone,
    PiShieldCheckDuotone,
} from 'react-icons/pi';
import AdaptiveCard from '@/components/shared/AdaptiveCard';
import { cn } from '@/lib/utils';

interface SidebarNavItem {
    title: string;
    href: string;
    icon: React.ElementType;
}

interface AccountLayoutProps {
    children: React.ReactNode;
}

interface AuthProps extends PageProps {
    cp_prefix: string;
}

export default function AdminAccountLayout({ children }: AccountLayoutProps) {
    const { url, props } = usePage<AuthProps>();
    const { cp_prefix } = props;

    const sidebarNavItems: SidebarNavItem[] = [
        {
            title: 'Profile',
            href: `/${cp_prefix}/account/profile`,
            icon: PiUserCircleDuotone,
        },
        {
            title: 'Password',
            href: `/${cp_prefix}/account/password`,
            icon: PiLockKeyDuotone,
        },
        {
            title: '2-Step verification',
            href: `/${cp_prefix}/account/two-factor`,
            icon: PiShieldCheckDuotone,
        },
    ];

    return (
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
            <aside className="lg:w-1/5">
                <nav className="flex space-x-2 lg:flex-col lg:space-y-1 lg:space-x-0">
                    {sidebarNavItems.map((item) => {
                        const isActive = url.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'hover:bg-muted flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                                    isActive
                                        ? 'bg-muted text-primary'
                                        : 'text-muted-foreground',
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <AdaptiveCard className="flex-1 lg:max-w-2xl">
                <div >{children}</div>
            </AdaptiveCard>
        </div>
    );
}
