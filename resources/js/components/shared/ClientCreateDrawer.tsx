import React, { useState, useEffect } from 'react'
import Drawer from '@/components/ui/Drawer'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import FormItem from '@/components/ui/Form/FormItem'
import FormContainer from '@/components/ui/Form/FormContainer'
import Segment from '@/components/ui/Segment'
import SegmentItem from '@/components/ui/Segment/SegmentItem'
import Upload from '@/components/ui/Upload'
import { HiPlus, HiTrash, HiOfficeBuilding, HiUser, HiGlobeAlt } from 'react-icons/hi'
import { useForm, Controller } from 'react-hook-form'
import * as zod from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { router } from '@inertiajs/react'
import { toast, Notification } from '@/components/ui'

interface Brand {
    id?: string | number
    name: string
    description: string
    website: string
    logo?: string
}

interface ClientCreateDrawerProps {
    isOpen: boolean
    onClose: () => void
    client?: any 
}

const validationSchema = zod.object({
    type: zod.enum(['business', 'individual']),
    company_name: zod.string().optional(),
    tax_id: zod.string().optional(),
    first_name: zod.string().optional(),
    last_name: zod.string().optional(),
    email: zod.string().email('Niepoprawny email').optional().or(zod.literal('')),
    phone: zod.string().optional(),
    website: zod.string().optional(),
    note: zod.string().optional(),
    brands: zod.array(zod.object({
        name: zod.string().min(1, 'Nazwa marki jest wymagana'),
        description: zod.string().optional(),
        website: zod.string().optional(),
    })).optional(),
})

