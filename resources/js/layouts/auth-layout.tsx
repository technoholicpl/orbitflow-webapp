import { Head } from '@inertiajs/react';
import React from 'react';

export default function AuthLayout({
    children,
    title,
    description,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description?: string;
}) {
    return (
        <div className="flex h-screen p-6 bg-white dark:bg-gray-800" {...props}>
            <Head title={title} />
            <div className="flex flex-col justify-center items-center flex-1">
                <div className="w-full xl:max-w-[450px] px-8 max-w-[380px]">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold mb-2">{title}</h2>
                        {description && <p className="text-gray-500 dark:text-gray-400">{description}</p>}
                    </div>
                    {children}
                </div>
            </div>
            <div className="py-6 px-10 lg:flex flex-col flex-1 justify-between hidden rounded-3xl items-end relative xl:max-w-[520px] 2xl:max-w-[720px]">
                <img
                    src="/img/others/auth-side-bg.png"
                    className="absolute h-full w-full top-0 left-0 rounded-3xl object-cover"
                    alt="Auth background"
                />
            </div>
        </div>
    );
}
