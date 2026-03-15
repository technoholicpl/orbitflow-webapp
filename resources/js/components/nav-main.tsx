import { Link } from '@inertiajs/react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <div className="flex flex-col gap-1 p-2">
            <div className="px-2 py-1 text-xs font-semibold uppercase text-gray-500">Platform</div>
            <div className="flex flex-col gap-1">
                {items.map((item) => (
                    <Link
                        key={item.title}
                        href={item.href as string}
                        prefetch
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
                            isCurrentUrl(item.href as string) 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        {item.icon && <item.icon className="size-5" />}
                        <span>{item.title}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
