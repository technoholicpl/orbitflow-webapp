import React from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/adminlayout'
import { store, destroy } from '@/routes/admin/features'
import { Button, Input, Select, Table, Notification, toast, Card } from '@/components/ui'
import { HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi'

interface Feature {
    id: number
    name: string
    slug: string
    type: 'boolean' | 'limit'
    category?: string
}

interface Props {
    features: Feature[]
}

const { TBody, THead, Th, Tr, Td } = Table

export default function FeaturesIndex({ features }: Props) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        type: 'boolean',
        category: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        post(store().url, {
            onSuccess: () => {
                reset()
                toast.push(
                    <Notification title="Success" type="success">
                        Feature created successfully
                    </Notification>
                )
            }
        })
    }

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this feature?')) {
            router.delete(destroy(id).url, {
                onSuccess: () => {
                    toast.push(
                        <Notification title="Deleted" type="success">
                            Feature deleted successfully
                        </Notification>
                    )
                }
            })
        }
    }

    const featureTypes = [
        { label: 'Boolean (Yes/No)', value: 'boolean' },
        { label: 'Limit (Numeric)', value: 'limit' }
    ]

    return (
        <AdminLayout>
            <Head title="System Features" />
            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold">Plan Features</h1>
                    <p className="text-gray-500 text-sm">Define what can be restricted or enabled via subscription plans.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card className="overflow-hidden">
                            <Table>
                                <THead>
                                    <Tr>
                                        <Th>Name</Th>
                                        <Th>Category</Th>
                                        <Th>Slug</Th>
                                        <Th>Type</Th>
                                        <Th></Th>
                                    </Tr>
                                </THead>
                                <TBody>
                                    {features.map((feature) => (
                                        <Tr key={feature.id}>
                                            <Td className="font-bold">{feature.name}</Td>
                                            <Td><span className="text-xs uppercase font-medium text-gray-400">{feature.category || 'General'}</span></Td>
                                            <Td><code>{feature.slug}</code></Td>
                                            <Td>
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${feature.type === 'boolean' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {feature.type}
                                                </span>
                                            </Td>
                                            <Td className="text-right">
                                                <Button 
                                                    size="sm" 
                                                    variant="default" 
                                                    color="red"
                                                    icon={<HiOutlineTrash />}
                                                    onClick={() => handleDelete(feature.id)}
                                                />
                                            </Td>
                                        </Tr>
                                    ))}
                                    {features.length === 0 && (
                                        <Tr>
                                            <Td colSpan={4} className="text-center py-10 text-gray-400 italic">
                                                No features defined yet.
                                            </Td>
                                        </Tr>
                                    )}
                                </TBody>
                            </Table>
                        </Card>
                    </div>

                    <div>
                        <Card title="Add New Feature">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Feature Name</label>
                                    <Input 
                                        placeholder="e.g. Max Projects" 
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Value Type</label>
                                    <Select 
                                        options={featureTypes}
                                        value={featureTypes.find(t => t.value === data.type)}
                                        onChange={(opt) => setData('type', opt?.value || 'boolean')}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Category</label>
                                    <Input 
                                        placeholder="e.g. Management" 
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                    />
                                </div>
                                <Button 
                                    block 
                                    variant="solid" 
                                    type="submit" 
                                    loading={processing}
                                    icon={<HiOutlinePlus />}
                                >
                                    Create Feature
                                </Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
