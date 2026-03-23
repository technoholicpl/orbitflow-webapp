import { router } from '@inertiajs/react'
import React from 'react'
import { HiClock } from 'react-icons/hi'
import TimeEntryForm from '@/components/template/TimeEntryForm'
import { Dialog, Button, Notification, toast } from '@/components/ui'

interface TimeEntryModalProps {
    isOpen: boolean
    onClose: () => void
    project?: any
    task?: any
}

const TimeEntryModal = ({ isOpen, onClose, project, task }: TimeEntryModalProps) => {
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const onFormSubmit = (data: any) => {
        setIsSubmitting(true)
        // Convert Date object to string for backend if needed
        const payload = {
            ...data,
            started_at: data.started_at instanceof Date ? data.started_at.toISOString() : data.started_at
        }

        router.post('/time-entries/manual', payload, {
            onSuccess: () => {
                toast.push(
                    <Notification title="Sukces" type="success">
                        Czas został dodany pomyślnie.
                    </Notification>
                )
                onClose()
            },
            onError: (errors) => {
                console.error('TimeEntry Errors:', errors)
            },
            onFinish: () => {
                setIsSubmitting(false)
            }
        })
    }

    const defaultValues = React.useMemo(() => ({
        project_id: project?.id,
        task_id: task?.id,
    }), [project, task])

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            width={600}
            closable={true}
            contentClassName="bg-[#0f1115] border border-gray-800 rounded-2xl overflow-hidden p-0"
        >
            <div className="p-8 space-y-8">
                {/* Custom Header */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500">
                        <HiClock className="text-2xl" />
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-tight">
                        Tworzenie ręcznego wpisu czasu
                    </h3>
                </div>

                <TimeEntryForm 
                    onSubmit={onFormSubmit} 
                    isSubmitting={isSubmitting}
                    defaultValues={defaultValues}
                />

                {/* Custom Footer */}
                <div className="flex items-center gap-3 pt-4">
                    <Button 
                        variant="solid" 
                        size="md"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 rounded-xl h-11"
                        loading={isSubmitting} 
                        form="time-entry-form" 
                        type="submit"
                    >
                        Zapisz
                    </Button>
                    <Button 
                        variant="plain" 
                        size="md"
                        className="text-gray-400 hover:text-white font-bold px-8 rounded-xl h-11 border border-gray-800 bg-gray-900/50"
                        onClick={onClose} 
                        disabled={isSubmitting}
                    >
                        Anuluj
                    </Button>
                </div>
            </div>
        </Dialog>
    )
}

export default TimeEntryModal
