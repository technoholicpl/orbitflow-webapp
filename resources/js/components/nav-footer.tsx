import { toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

export function NavFooter({
    items,
    className,
}: {
    items: NavItem[];
    className?: string;
}) {
    return (
        <div className={`flex flex-col gap-1 p-2 ${className || ''}`}>
            {items.map((item) => (
                <a
                    key={item.title}
                    href={toUrl(item.href as string)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                    {item.icon && (
                        <item.icon className="size-5" />
                    )}
                    <span>{item.title}</span>
                </a>
            ))}
        </div>
    );
}
