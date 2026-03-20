import React, { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/adminlayout'
import { Button, Table, Card, Dialog, Input, Notification, toast, Select, Switcher } from '@/components/ui'
import { HiOutlineTrash, HiOutlinePlus, HiOutlineTicket } from 'react-icons/hi'
import { store, destroy } from '@/routes/admin/coupons'

interface Coupon {
    id: number
    code: string
    type: 'fixed' | 'percentage'
    value: number
    expires_at: string | null
    is_active: boolean
}

interface Props {
    coupons: Coupon[]
}

const { TBody, THead, Th, Tr, Td } = Table

export default function CouponsIndex({ coupons }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const { data, setData, post, processing, reset, errors } = useForm({
        code: '',
        type: 'percentage' as 'fixed' | 'percentage',
        value: 0,
        expires_at: '',
        is_active: true
    })

    const handleCreate = () => {
        reset()
        setIsCreateModalOpen(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(store().url, {
            onSuccess: () => {
                setIsCreateModalOpen(false)
                toast.push(<Notification title="Success" type="success">Coupon created</Notification>)
            }
        })
    }

    const handleDelete = (coupon: Coupon) => {
        if (confirm(`Delete coupon ${coupon.code}?`)) {
            post(destroy(coupon.id).url, {
                _method: 'delete',
                onSuccess: () => toast.push(<Notification title="Deleted" type="success">Coupon removed</Notification>)
            })
        }
    }

    const typeOptions = [
        { label: 'Percentage (%)', value: 'percentage' },
        { label: 'Fixed Amount ($)', value: 'fixed' }
    ]

    return (
        <AdminLayout>
            <Head title="Coupons Management" />
            <div className="flex flex-col gap-8">
                <header className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold">Coupons & Discounts</h1>
                        <p className="text-gray-500 text-sm">Create and manage promotional codes for your plans.</p>
                    </div>
                    <Button variant="solid" icon={<HiOutlinePlus />} onClick={handleCreate}>
                        Create Coupon
                    </Button>
                </header>

                <Card className="overflow-hidden">
                    <Table>
                        <THead>
                            <Tr>
                                <Th>Code</Th>
                                <Th>Discount</Th>
                                <Th>Expires At</Th>
                                <Th>Status</Th>
                                <Th></Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {coupons.map((coupon) => (
                                <Tr key={coupon.id}>
                                    <Td className="font-bold">
                                        <div className="flex items-center gap-2">
                                            <span className="p-2 bg-amber-100 text-amber-600 rounded-lg text-sm"><HiOutlineTicket /></span>
                                            <code>{coupon.code}</code>
                                        </div>
                                    </Td>
                                    <Td>
                                        <span className="font-bold text-gray-900 dark:text-gray-100">
                                            {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                                        </span>
                                    </Td>
                                    <Td>
                                        {coupon.expires_at ? (
                                            <span className="text-sm">{new Date(coupon.expires_at).toLocaleDateString()}</span>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Never</span>
                                        )}
                                    </Td>
                                    <Td>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${coupon.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                                            {coupon.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </Td>
                                    <Td className="text-right">
                                        <Button 
                                            size="sm" 
                                            variant="default" 
                                            color="red"
                                            icon={<HiOutlineTrash />}
                                            onClick={() => handleDelete(coupon)}
                                        />
                                    </Td>
                                </Tr>
                            ))}
                            {coupons.length === 0 && (
                                <Tr>
                                    <Td colSpan={5} className="text-center py-20 text-gray-400 italic">
                                        No coupons found. Create your first discount code!
                                    </Td>
                                </Tr>
                            )}
                        </TBody>
                    </Table>
                </Card>
            </div>

            <Dialog
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                width={400}
            >
                <div className="mb-6">
                    <h3 className="text-xl font-bold">Create Coupon</h3>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase text-gray-500">Coupon Code</label>
                        <Input 
                            placeholder="SUMMER2025" 
                            value={data.code} 
                            onChange={e => setData('code', e.target.value.toUpperCase())} 
                        />
                        {errors.code && <span className="text-xs text-red-500">{errors.code}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold uppercase text-gray-500">Type</label>
                            <Select 
                                options={typeOptions}
                                value={typeOptions.find(o => o.value === data.type)}
                                onChange={o => setData('type', o?.value as any)}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold uppercase text-gray-500">Value</label>
                            <Input 
                                type="number" 
                                value={data.value} 
                                onChange={e => setData('value', parseFloat(e.target.value))} 
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold uppercase text-gray-500">Expires At (Optional)</label>
                        <Input 
                            type="date" 
                            value={data.expires_at} 
                            onChange={e => setData('expires_at', e.target.value)} 
                        />
                        {errors.expires_at && <span className="text-xs text-red-500">{errors.expires_at}</span>}
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <Switcher checked={data.is_active} onChange={val => setData('is_active', val)} />
                        <span className="text-xs font-bold">Coupon is Active</span>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="plain" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="solid" loading={processing}>Create Coupon</Button>
                    </div>
                </form>
            </Dialog>
        </AdminLayout>
    )
}
