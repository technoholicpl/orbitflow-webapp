import { Button, Drawer, Input, FormItem, Select } from "@/components/ui"
import { useState, useEffect } from "react"
import { router } from '@inertiajs/react'

interface ClientSheetProps {
    client?: any
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export default function ClientSheet({ client, isOpen, onOpenChange }: ClientSheetProps) {
    const isEdit = !!client
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [type, setType] = useState('business')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (client) {
            setName(client.company_name || '')
            setEmail(client.email || '')
            setType(client.type || 'business')
            setPhone(client.phone || '')
            setAddress(client.address || '')
        } else {
            setName('')
            setEmail('')
            setType('business')
            setPhone('')
            setAddress('')
        }
    }, [client, isOpen])

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        
        const data = {
            company_name: name,
            email,
            type,
            phone,
            address,
            is_active: true
        }

        if (isEdit) {
            router.put(`/clients/${client.id}`, data, {
                onSuccess: () => {
                    setLoading(false)
                    onOpenChange(false)
                },
                onError: () => setLoading(false)
            })
        } else {
            router.post('/clients', data, {
                onSuccess: () => {
                    setLoading(false)
                    onOpenChange(false)
                },
                onError: () => setLoading(false)
            })
        }
    }

    const typeOptions = [
        { label: 'Business / Company', value: 'business' },
        { label: 'Individual', value: 'individual' },
    ]

    return (
        <Drawer
            isOpen={isOpen}
            onClose={() => onOpenChange(false)}
            title={isEdit ? 'Edit Client' : 'New Client'}
            width={480}
            footer={
                <div className="flex gap-3 w-full">
                    <Button 
                        variant="default" 
                        className="flex-1" 
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button 
                        variant="solid"
                        className="flex-1" 
                        loading={loading}
                        type="submit"
                        form="client-form"
                    >
                        {isEdit ? 'Save Changes' : 'Add Client'}
                    </Button>
                </div>
            }
        >
            <form id="client-form" onSubmit={handleSubmit}>
                <div className="text-gray-400 font-medium italic mb-6">
                    {isEdit ? 'Update client details and contact information.' : 'Add a new client to your workspace.'}
                </div>
                
                <div className="flex flex-col gap-6">
                    <FormItem label="Client Type">
                        <Select 
                            options={typeOptions}
                            value={typeOptions.find(opt => opt.value === type)}
                            onChange={(opt: any) => setType(opt?.value || 'business')}
                        />
                    </FormItem>

                    <FormItem label={type === 'business' ? 'Company Name' : 'Full Name'}>
                        <Input 
                            id="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder={type === 'business' ? 'Enter company name...' : 'Enter full name...'}
                            required
                        />
                    </FormItem>

                    <FormItem label="Email Address">
                        <Input 
                            id="email" 
                            type="email"
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="client@example.com"
                            required
                        />
                    </FormItem>

                    <FormItem label="Phone Number">
                        <Input 
                            id="phone" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)} 
                            placeholder="+48 ..."
                        />
                    </FormItem>

                    <FormItem label="Address">
                        <textarea 
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="flex min-h-[100px] w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Billing or contact address..."
                        />
                    </FormItem>
                </div>
            </form>
        </Drawer>
    )
}


