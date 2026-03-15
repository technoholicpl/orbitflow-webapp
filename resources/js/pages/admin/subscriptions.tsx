import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/adminlayout'

export default function SubscriptionsList() {
    return (
        <AdminLayout>
            <Head title="Subscriptions" />
            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold">Subscriptions & Billing</h1>
                    <p className="text-gray-500 text-sm">Monitor revenue, subscription states, and platform growth.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="p-6 bg-white dark:bg-gray-900 border rounded-xl shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Monthly MRR</div>
                        <div className="text-2xl font-black text-indigo-600">$12,450</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-900 border rounded-xl shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Trials</div>
                        <div className="text-2xl font-black text-emerald-600">42</div>
                    </div>
                    <div className="p-6 bg-white dark:bg-gray-900 border rounded-xl shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Churn Rate</div>
                        <div className="text-2xl font-black text-rose-600">1.2%</div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 border rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center">
                        <h3 className="font-bold">Active Subscriptions</h3>
                        <div className="flex gap-2">
                             <input type="text" placeholder="Search..." className="text-xs border rounded-lg px-3 py-1 dark:bg-gray-800 dark:border-gray-700" />
                        </div>
                    </div>
                    <div className="p-20 text-center text-gray-400 italic">
                        <span className="opacity-50 font-medium tracking-wide border-2 border-dashed p-10 rounded-3xl">Subscribers table implementation pending domain integration</span>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
