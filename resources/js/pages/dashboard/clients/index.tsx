import { Head } from '@inertiajs/react';
import { useState } from 'react'
import ClientCreateDrawer from '@/components/shared/ClientCreateDrawer';
import DashboardLayout from '@/layouts/DashboardLayout'

interface Client {
    id: number
    company_name: string
    email: string
    type: 'individual' | 'business'
    is_active: boolean
    phone?: string
    address?: string
    first_name?: string
    last_name?: string
    website?: string
    note?: string
    brands?: any[]
}

interface ClientsListProps {
    clients: Client[]
}

export default function ClientsList({ clients }: ClientsListProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined)

    const handleNewClient = () => {
        setSelectedClient(undefined)
        setIsDrawerOpen(true)
    }

    const handleEditClient = (client: Client) => {
        setSelectedClient(client)
        setIsDrawerOpen(true)
    }

    return (
        <DashboardLayout title="Clients">
            <Head title="Clients" />
            <div className="flex flex-col gap-8">
                <header className="flex justify-between items-end">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black tracking-tight uppercase">Clients</h1>
                        <p className="text-gray-400 font-medium italic">Manage your business partners and personal contacts.</p>
                    </div>
                    <button
                        onClick={handleNewClient}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95 text-xs"
                    >
                        New Client
                    </button>
                </header>

                <div className="bg-white dark:bg-gray-900 border-2 rounded-3xl shadow-sm overflow-hidden border-gray-100 dark:border-gray-800">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b-2 border-gray-100 dark:border-gray-800">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Company / Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Type</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Email</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-gray-50 dark:divide-gray-800">
                            {clients && clients.length > 0 ? clients.map((client) => (
                                <tr key={client.id} className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-black text-indigo-600 uppercase border-2 border-indigo-100 dark:border-indigo-800">
                                                {client.company_name ? client.company_name.substring(0, 2) : client.first_name?.substring(0, 1)}
                                            </div>
                                            <span className="font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight text-lg">
                                                {client.type === 'business' ? client.company_name : `${client.first_name} ${client.last_name}`}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-[10px] font-black px-3 py-1 rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                            {client.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-gray-400 lowercase italic">{client.email}</td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-widest border ${client.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                            {client.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={() => handleEditClient(client)}
                                                className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl transition-all active:scale-95 border-2 border-transparent hover:border-indigo-100"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center text-gray-300 italic font-black uppercase tracking-[0.3em]">No clients found in this workspace.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ClientCreateDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                client={selectedClient}
            />
        </DashboardLayout>
    )
}
