import { Head, useForm } from '@inertiajs/react'
import React, { useState } from 'react'
import { HiOutlineAdjustments } from 'react-icons/hi'
import { Button, Table, Card, Dialog, Input, Notification, toast, Checkbox } from '@/components/ui'
import AdminLayout from '@/layouts/adminlayout'
import { update as updateLimits } from '@/routes/admin/workspaces/limits'

interface Feature {
    id: number
    name: string
    slug: string
    type: 'boolean' | 'limit'
}

interface Workspace {
    id: number
    name: string
    plan?: { name: string }
    owner?: { name: string, email: string }
    custom_limits: Record<string, string | number> | null
}

interface Props {
    workspaces: Workspace[]
    features: Feature[]
}

const { TBody, THead, Th, Tr, Td } = Table

export default function WorkspacesIndex({ workspaces, features }: Props) {
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false)
    const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null)

    const { data, setData, post, processing } = useForm({
        custom_limits: {} as Record<string, string | number>
    })

    const handleManageLimits = (workspace: Workspace) => {
        setSelectedWorkspace(workspace)
        setData('custom_limits', workspace.custom_limits || {})
        setIsLimitModalOpen(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedWorkspace) {
            post(updateLimits(selectedWorkspace.id).url, {
                onSuccess: () => {
                    setIsLimitModalOpen(false)
                    toast.push(<Notification title="Success" type="success">Custom limits updated</Notification>)
                }
            })
        }
    }

    return (
        <AdminLayout>
            <Head title="Workspaces Management" />
            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold">Workspaces</h1>
                    <p className="text-gray-500 text-sm">Manage all workspaces and set custom feature overrides.</p>
                </header>

                <Card className="overflow-hidden">
                    <Table>
                        <THead>
                            <Tr>
                                <Th>Workspace Name</Th>
                                <Th>Owner</Th>
                                <Th>Plan</Th>
                                <Th>Custom Limits</Th>
                                <Th></Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {workspaces.map((workspace) => (
                                <Tr key={workspace.id}>
                                    <Td className="font-bold">{workspace.name}</Td>
                                    <Td>
                                        <div className="flex flex-col">
                                            <span>{workspace.owner?.name}</span>
                                            <span className="text-xs text-gray-400">{workspace.owner?.email}</span>
                                        </div>
                                    </Td>
                                    <Td>{workspace.plan?.name || 'No Plan'}</Td>
                                    <Td>
                                        {workspace.custom_limits && Object.keys(workspace.custom_limits).length > 0 ? (
                                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                                {Object.keys(workspace.custom_limits).length} Overrides
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">None</span>
                                        )}
                                    </Td>
                                    <Td className="text-right">
                                        <Button 
                                            size="sm" 
                                            variant="default" 
                                            icon={<HiOutlineAdjustments />}
                                            onClick={() => handleManageLimits(workspace)}
                                        >
                                            Limits
                                        </Button>
                                    </Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                </Card>
            </div>

            <Dialog
                isOpen={isLimitModalOpen}
                onClose={() => setIsLimitModalOpen(false)}
                width={500}
            >
                <div className="mb-6">
                    <h3 className="text-xl font-bold">Custom Limits: {selectedWorkspace?.name}</h3>
                    <p className="text-sm text-gray-500">Overrides are applied first, then the plan limits.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[500px] overflow-y-auto px-1">
                    {features.map(f => {
                        const currentVal = data.custom_limits[f.slug] ?? ''

                        return (
                            <div key={f.id} className="p-4 border rounded-xl flex items-center justify-between gap-4">
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm">{f.name}</span>
                                    <span className="text-[10px] text-gray-400 uppercase font-black">{f.slug}</span>
                                </div>

                                <div className="w-1/2 flex items-center gap-2">
                                    {f.type === 'boolean' ? (
                                        <Checkbox 
                                            checked={currentVal === 'true'}
                                            onChange={val => {
                                                const newLimits = { ...data.custom_limits }
                                                if (val) newLimits[f.slug] = 'true'
                                                else delete newLimits[f.slug]
                                                setData('custom_limits', newLimits)
                                            }}
                                        >
                                            <span className="text-xs font-bold">Enabled</span>
                                        </Checkbox>
                                    ) : (
                                        <div className="flex items-center gap-2 w-full">
                                            <Input 
                                                size="sm"
                                                type="number"
                                                disabled={currentVal === 'unlimited'}
                                                placeholder="Plan Default"
                                                value={currentVal === 'unlimited' ? '' : currentVal}
                                                onChange={e => {
                                                    const newLimits = { ...data.custom_limits }
                                                    newLimits[f.slug] = e.target.value
                                                    if (e.target.value === '') delete newLimits[f.slug]
                                                    setData('custom_limits', newLimits)
                                                }}
                                            />
                                            <Checkbox 
                                                checked={currentVal === 'unlimited'}
                                                onChange={val => {
                                                    const newLimits = { ...data.custom_limits }
                                                    if (val) newLimits[f.slug] = 'unlimited'
                                                    else delete newLimits[f.slug]
                                                    setData('custom_limits', newLimits)
                                                }}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">∞</span>
                                            </Checkbox>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}

                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t sticky bottom-0 bg-white dark:bg-gray-900">
                        <Button type="button" variant="plain" onClick={() => setIsLimitModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="solid" loading={processing}>Save Changes</Button>
                    </div>
                </form>
            </Dialog>
        </AdminLayout>
    )
}
