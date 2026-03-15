import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/adminlayout'

interface User {
    id: number
    name: string
    email: string
    account_type: string
    created_at: string
}

interface UserListProps {
    users: User[]
}

export default function UsersList({ users }: UserListProps) {
    return (
        <AdminLayout>
            <Head title="System Users" />
            <div className="flex flex-col gap-8">
                <header className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold">User Management</h1>
                        <p className="text-gray-500 text-sm">Review and manage all platform users and their accounts.</p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all active:scale-95 text-sm">Export Data</button>
                </header>

                <div className="bg-white dark:bg-gray-900 border rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b bg-gray-50/50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">User</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Account Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Joined</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-800">
                            {users && users.length > 0 ? users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{user.name}</span>
                                            <span className="text-xs text-gray-400">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 uppercase">{user.account_type}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 italic">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest">Manage</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    )
}