const ClientCreateDrawer = ({ isOpen, onClose, client }: ClientCreateDrawerProps) => {
    const isEdit = !!client
    const [clientType, setClientType] = useState<string[]>(['business'])
    const [brands, setBrands] = useState<Brand[]>([])

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitting },
        setValue,
    } = useForm({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            type: 'business',
            company_name: '',
            tax_id: '',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            website: '',
            note: '',
            brands: [],
        },
    })

    useEffect(() => {
        if (isOpen) {
            if (client) {
                reset({
                    type: client.type || 'business',
                    company_name: client.company_name || '',
                    tax_id: client.tax_id || '',
                    first_name: client.first_name || '',
                    last_name: client.last_name || '',
                    email: client.email || '',
                    phone: client.phone || '',
                    website: client.website || '',
                    note: client.note || '',
                    brands: client.brands || [],
                })
                setClientType([client.type || 'business'])
                setBrands(client.brands || [])
            } else {
                reset({
                    type: 'business',
                    company_name: '',
                    tax_id: '',
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    website: '',
                    note: '',
                    brands: [],
                })
                setClientType(['business'])
                setBrands([])
            }
        }
    }, [isOpen, reset, client])

    const onClientTypeChange = (val: string[]) => {
        setClientType(val)
        setValue('type', val[0] as 'business' | 'individual')
    }

    const addBrand = () => {
        setBrands([...brands, { name: '', description: '', website: '' }])
    }

    const removeBrand = (index: number) => {
        const newBrands = [...brands]
        newBrands.splice(index, 1)
        setBrands(newBrands)
    }

    const onFormSubmit = (data: any) => {
        const submitData = { ...data, brands }
        if (isEdit) {
            router.put(`/clients/${client.id}`, submitData, {
                onSuccess: () => {
                    onClose()
                    toast.push(
                        <Notification title="Sukces" type="success">
                            Klient został pomyślnie zaktualizowany.
                        </Notification>
                    )
                }
            })
        } else {
            router.post('/clients', submitData, {
                onSuccess: () => {
                    onClose()
                    toast.push(
                        <Notification title="Sukces" type="success">
                            Klient został pomyślnie utworzony.
                        </Notification>
                    )
                }
            })
        }
    }

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={600}
            title={isEdit ? 'Edytuj Kontrahenta' : 'Utwórz Kontrahenta'}
            footer={
                <div className="flex justify-end gap-2 w-full">
                    <Button type="button" variant="plain" onClick={onClose}>Anuluj</Button>
                    <Button type="submit" variant="solid" loading={isSubmitting} form="client-form">
                        {isEdit ? 'Zapisz zmiany' : 'Utwórz'}
                    </Button>
                </div>
            }
        >
            <div className="max-h-full overflow-y-auto pr-2">
                <form id="client-form" onSubmit={handleSubmit(onFormSubmit)}>
                    <FormContainer>
                        <div className="mb-6 flex justify-center">
                            <Segment 
                                value={clientType} 
                                onChange={(val: string | string[]) => onClientTypeChange(Array.isArray(val) ? val : [val])}
                                size="sm"
                            >
                                <SegmentItem value="business" className="flex items-center gap-2 px-6">
                                    <HiOfficeBuilding className="text-lg" />
                                    <span>Firma</span>
                                </SegmentItem>
                                <SegmentItem value="individual" className="flex items-center gap-2 px-6">
                                    <HiUser className="text-lg" />
                                    <span>Indywidualny</span>
                                </SegmentItem>
                            </Segment>
                        </div>

                        <div className="space-y-4">
                            <Upload
                                className="cursor-pointer mb-4"
                                showList={false}
                                uploadLimit={1}
                            >
                                <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        Logo / Zdjęcie
                                    </p>
                                </div>
                            </Upload>

                            {clientType[0] === 'business' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormItem label="Nazwa firmy" invalid={Boolean(errors.company_name)} errorMessage={errors.company_name?.message} asterisk>
                                        <Controller
                                            name="company_name"
                                            control={control}
                                            render={({ field }) => <Input {...field} placeholder="Nazwa firmy" />}
                                        />
                                    </FormItem>
                                    <FormItem label="NIP" invalid={Boolean(errors.tax_id)} errorMessage={errors.tax_id?.message}>
                                        <Controller
                                            name="tax_id"
                                            control={control}
                                            render={({ field }) => <Input {...field} placeholder="NIP" />}
                                        />
                                    </FormItem>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormItem label="Imię" invalid={Boolean(errors.first_name)} errorMessage={errors.first_name?.message} asterisk>
                                        <Controller
                                            name="first_name"
                                            control={control}
                                            render={({ field }) => <Input {...field} placeholder="Imię" />}
                                        />
                                    </FormItem>
                                    <FormItem label="Nazwisko" invalid={Boolean(errors.last_name)} errorMessage={errors.last_name?.message} asterisk>
                                        <Controller
                                            name="last_name"
                                            control={control}
                                            render={({ field }) => <Input {...field} placeholder="Nazwisko" />}
                                        />
                                    </FormItem>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormItem label="E-mail" invalid={Boolean(errors.email)} errorMessage={errors.email?.message}>
                                    <Controller
                                        name="email"
                                        control={control}
                                        render={({ field }) => <Input {...field} placeholder="E-mail" />}
                                    />
                                </FormItem>
                                <FormItem label="Telefon" invalid={Boolean(errors.phone)} errorMessage={errors.phone?.message}>
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({ field }) => <Input {...field} placeholder="Telefon" />}
                                    />
                                </FormItem>
                            </div>

                            <FormItem label="Strona WWW" invalid={Boolean(errors.website)} errorMessage={errors.website?.message}>
                                <Controller
                                    name="website"
                                    control={control}
                                    render={({ field }) => (
                                        <Input 
                                            {...field} 
                                            prefix={<HiGlobeAlt className="text-xl" />} 
                                            placeholder="https://" 
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem label="Notka" invalid={Boolean(errors.note)} errorMessage={errors.note?.message}>
                                <Controller
                                    name="note"
                                    control={control}
                                    render={({ field }) => <Input {...field} textArea placeholder="Notka..." />}
                                />
                            </FormItem>

                            <div className="mt-8 border-t dark:border-gray-700 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex gap-4 border-b dark:border-gray-700 w-full mb-4">
                                        <button type="button" className="pb-2 border-b-2 border-emerald-500 font-semibold text-emerald-500 text-sm">Marka</button>
                                        <button type="button" className="pb-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm">Osoba kontaktowa</button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {brands.map((brand, index) => (
                                        <div key={index} className="p-4 border dark:border-gray-700 rounded-lg relative bg-gray-50 dark:bg-gray-800/50">
                                            <Button 
                                                size="xs" 
                                                variant="plain" 
                                                className="absolute top-2 right-2 text-red-500 hover:text-red-600"
                                                icon={<HiTrash />}
                                                onClick={() => removeBrand(index)}
                                                type="button"
                                            />
                                            <div className="grid grid-cols-1 gap-3 mt-2">
                                                <Input 
                                                    size="sm"
                                                    placeholder="Nazwa marki" 
                                                    value={brand.name}
                                                    onChange={(e) => {
                                                        const newBrands = [...brands]
                                                        newBrands[index].name = e.target.value
                                                        setBrands(newBrands)
                                                    }}
                                                />
                                                <Input 
                                                    size="sm"
                                                    placeholder="Opis" 
                                                    value={brand.description}
                                                    onChange={(e) => {
                                                        const newBrands = [...brands]
                                                        newBrands[index].description = e.target.value
                                                        setBrands(newBrands)
                                                    }}
                                                />
                                                <Input 
                                                    size="sm"
                                                    prefix={<HiGlobeAlt />}
                                                    placeholder="https://" 
                                                    value={brand.website}
                                                    onChange={(e) => {
                                                        const newBrands = [...brands]
                                                        newBrands[index].website = e.target.value
                                                        setBrands(newBrands)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <Button 
                                        type="button" 
                                        variant="default" 
                                        size="sm" 
                                        icon={<HiPlus />}
                                        onClick={addBrand}
                                        block
                                    >
                                        Dodaj markę
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </FormContainer>
                </form>
            </div>
        </Drawer>
    )
}

export default ClientCreateDrawer
