import { Breadcrumbs } from '@/components/breadcrumbs';
import SideNavToggle from '@/components/template/SideNavToggle';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-800 px-6 transition-[width,height] ease-linear md:px-4">
            <div className="flex items-center gap-2">
                <SideNavToggle className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
        </header>
    );
}
