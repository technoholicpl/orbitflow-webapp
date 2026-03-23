import { zodResolver } from '@hookform/resolvers/zod'
import { usePage } from '@inertiajs/react'
import React, { useEffect, useMemo } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import {
    HiArrowNarrowDown,
    HiArrowNarrowUp,
    HiDotsHorizontal,
    HiExclamation,
    HiTag,
    HiUserGroup,
    HiOfficeBuilding,
    HiBriefcase,
} from 'react-icons/hi'
import type { OptionProps, SingleValueProps} from 'react-select';
import { components } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import * as zod from 'zod'
import {
    Input,
    Select,
    FormItem,
    FormContainer,
    Notification,
    toast,
} from '@/components/ui'

const { Option, SingleValue } = components

const validationSchema = zod.object({
    name: zod.string().min(1, 'Nazwa projektu jest wymagana'),
    description: zod.string().nullable().optional(),
    client_id: zod.number().min(1, 'Klient jest wymagany'),
    brand_id: zod.number().nullable().optional(),
    workspace_action_id: zod.number().nullable().optional(),
    priority: zod.enum(['low', 'normal', 'high', 'urgent']),
    deadline: zod.string().optional().nullable(),
    label_ids: zod.array(zod.number()).optional(),
    new_labels: zod.array(zod.string()).optional(),
    member_ids: zod.array(zod.number()).optional(),
})

type ProjectFormSchema = zod.infer<typeof validationSchema>

interface ProjectFormProps {
    onSubmit: (data: ProjectFormSchema) => void
    isSubmitting?: boolean
    defaultValues?: Partial<ProjectFormSchema>
}

const priorityOptions = [
    { label: 'Niski', value: 'low', icon: <HiArrowNarrowDown className="text-blue-500" /> },
    { label: 'Normalny', value: 'normal', icon: <HiDotsHorizontal className="text-gray-400" /> },
    { label: 'Wysoki', value: 'high', icon: <HiArrowNarrowUp className="text-orange-500" /> },
    { label: 'Pilny', value: 'urgent', icon: <HiExclamation className="text-red-500" /> },
]

const CustomPriorityOption = (props: OptionProps<any>) => {
    return (
        <Option {...props}>
            <div className="flex items-center gap-2">
                {props.data.icon}
                <span>{props.data.label}</span>
            </div>
        </Option>
    )
}

const CustomPrioritySingleValue = (props: SingleValueProps<any>) => {
    return (
        <SingleValue {...props}>
            <div className="flex items-center gap-2">
                {props.data.icon}
                <span>{props.data.label}</span>
            </div>
        </SingleValue>
    )
}

