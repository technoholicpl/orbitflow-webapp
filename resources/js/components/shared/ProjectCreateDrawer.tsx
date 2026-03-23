import { router } from '@inertiajs/react'
import React from 'react'
import ProjectForm from '@/components/template/ProjectForm'
import { toast, Notification } from '@/components/ui'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'

interface ProjectCreateDrawerProps {
    isOpen: boolean
    onClose: () => void
    project?: any 
}

const ProjectCreateDrawer = ({ isOpen, onClose, project }: ProjectCreateDrawerProps) => {
    const isEdit = !!project
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const formData = React.useMemo(() => {
        if (!project) return {}
        return {
            ...project,
            label_ids: project.labels?.map((l: any) => l.id) || [],
            member_ids: project.members?.map((m: any) => m.id) || [],
        }
    }, [project])

    const onFormSubmit = (data: any) => {
        setIsSubmitting(true)
        if (isEdit) {
            router.put(`/projects/${project.id}`, data, {
                onSuccess: () => {
                    setIsSubmitting(false)
                    onClose()
                    toast.push(
                        <Notification title="Sukces" type="success">
                            Projekt został pomyślnie zaktualizowany.
                        </Notification>
                    )
                },
                onError: () => setIsSubmitting(false)
            })
        } else {
            router.post('/projects', data, {
                onSuccess: () => {
                    setIsSubmitting(false)
                    onClose()
                },
                onError: () => setIsSubmitting(false)
            })
        }
    }

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={600}
            title={isEdit ? 'Edytuj Projekt' : 'Utwórz Nowy Projekt'}
            footer={
                <div className="flex justify-end gap-2 w-full">
                    <Button type="button" variant="plain" onClick={onClose}>Anuluj</Button>
                    <Button 
                        type="submit" 
                        variant="solid" 
                        loading={isSubmitting} 
                        form="project-form"
                    >
                        {isEdit ? 'Zapisz zmiany' : 'Utwórz Projekt'}
                    </Button>
                </div>
            }
        >
            <div className="max-h-full overflow-y-auto pr-2">
                <ProjectForm 
                    onSubmit={onFormSubmit} 
                    isSubmitting={isSubmitting}
                    defaultValues={formData}
                />
            </div>
        </Drawer>
    )
}

export default ProjectCreateDrawer
