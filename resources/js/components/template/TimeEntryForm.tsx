import React, { useState, useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import * as zod from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePage } from '@inertiajs/react'
import {
    Input,
    Button,
    Select,
    FormItem,
    FormContainer,
    DatePicker,
    TimeInput,
    Tooltip,
} from '@/components/ui'
import {
    HiClock,
    HiCalendar,
    HiDocumentText,
    HiBriefcase,
    HiClipboardList,
    HiMinus,
    HiPlus,
} from 'react-icons/hi'
import axios from 'axios'
import dayjs from 'dayjs'

const validationSchema = zod.object({
    project_id: zod.number().min(1, 'Projekt jest wymagany'),
    task_id: zod.number().nullable().optional(),
    description: zod.string().optional(),
    started_at: zod.date(),
    duration: zod.number().min(1, 'Czas musi być większy niż 0'),
})

type TimeEntryFormSchema = zod.infer<typeof validationSchema>

interface TimeEntryFormProps {
    onSubmit: (data: any) => void
    isSubmitting?: boolean
    defaultValues?: any
}

const TimeEntryForm = ({ onSubmit, isSubmitting, defaultValues }: TimeEntryFormProps) => {
    const { props } = usePage<any>()
    const { workspace_projects = [] } = props
    
    const [tasks, setTasks] = useState<any[]>([])
    const [isLoadingTasks, setIsLoadingTasks] = useState(false)

    // Internal states for time sync
    const [duration, setDuration] = useState(15) // minutes
    const [startDate, setStartDate] = useState<Date>(new Date())
    const [endDate, setEndDate] = useState<Date>(dayjs().add(15, 'minute').toDate())

    const {
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors },
    } = useForm<TimeEntryFormSchema>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            ...defaultValues,
            duration: 15,
            started_at: new Date(),
        },
    })

    const selectedProjectId = watch('project_id')
    const selectedProject = useMemo(() => 
        workspace_projects.find((p: any) => p.id === selectedProjectId),
    [selectedProjectId, workspace_projects])

    useEffect(() => {
        if (selectedProjectId) {
            setIsLoadingTasks(true)
            axios.get(`/projects/${selectedProjectId}/tasks`)
                .then(res => {
                    setTasks(res.data)
                    setIsLoadingTasks(false)
                })
                .catch(() => {
                    setTasks([])
                    setIsLoadingTasks(false)
                })
        } else {
            setTasks([])
        }
    }, [selectedProjectId])

    // Sync Logic
    const handleStartTimeChange = (newDate: Date | null) => {
        if (!newDate) return
        
        // When start changes, we keep duration fixed and move end time
        setStartDate(newDate)
        const newEnd = dayjs(newDate).add(duration, 'minute').toDate()
        setEndDate(newEnd)
        setValue('started_at', newDate)
    }

    const handleDurationChange = (newDuration: number) => {
        const val = Math.max(0, newDuration)
        setDuration(val)
        // Adjust End based on Start + Duration
        const newEnd = dayjs(startDate).add(val, 'minute').toDate()
        setEndDate(newEnd)
        setValue('duration', val)
    }

    const handleEndTimeChange = (newEnd: Date | null) => {
        if (!newEnd) return
        
        // If End is before Start, we mark as invalid
        setEndDate(newEnd)
        if (dayjs(newEnd).isBefore(dayjs(startDate))) {
            setDuration(0)
            setValue('duration', 0)
            return
        }

        const newDuration = dayjs(newEnd).diff(dayjs(startDate), 'minute')
        setDuration(newDuration)
        setValue('duration', newDuration)
    }

    const isInvalidRange = useMemo(() => {
        return dayjs(endDate).isBefore(dayjs(startDate))
    }, [startDate, endDate])

    const isDurationInvalid = useMemo(() => {
        return isInvalidRange || duration <= 0
    }, [isInvalidRange, duration])

    const handleManualDurationInput = (val: string) => {
        // Expected format HH:mm or just minutes
        if (val.includes(':')) {
            const [h, m] = val.split(':').map(n => parseInt(n) || 0)
            handleDurationChange(h * 60 + m)
        } else {
            handleDurationChange(parseInt(val) || 0)
        }
    }

    const projectOptions = workspace_projects.map((p: any) => ({
        label: p.name,
        value: p.id,
    }))

    const taskOptions = tasks.map((t: any) => ({
        label: t.name,
        value: t.id,
    }))

    const formatDurationDisplay = (mins: number) => {
        const h = Math.floor(mins / 60)
        const m = mins % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    }

    return (
        <form id="time-entry-form" onSubmit={handleSubmit(onSubmit)}>
            <FormContainer>
                <div className="space-y-6">
                    {/* Project Info or Select */}
                    {defaultValues?.project_id ? (
                        <div className="bg-gray-800/50 p-4 rounded-xl flex justify-between items-center border border-gray-700/50">
                            <div className="space-y-1">
                                <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider text-opacity-80">Nazwa projektu</div>
                                <div className="text-white text-sm font-medium">{selectedProject?.name || 'Wczytywanie...'}</div>
                            </div>
                            <div className="text-right space-y-1">
                                <div className="text-gray-400 text-[10px] uppercase font-bold tracking-wider text-opacity-80">Kontrahent</div>
                                <div className="text-white text-sm font-medium">{selectedProject?.client?.company_name || 'Brak danych'}</div>
                            </div>
                        </div>
                    ) : (
                        <FormItem 
                            label="Wybierz projekt \ zadanie" 
                            invalid={Boolean(errors.project_id)} 
                            errorMessage={errors.project_id?.message}
                        >
                            <Controller
                                name="project_id"
                                control={control}
                                render={({ field }) => (
                                    <Select 
                                        {...field}
                                        options={projectOptions}
                                        value={projectOptions.find((opt: any) => opt.value === field.value)}
                                        onChange={(opt: any) => {
                                            field.onChange(opt?.value)
                                            setValue('task_id', null)
                                        }}
                                        placeholder="Wybierz projekt"
                                    />
                                )}
                            />
                        </FormItem>
                    )}

                    {/* Description */}
                    <FormItem 
                        invalid={Boolean(errors.description)} 
                        errorMessage={errors.description?.message}
                    >
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <Input 
                                    {...field} 
                                    placeholder="Nad czym pracowałeś? (opcjonalnie)" 
                                    className="bg-gray-800/30 border-gray-700/50 focus:border-indigo-500 rounded-lg text-sm"
                                />
                            )}
                        />
                    </FormItem>

                    {/* Time Grid */}
                    <div className="grid grid-cols-3 gap-6 items-start">
                        {/* Duration Column */}
                        <div className="space-y-3">
                            <label className="text-white text-sm font-semibold">Czas trwania<span className="text-red-500 ml-0.5">*</span></label>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <Input 
                                        size="sm"
                                        className={`bg-gray-800/30 border-gray-700/50 rounded-lg text-center font-medium w-20 ${(isDurationInvalid) ? 'border-red-500' : ''}`}
                                        value={formatDurationDisplay(duration)}
                                        onChange={(e) => handleManualDurationInput(e.target.value)}
                                        placeholder="HH:mm"
                                    />
                                    <div className="flex gap-0.5">
                                        <Button 
                                            size="xs" 
                                            variant="plain" 
                                            className="text-gray-400 hover:text-white p-1 h-auto"
                                            onClick={(e) => { e.preventDefault(); handleDurationChange(duration - 15) }}
                                            icon={<HiMinus />}
                                        />
                                        <Button 
                                            size="xs" 
                                            variant="plain" 
                                            className="text-gray-400 hover:text-white p-1 h-auto"
                                            onClick={(e) => { e.preventDefault(); handleDurationChange(duration + 15) }}
                                            icon={<HiPlus />}
                                        />
                                    </div>
                                </div>
                                {isDurationInvalid && (
                                    <span className="text-red-500 text-[10px] font-medium animate-pulse">
                                        {isInvalidRange ? 'Błędny zakres czasu' : 'Czas musi być większy niż 0'}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Start Column */}
                        <div className="space-y-3">
                            <label className="text-white text-sm font-semibold">Początek<span className="text-red-500 ml-0.5">*</span></label>
                            <div className="space-y-4">
                                <DatePicker 
                                    size="sm"
                                    value={startDate}
                                    onChange={handleStartTimeChange}
                                    inputFormat="DD.MM.YYYY"
                                    className="bg-gray-800/30 border-gray-700/50 rounded-lg"
                                />
                                <TimeInput 
                                    size="sm"
                                    value={startDate}
                                    onChange={handleStartTimeChange}
                                    className="bg-gray-800/30 border-gray-700/50 rounded-lg w-full"
                                />
                            </div>
                        </div>

                        {/* End Column */}
                        <div className="space-y-3">
                            <label className="text-white text-sm font-semibold">Koniec<span className="text-red-500 ml-0.5">*</span></label>
                            <Tooltip 
                                title={isInvalidRange ? "Błędna data/godzina zakończenia" : "Czas trwania musi być dodatni"} 
                                isOpen={isDurationInvalid} 
                                disabled={!isDurationInvalid}
                                placement="top"
                                wrapperClass="block"
                            >
                                <div className="space-y-4">
                                    <DatePicker 
                                        size="sm"
                                        value={endDate}
                                        onChange={handleEndTimeChange}
                                        inputFormat="DD.MM.YYYY"
                                        className={`bg-gray-800/30 border-gray-700/50 rounded-lg ${isDurationInvalid ? 'border-red-500' : ''}`}
                                    />
                                    <TimeInput 
                                        size="sm"
                                        value={endDate}
                                        onChange={handleEndTimeChange}
                                        className={`bg-gray-800/30 border-gray-700/50 rounded-lg w-full ${isDurationInvalid ? 'border-red-500' : ''}`}
                                    />
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </FormContainer>
        </form>
    )
}

export default TimeEntryForm