const ProjectForm = ({ onSubmit, defaultValues }: ProjectFormProps) => {
    const { props } = usePage<any>()
    const { 
        workspace_clients = [], 
        workspace_actions = [], 
        workspace_labels = [], 
        workspace_users = [] 
    } = props

    const {
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<ProjectFormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            priority: 'normal',
            label_ids: [],
            new_labels: [],
            member_ids: [],
            ...defaultValues,
        },
    })

    const onFormSubmit = (data: ProjectFormSchema) => {
        onSubmit(data)
    }

    const onFormError = (errors: any) => {
        console.error('ProjectForm Validation Errors:', errors)
        toast.push(
            <Notification title="Błąd walidacji" type="danger">
                Proszę poprawić błędy w formularzu.
            </Notification>
        )
    }

    const selectedClientId = useWatch({
        control,
        name: 'client_id',
    })

    const currentBrandId = useWatch({
        control,
        name: 'brand_id',
    })

    const newLabels = useWatch({
        control,
        name: 'new_labels',
        defaultValue: [],
    })

    const availableBrands = useMemo(() => {
        const client = workspace_clients.find((c: any) => c.id === selectedClientId)
        return client?.brands || []
    }, [selectedClientId, workspace_clients])

    useEffect(() => {
        if (selectedClientId) {
            // Reset brand if not in available brands
            if (currentBrandId && !availableBrands.find((b: any) => b.id === currentBrandId)) {
                setValue('brand_id', null)
            }
        }
    }, [selectedClientId, availableBrands, setValue, currentBrandId])

    const clientOptions = workspace_clients.map((c: any) => ({
        label: c.company_name || `${c.first_name} ${c.last_name}`,
        value: c.id,
    }))

    const brandOptions = availableBrands.map((b: any) => ({
        label: b.name,
        value: b.id,
    }))

    const actionOptions = workspace_actions.map((wa: any) => ({
        label: wa.action_type?.name || 'Bez nazwy',
        value: wa.id,
    }))

    const labelOptions = workspace_labels.map((l: any) => ({
        label: l.name,
        value: l.id,
    }))

    const userOptions = workspace_users.map((u: any) => ({
        label: u.name,
        value: u.id,
        avatar: u.avatar_url,
    }))

    return (
        <form id="project-form" onSubmit={handleSubmit(onFormSubmit, onFormError)}>
            <FormContainer>
                <div className="space-y-4">
                    <FormItem 
                        label="Nazwa projektu" 
                        invalid={Boolean(errors.name)} 
                        errorMessage={errors.name?.message}
                        asterisk
                    >
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input 
                                    {...field} 
                                    placeholder="Wprowadź nazwę projektu..." 
                                    prefix={<HiBriefcase className="text-xl" />}
                                />
                            )}
                        />
                    </FormItem>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem 
                            label="Klient" 
                            invalid={Boolean(errors.client_id)} 
                            errorMessage={errors.client_id?.message}
                            asterisk
                        >
                            <Controller
                                name="client_id"
                                control={control}
                                render={({ field }) => (
                                    <Select 
                                        {...field}
                                        options={clientOptions}
                                        value={clientOptions.find((opt: any) => opt.value === field.value)}
                                        onChange={(opt: any) => field.onChange(opt?.value)}
                                        placeholder="Wybierz klienta"
                                        components={{
                                            DropdownIndicator: () => <HiOfficeBuilding className="mr-2 text-lg text-gray-400" />
                                        }}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem 
                            label="Marka" 
                            invalid={Boolean(errors.brand_id)} 
                            errorMessage={errors.brand_id?.message}
                        >
                            <Controller
                                name="brand_id"
                                control={control}
                                render={({ field }) => (
                                    <Select 
                                        {...field}
                                        options={brandOptions}
                                        value={brandOptions.find((opt: any) => opt.value === field.value)}
                                        onChange={(opt: any) => field.onChange(opt?.value)}
                                        placeholder={selectedClientId ? "Wybierz markę" : "Najpierw wybierz klienta"}
                                        isDisabled={!selectedClientId || brandOptions.length === 0}
                                    />
                                )}
                            />
                        </FormItem>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormItem 
                            label="Priorytet" 
                            invalid={Boolean(errors.priority)} 
                            errorMessage={errors.priority?.message}
                        >
                            <Controller
                                name="priority"
                                control={control}
                                render={({ field }) => (
                                    <Select 
                                        {...field}
                                        options={priorityOptions}
                                        value={priorityOptions.find((opt: any) => opt.value === field.value)}
                                        onChange={(opt: any) => field.onChange(opt?.value)}
                                        components={{
                                            Option: CustomPriorityOption,
                                            SingleValue: CustomPrioritySingleValue
                                        }}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem 
                            label="Typ akcji (Action Type)" 
                            invalid={Boolean(errors.workspace_action_id)} 
                            errorMessage={errors.workspace_action_id?.message}
                        >
                            <Controller
                                name="workspace_action_id"
                                control={control}
                                render={({ field }) => (
                                    <Select 
                                        {...field}
                                        options={actionOptions}
                                        value={actionOptions.find((opt: any) => opt.value === field.value)}
                                        onChange={(opt: any) => field.onChange(opt?.value)}
                                        placeholder="Wybierz typ akcji"
                                    />
                                )}
                            />
                        </FormItem>
                    </div>

                    <FormItem 
                        label="Użytkownicy" 
                        invalid={Boolean(errors.member_ids)} 
                        errorMessage={errors.member_ids?.message}
                    >
                        <Controller
                            name="member_ids"
                            control={control}
                            render={({ field }) => (
                                    <Select 
                                        isMulti
                                        options={userOptions}
                                        value={userOptions.filter((opt: any) => field.value?.includes(opt.value))}
                                        onChange={(opts: any) => field.onChange(opts?.map((o: any) => o.value))}
                                        placeholder="Przypisz użytkowników..."
                                    components={{
                                        DropdownIndicator: () => <HiUserGroup className="mr-2 text-lg text-gray-400" />
                                    }}
                                />
                            )}
                        />
                    </FormItem>

                    <FormItem 
                        label="Labelki" 
                        invalid={Boolean(errors.label_ids)} 
                        errorMessage={errors.label_ids?.message}
                    >
                        <Controller
                            name="label_ids"
                            control={control}
                            render={({ field: { value, onChange } }) => {
                                const selectedValues = [
                                    ...labelOptions.filter((opt: any) => value?.includes(opt.value)),
                                    ...(newLabels?.map((l: string) => ({ label: l, value: l, isNew: true })) || [])
                                ]

                                return (
                                    <Select
                                        isMulti
                                        componentAs={CreatableSelect}
                                        options={labelOptions}
                                        value={selectedValues}
                                        onChange={(newValue: any) => {
                                            const val = newValue || []
                                            const ids = val.filter((v: any) => !v.isNew && !v.__isNew__).map((v: any) => v.value)
                                            const news = val.filter((v: any) => v.isNew || v.__isNew__).map((v: any) => v.label)
                                            onChange(ids)
                                            setValue('new_labels', news)
                                        }}
                                        placeholder="Wyszukaj lub dodaj labelkę..."
                                        formatCreateLabel={(inputValue: string) => `Dodaj "${inputValue}"`}
                                        components={{
                                            DropdownIndicator: () => <HiTag className="mr-2 text-lg text-gray-400" />
                                        }}
                                    />
                                )
                            }}
                        />
                    </FormItem>

                    <FormItem label="Opis">
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <Input 
                                    {...field}
                                    value={field.value ?? ''}
                                    textArea 
                                    placeholder="Opisz krótko zakres projektu..." 
                                    className="min-h-[100px]"
                                />
                            )}
                        />
                    </FormItem>
                </div>
            </FormContainer>
        </form>
    )
}

export default ProjectForm
