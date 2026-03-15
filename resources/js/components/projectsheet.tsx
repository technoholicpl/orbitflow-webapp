import { Button, Drawer, Input, FormItem, Select } from "@/components/ui"
import { useState, useEffect } from "react"

interface ProjectSheetProps {
    project?: any
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    clients: any[]
}

export default function ProjectSheet({ project, isOpen, onOpenChange, clients }: ProjectSheetProps) {
    const isEdit = !!project
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [clientId, setClientId] = useState('')
    const [status, setStatus] = useState('new')
    const [priority, setPriority] = useState('medium')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (project) {
            setName(project.name || '')
            setDescription(project.description || '')
            setClientId(project.client_id?.toString() || '')
            setStatus(project.status || 'new')
            setPriority(project.priority || 'medium')
        } else {
            setName('')
            setDescription('')
            setClientId('')
            setStatus('new')
            setPriority('medium')
        }
    }, [project, isOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            onOpenChange(false)
        }, 1000)
    }

    const clientOptions = clients.map(client => ({
        label: client.company_name,
        value: client.id.toString()
    }))

    const statusOptions = [
        { label: 'New', value: 'new' },
        { label: 'In Progress', value: 'in progress' },
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
    ]

    const priorityOptions = [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
    ]

    return (
        <Drawer
            isOpen={isOpen}
            onClose={() => onOpenChange(false)}
            title={isEdit ? 'Edit Project' : 'New Project'}
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
                        onClick={handleSubmit}
                    >
                        {isEdit ? 'Save Changes' : 'Create Project'}
                    </Button>
                </div>
            }
        >
            <div className="text-gray-400 font-medium italic mb-6">
                {isEdit ? 'Update existing project details.' : 'Fill in the information below to create a new project.'}
            </div>
            
            <div className="flex flex-col gap-6">
                <FormItem label="Project Name">
                    <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="Enter project name..."
                        required
                    />
                </FormItem>

                <FormItem label="Client">
                    <Select 
                        placeholder="Select a client"
                        options={clientOptions}
                        value={clientOptions.find(opt => opt.value === clientId)}
                        onChange={(opt: any) => setClientId(opt?.value || '')}
                    />
                </FormItem>

                <FormItem label="Description">
                    <textarea 
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="flex min-h-[120px] w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Describe the project goals and scope..."
                    />
                </FormItem>

                <div className="grid grid-cols-2 gap-4">
                    <FormItem label="Status">
                        <Select 
                            options={statusOptions}
                            value={statusOptions.find(opt => opt.value === status)}
                            onChange={(opt: any) => setStatus(opt?.value || 'new')}
                        />
                    </FormItem>
                    <FormItem label="Priority">
                        <Select 
                            options={priorityOptions}
                            value={priorityOptions.find(opt => opt.value === priority)}
                            onChange={(opt: any) => setPriority(opt?.value || 'medium')}
                        />
                    </FormItem>
                </div>
            </div>
        </Drawer>
    )
}


