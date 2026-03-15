import { Link } from '@inertiajs/react';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function Breadcrumbs({
    breadcrumbs,
}: {
    breadcrumbs: BreadcrumbItemType[];
}) {
    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    return (
                        <li key={index} className="flex items-center">
                            {index > 0 && (
                                <span className="mx-2 text-gray-400">/</span>
                            )}
                            {isLast ? (
                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                    {item.title}
                                </span>
                            ) : (
                                <Link 
                                    href={item.href}
                                    className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                                >
                                    {item.title}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

