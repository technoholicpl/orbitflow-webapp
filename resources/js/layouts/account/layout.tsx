import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import { AdaptiveCard } from '@/components/shared';
import { cn } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { useCurrentUrl } from '@/utils/hooks/use-current-url';

const sidebarNavItems = [
    {
        title: 'Profile',
        href: edit().url,
        icon: null,
    },
    {
        title: 'Password',
        href: editPassword().url,
        icon: null,
    },
    {
        title: 'Two-factor auth',
        href: show().url,
        icon: null,
    },
];

export default function AccountLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="flex flex-col lg:flex-row lg:space-x-12">
            <aside className="w-full max-w-xl lg:w-48">
                <nav
                    className="flex flex-col space-y-1 space-x-0"
                    aria-label="Account"
                >
                    {sidebarNavItems.map((item, index) => {
                        const active = isCurrentOrParentUrl(item.href as any);
                        return (
                            <Link
                                key={`${item.href}-${index}`}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    active
                                        ? 'bg-primary/10 text-primary dark:bg-primary-mild/20 dark:text-primary-mild'
                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
                                )}
                            >
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <div className="bg-border my-6 h-px w-full lg:hidden" />
            <AdaptiveCard className="flex-1 md:max-w-2xl">
                <div>
                    <section className="space-y-12">{children}</section>
                </div>
            </AdaptiveCard>
        </div>
    );
}




