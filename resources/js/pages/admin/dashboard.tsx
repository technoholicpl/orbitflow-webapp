import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/adminlayout'
import { Card, Badge, Button, Tag } from '@/components/ui'
import { Users, CreditCard, Layers, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'

export default function AdminDashboard() {
    return (
        <AdminLayout>
            <Head title="Admin Dashboard" />
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">System Overview</h1>
                        <p className="text-muted-foreground">Manage global platform state and user base.</p>
                    </div>
                    <Button variant="solid">Generate Report</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AdaptiveCard>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Users</span>
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <Users className="size-4 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                                <h3 className="text-2xl font-bold">1,284</h3>
                                <div className="flex items-center text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                                    <ArrowUpRight className="size-3 mr-0.5" />
                                    12.5%
                                </div>
                            </div>
                        </div>
                    </AdaptiveCard>

                    <AdaptiveCard>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Revenue</span>
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                    <CreditCard className="size-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                                <h3 className="text-2xl font-bold">$42,560</h3>
                                <div className="flex items-center text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                                    <ArrowUpRight className="size-3 mr-0.5" />
                                    8.2%
                                </div>
                            </div>
                        </div>
                    </AdaptiveCard>

                    <AdaptiveCard>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Workspaces</span>
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <Layers className="size-4 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                                <h3 className="text-2xl font-bold">842</h3>
                                <div className="flex items-center text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">
                                    <ArrowDownRight className="size-3 mr-0.5" />
                                    3.1%
                                </div>
                            </div>
                        </div>
                    </AdaptiveCard>

                    <AdaptiveCard>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Server Load</span>
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <Activity className="size-4 text-amber-600 dark:text-amber-400" />
                                </div>
                            </div>
                            <div className="flex items-end justify-between mt-2">
                                <h3 className="text-2xl font-bold">12%</h3>
                                <Tag className="text-[10px] uppercase font-bold tracking-tighter bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400" prefix>Stable</Tag>
                            </div>
                        </div>
                    </AdaptiveCard>
                </div>

                <Card 
                    header={{ 
                        content: 'Latest Registered Users',
                        extra: <Button variant="plain" size="sm" className="text-xs">View All</Button>
                    }}
                >
                    <div className="overflow-x-auto border-t dark:border-gray-800">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs text-muted-foreground uppercase font-bold tracking-widest border-b dark:border-gray-800">
                                    <th className="py-3 px-2">User</th>
                                    <th className="py-3 px-2">Account Type</th>
                                    <th className="py-3 px-2">Status</th>
                                    <th className="py-3 px-2 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b last:border-0 dark:border-gray-800">
                                    <td className="py-4 px-2 font-medium text-gray-900 dark:text-gray-100">John Doe</td>
                                    <td className="py-4 px-2 text-muted-foreground text-sm">Company</td>
                                    <td className="py-4 px-2">
                                        <Tag className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none px-2" prefix>Active</Tag>
                                    </td>
                                    <td className="py-4 px-2 text-right text-sm text-muted-foreground italic font-medium">Today</td>
                                </tr>
                                <tr className="border-b last:border-0 dark:border-gray-800">
                                    <td className="py-4 px-2 font-medium text-gray-900 dark:text-gray-100">Jane Smith</td>
                                    <td className="py-4 px-2 text-muted-foreground text-sm">Individual</td>
                                    <td className="py-4 px-2">
                                        <Tag className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-none px-2" prefix>Pending</Tag>
                                    </td>
                                    <td className="py-4 px-2 text-right text-sm text-muted-foreground italic font-medium">Yesterday</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AdminLayout>
    )
}
