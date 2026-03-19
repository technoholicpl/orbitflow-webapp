import type { PageProps } from '@inertiajs/core';
import { Link, usePage } from '@inertiajs/react';
import React from 'react';
import {
    PiShieldCheckDuotone,
    PiPaletteDuotone,
    PiGearDuotone,
} from 'react-icons/pi';
import { AdaptiveCard } from '@/components/shared';
import { cn } from '@/lib/utils';

interface SidebarNavItem {
    title: string;
    href: string;
    icon: React.ElementType;
}

interface SettingsLayoutProps {
    children: React.ReactNode;
}

interface AuthProps extends PageProps {
    cp_prefix: string;
}

export default function AdminSettingsLayout({ children }: SettingsLayoutProps) {
    const { url, props } = usePage<AuthProps>();
    const { cp_prefix } = props;

    const sidebarNavItems: SidebarNavItem[] = [
        {
            title: 'Appearance',
            href: `/${cp_prefix}/settings/appearance`,
            icon: PiPaletteDuotone,
        },
        {
            title: 'Admins',
            href: `/${cp_prefix}/settings/admins`,
            icon: PiShieldCheckDuotone,
        },
        {
            title: 'Action Types',
            href: `/${cp_prefix}/settings/action-types`,
            icon: PiGearDuotone,
        },
    ];

    return (
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside className="lg:w-1/5">
                <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
                    {sidebarNavItems.map((item) => {
                        const isActive = url.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-muted',
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
