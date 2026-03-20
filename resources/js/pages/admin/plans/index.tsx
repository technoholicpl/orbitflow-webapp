import React, { useState } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/pl'

dayjs.extend(relativeTime)
dayjs.locale('pl')

import AdminLayout from '@/layouts/adminlayout'
import { store, update, destroy } from '@/routes/admin/plans'
import { update as updateFeatures } from '@/routes/admin/plans/features'
import { 
    Button, 
    Input, 
    Select, 
    Table, 
    Notification, 
    toast, 
    Card, 
    Badge, 
    Dialog,
    Drawer,
    Switcher,
    Checkbox
} from '@/components/ui'
import DatePicker from '@/components/ui/DatePicker'
import cn from '@/components/ui/utils/classNames'
import { 
    HiOutlineTrash, 
    HiOutlinePencil, 
    HiOutlinePlus, 
    HiOutlineAdjustments,
    HiOutlineCheckCircle,
    HiOutlineClock
} from 'react-icons/hi'

interface Feature {
    id: number
    name: string
    slug: string
    type: 'boolean' | 'limit'
}

interface PlanPrice {
    id?: number
    type: 'month' | 'year'
    price: number | null
    sale_price?: number | null
    sale_start_at?: string | null
    sale_ends_at?: string | null
    lowest_price_30d?: number | null
    calculated_lowest_price?: number | null
    is_on_sale?: boolean
    is_active: boolean
}

interface Plan {
    id: number
    name: string
    slug: string
    description: string
    is_recommended: boolean
    is_free: boolean
    is_active: boolean
    is_coming_soon: boolean
    is_promoted: boolean
    display_order: number
    trial_days: number
    prices: PlanPrice[]
    features: (Feature & { pivot: { value: string, period?: string } })[]
}

interface Props {
    plans: Plan[]
    features: Feature[]
}

const { DateTimepicker } = DatePicker

export default function PlansIndex({ plans, features }: Props) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

    const { data, setData, post, patch, processing, reset, errors } = useForm({
        name: '',
        description: '',
        is_recommended: false,
        is_free: false,
        is_active: true,
        is_coming_soon: false,
        is_promoted: false,
        display_order: 0,
        trial_days: 0,
        prices: [
            { type: 'month', price: 0, sale_price: null, sale_start_at: null, sale_ends_at: null, lowest_price_30d: null, is_active: true },
            { type: 'year', price: 0, sale_price: null, sale_start_at: null, sale_ends_at: null, lowest_price_30d: null, is_active: true }
        ] as PlanPrice[]
    })

    const { data: featureData, setData: setFeatureData, post: postFeatures, processing: featureProcessing } = useForm({
        features: [] as { id: number, value: string, period: string | null }[]
    })

    const handleCreate = () => {
        setSelectedPlan(null)
        reset()
        setIsEditModalOpen(true)
    }

    const handleEdit = (plan: Plan) => {
        setSelectedPlan(plan)
        setData({
            name: plan.name,
            description: plan.description || '',
            is_recommended: !!plan.is_recommended,
            is_free: !!plan.is_free,
            is_active: !!plan.is_active,
            is_coming_soon: !!plan.is_coming_soon,
            is_promoted: !!plan.is_promoted,
            display_order: plan.display_order ?? 0,
            trial_days: plan.trial_days ?? 0,
            prices: plan.prices.length > 0 ? plan.prices.map(p => ({
                ...p,
                price: p.price ?? 0,
                sale_price: p.sale_price !== null ? Number(p.sale_price) : null,
                sale_start_at: p.sale_start_at ?? null,
                sale_ends_at: p.sale_ends_at ?? null,
                lowest_price_30d: p.lowest_price_30d ?? null,
                calculated_lowest_price: p.calculated_lowest_price ?? null,
                is_active: !!p.is_active
            })) : [
                { type: 'month', price: 0, sale_price: null, sale_start_at: null, sale_ends_at: null, lowest_price_30d: null, is_active: true },
                { type: 'year', price: 0, sale_price: null, sale_start_at: null, sale_ends_at: null, lowest_price_30d: null, is_active: true }
            ]
        })
        setIsEditModalOpen(true)
    }

    const handleManageFeatures = (plan: Plan) => {
        setSelectedPlan(plan)
        const currentFeatures = features.map(f => {
            const planFeature = plan.features.find(pf => pf.id === f.id)
            return {
                id: f.id,
                value: planFeature ? planFeature.pivot.value : (f.type === 'boolean' ? 'false' : '0'),
                period: planFeature ? (planFeature.pivot.period || null) : null
            }
        })
        setFeatureData('features', currentFeatures)
        setIsFeaturesModalOpen(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedPlan) {
            patch(update(selectedPlan.id).url, {
                onSuccess: () => {
                    setIsEditModalOpen(false)
                    toast.push(<Notification title="Success" type="success">Plan updated successfully</Notification>)
                }
            })
        } else {
            post(store().url, {
                onSuccess: () => {
                    setIsEditModalOpen(false)
                    toast.push(<Notification title="Success" type="success">Plan created successfully</Notification>)
                }
            })
        }
    }

    const handleFeatureSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedPlan) {
            postFeatures(updateFeatures(selectedPlan.id).url, {
                onSuccess: () => {
                    setIsFeaturesModalOpen(false)
                    toast.push(<Notification title="Success" type="success">Features updated successfully</Notification>)
                }
            })
        }
    }

    const handleDelete = (id: number) => {
        if (confirm('Are you sure? All subscriptions for this plan will be affected!')) {
            router.delete(destroy(id).url, {
                onSuccess: () => toast.push(<Notification title="Deleted" type="success">Plan deleted successfully</Notification>)
            })
        }
    }

    return (
        <AdminLayout>
            <Head title="Subscription Plans" />
            <div className="flex flex-col gap-8">
                <header className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold">Subscription Plans</h1>
                        <p className="text-gray-500 text-sm">Design your offering, set prices and manage feature availability.</p>
                    </div>
                    <Button variant="solid" icon={<HiOutlinePlus />} onClick={handleCreate}>
                        Add Plan
                    </Button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {plans.map(plan => (
                        <Card key={plan.id} className="relative overflow-hidden flex flex-col h-full border-2 border-transparent hover:border-indigo-100 transition-all">
                            {!!plan.is_recommended && (
                                <div className="absolute top-0 right-0">
                                    <div className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-tighter px-4 py-1 rounded-bl-xl shadow-lg">
                                        Recommended
                                    </div>
                                </div>
                            )}

                            {!!plan.is_promoted && (
                                <div className="absolute top-0 left-0">
                                    <div className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-tighter px-4 py-1 rounded-br-xl shadow-lg flex items-center gap-1">
                                        <HiOutlineClock /> Promo
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex flex-col gap-4 grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">{plan.name}</h3>
                                        <div className="flex gap-2 mt-1">
                                            {(!plan.is_active) && <Badge content="Inactive" innerClass="bg-red-500" />}
                                            {!!plan.is_coming_soon && <Badge content="Coming Soon" innerClass="bg-amber-500" />}
                                            {!!plan.is_free && <Badge content="Free" innerClass="bg-emerald-500" />}
                                            {plan.prices.some(p => p.is_on_sale) && (
                                                <Badge 
                                                    content="Sale Active" 
                                                    innerClass="bg-rose-500 animate-pulse" 
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">{plan.description || 'No description provided.'}</p>
                                
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex flex-col gap-2">
                                    {plan.prices.map(price => (
                                        <div key={price.type} className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-400 uppercase">{price.type}ly</span>
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-2">
                                                    {price.sale_price !== null && price.sale_price !== undefined ? (
                                                        <>
                                                            <span className="line-through text-gray-400 opacity-50 text-xs font-normal">${price.price}</span>
                                                            <span className="text-indigo-600 font-bold">${price.sale_price}</span>
                                                        </>
                                                    ) : (
                                                        <span className="font-bold text-gray-900 dark:text-gray-100">${plan.is_free ? '0.00' : price.price}</span>
                                                    )}
                                                </div>
                                                {price.sale_price !== null && price.sale_price !== undefined && (
                                                    <span className="text-[9px] text-gray-400 mt-0.5">
                                                        Lowest last 30d: <span className="font-bold">${price.calculated_lowest_price || price.lowest_price_30d || price.price}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Included Features</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {plan.features.slice(0, 5).map(f => (
                                            <Badge key={f.id} innerClass="bg-gray-100 text-gray-700" content={`${f.name}: ${f.pivot.value}`} />
                                        ))}
                                        {plan.features.length > 5 && (
                                            <span className="text-[10px] text-gray-400 self-center">+{plan.features.length - 5} more</span>
                                        )}
                                        {plan.features.length === 0 && (
                                            <span className="text-[10px] text-gray-400 italic">No specific features assigned.</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-8 pt-4 border-t">
                                <Button size="sm" className="grow" icon={<HiOutlinePencil />} onClick={() => handleEdit(plan)}>Edit</Button>
                                <Button size="sm" icon={<HiOutlineAdjustments />} variant="default" onClick={() => handleManageFeatures(plan)} />
                                <Button size="sm" color="red" variant="default" icon={<HiOutlineTrash />} onClick={() => handleDelete(plan.id)} />
                            </div>
                        </Card>
                    ))}
                    {plans.length === 0 && (
                        <div className="col-span-full py-20 bg-white dark:bg-gray-900 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-gray-400 gap-4">
                            <HiOutlinePlus className="text-4xl opacity-20" />
                            <p className="font-medium tracking-wide">No subscription plans found. Start by adding one!</p>
                            <Button size="sm" onClick={handleCreate}>Create First Plan</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Plan Edit Modal */}
            <Drawer 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)}
                onRequestClose={() => setIsEditModalOpen(false)}
                title={selectedPlan ? `Edit Plan: ${selectedPlan.name}` : 'Create New Plan'}
                width={800}
                  footer={
                <div className="flex justify-end gap-2 w-full">
                    <Button type="button" variant="plain" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                    <Button type="submit"  variant="solid" loading={processing} form="plans-form">
                       {selectedPlan ? 'Save Changes' : 'Create Plan'}
                    </Button>
                </div>
            }
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                    <form id="plans-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 gap-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Plan Name</label>
                                <Input size="sm" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="e.g. Professional" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold uppercase text-gray-500">Description</label>
                                <Input size="sm" textArea value={data.description} onChange={e => setData('description', e.target.value)} placeholder="What's special about this plan?" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 items-end">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Display Order</label>
                                    <Input size="sm" type="number" value={data.display_order} onChange={e => setData('display_order', parseInt(e.target.value))} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-bold uppercase text-gray-500">Trial Days</label>
                                    <Input size="sm" type="number" value={data.trial_days} onChange={e => setData('trial_days', parseInt(e.target.value))} placeholder="0 = No Trial" />
                                </div>
                                <div className="flex  gap-2">
                                    <Switcher checked={data.is_recommended} onChange={val => setData('is_recommended', val)} />
                                    <span className="text-xs font-bold">Recommended Plan</span>
                                </div>
                                <div className="flex  gap-2">
                                    <Switcher checked={data.is_coming_soon} onChange={val => setData('is_coming_soon', val)} />
                                    <span className="text-xs font-bold">Coming Soon</span>
                                </div>
                                <div className="flex  gap-2">
                                    <Switcher checked={data.is_promoted} onChange={val => setData('is_promoted', val)} />
                                    <span className="text-xs font-bold">Promoted Flow</span>
                                </div>
                               
                            </div>
                            <div className="flex  gap-2">
                                <div className="flex gap-2">
                                    <Checkbox checked={data.is_free} onChange={val => setData('is_free', val)}>Is Free Plan</Checkbox>
                                </div>
                                <div className="flex  gap-2">
                                    <Checkbox checked={data.is_active} onChange={val => setData('is_active', val)}>Is Active (Visible)</Checkbox>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 ">
                            <h4 className="font-bold flex items-center gap-2">
                                <span className="p-2 bg-indigo-100 text-indigo-600 rounded-lg text-lg"><HiOutlinePlus /></span>
                                Pricing Configuration
                            </h4>
                            
                            {data.prices.map((price, index) => (
                                <div key={price.type} className="flex flex-col gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border">
                                    <div className="flex justify-between items-center">
                                        <span className="font-black text-xs uppercase tracking-widest text-indigo-600">{price.type}ly Price</span>
                                        <Switcher 
                                            checked={price.is_active} 
                                            onChange={val => {
                                                const newPrices = [...data.prices]
                                                newPrices[index].is_active = val
                                                setData('prices', newPrices)
                                            }} 
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Regular Price</span>
                                            <Input size="sm"
                                                disabled={data.is_free}
                                                prefix="$" 
                                                type="number" 
                                                value={price.price ?? 0} 
                                                onChange={e => {
                                                    const newPrices = [...data.prices]
                                                    newPrices[index].price = parseFloat(e.target.value) || 0
                                                    setData('prices', newPrices)
                                                }}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-1 justify-end">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Switcher 
                                                    checked={price.sale_price !== null && price.sale_price !== undefined} 
                                                    onChange={val => {
                                                        const newPrices = [...data.prices]
                                                        if (!val) {
                                                            newPrices[index].sale_price = null
                                                            newPrices[index].sale_start_at = null
                                                            newPrices[index].sale_ends_at = null
                                                        } else {
                                                            if (newPrices[index].sale_price === null || newPrices[index].sale_price === undefined) {
                                                                if (data.is_free) {
                                                                    newPrices[index].sale_price = 0
                                                                } else {
                                                                    newPrices[index].sale_price = price.price || 0
                                                                }
                                                            }
                                                              const formattedNow = dayjs().format('YYYY-MM-DD HH:mm:ss')
                                                              newPrices[index].sale_start_at = newPrices[index].sale_start_at || formattedNow
                                                              newPrices[index].sale_ends_at = newPrices[index].sale_ends_at || dayjs().add(1, 'month').format('YYYY-MM-DD HH:mm:ss')
                                                        }
                                                        setData('prices', newPrices)
                                                    }} 
                                                />
                                                <span className="text-[10px] font-bold uppercase text-indigo-600">Promotion</span>
                                            </div>
                                        </div>
                                    </div>

                                    {(price.sale_price !== null && price.sale_price !== undefined) && (
                                        <div className="flex flex-col gap-3 pt-3 border-t border-dashed animate-in fade-in slide-in-from-top-2">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Sale Price</span>
                                                <Input  size="sm"
                                                    disabled={data.is_free}
                                                    prefix="$" 
                                                    type="number" 
                                                    className="border-indigo-100"
                                                    value={price.sale_price ?? 0} 
                                                    onChange={e => {
                                                        const newPrices = [...data.prices]
                                                        newPrices[index].sale_price = parseFloat(e.target.value) || 0
                                                        setData('prices', newPrices)
                                                    }}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Sale Starts</span>
                                                    <DatePicker.DateTimepicker size="sm" amPm={false}
                                                        disabled={data.is_free}
                                                        placeholder="Select date & time"
                                                        value={price.sale_start_at ? dayjs(price.sale_start_at).toDate() : null}
                                                        onChange={(date) => {
                                                            const newPrices = [...data.prices]
                                                            const newDateStr = date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : null
                                                            
                                                            // Validation: if end date exists, start date cannot be after end date
                                                            if (newDateStr && newPrices[index].sale_ends_at && dayjs(newDateStr).isAfter(dayjs(newPrices[index].sale_ends_at as string))) {
                                                                toast.push(
                                                                    <Notification title="Błąd daty" type="danger">
                                                                        Data rozpoczęcia nie może być późniejsza niż data zakończenia.
                                                                    </Notification>
                                                                )
                                                                return
                                                            }
                                                            
                                                            newPrices[index].sale_start_at = newDateStr
                                                            setData('prices', newPrices)
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Sale Ends</span>
                                                    <DatePicker.DateTimepicker size="sm" amPm={false}
                                                        disabled={data.is_free}
                                                        placeholder="Select date & time"
                                                        value={price.sale_ends_at ? dayjs(price.sale_ends_at).toDate() : null}
                                                        onChange={(date) => {
                                                            const newPrices = [...data.prices]
                                                            const newDateStr = date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : null
                                                            
                                                            // Validation
                                                            const startDate = newPrices[index].sale_start_at ? dayjs(newPrices[index].sale_start_at as string) : dayjs()
                                                            if (newDateStr && dayjs(newDateStr).isBefore(startDate)) {
                                                                toast.push(
                                                                    <Notification title="Błąd daty" type="danger">
                                                                        Data zakończenia nie może być wcześniejsza niż data rozpoczęcia (lub teraz).
                                                                    </Notification>
                                                                )
                                                                return
                                                            }

                                                            newPrices[index].sale_ends_at = newDateStr
                                                            setData('prices', newPrices)
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Lowest Price (Last 30 days) - Omnibus</span>
                                                    <Badge content="Auto-calculated" innerClass="text-[8px] bg-rose-50 text-rose-600 border-rose-100" />
                                                </div>
                                                <div className="h-10 px-3 flex items-center bg-gray-50 dark:bg-gray-900 border border-dashed rounded-lg text-sm font-black text-gray-900 dark:text-gray-100 italic opacity-80">
                                                    $ {Number(price.calculated_lowest_price || price.lowest_price_30d || 0).toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            </div>
                        </div>
                    </form>

                    {/* Live Preview Section */}
                    <div className="flex flex-col gap-4 sticky top-0 h-fit">
                        <h4 className="text-xs font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live Preview
                        </h4>
                        
                        <div className="bg-gray-100 dark:bg-gray-900 rounded-3xl p-6 border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center min-h-[500px]">
                            <Card className={cn(
                                "relative overflow-hidden flex flex-col h-full w-full max-w-[350px] border-2 transition-all shadow-xl bg-white dark:bg-gray-900",
                                data.is_recommended ? "border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20" : "border-gray-100 dark:border-gray-800"
                            )}>
                                {!!data.is_recommended && (
                                    <div className="absolute top-0 right-0">
                                        <div className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-tighter px-4 py-1 rounded-bl-xl shadow-lg">
                                            Recommended
                                        </div>
                                    </div>
                                )}

                                {!!data.is_promoted && (
                                    <div className="absolute top-0 left-0">
                                        <div className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-tighter px-4 py-1 rounded-br-xl shadow-lg flex items-center gap-1">
                                            <HiOutlineClock /> Promo
                                        </div>
                                    </div>
                                )}

                                {data.trial_days > 0 && (
                                    <span className="absolute top-10 right-4 bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest animate-pulse border border-indigo-200">
                                        {data.trial_days} dni testów
                                    </span>
                                )}
                                
                                <div className="flex flex-col gap-4 grow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">{data.name || 'Plan Name'}</h3>
                                            <div className="flex gap-2 mt-1">
                                                {(!data.is_active) && <Badge content="Inactive" innerClass="bg-red-500" />}
                                                {!!data.is_coming_soon && <Badge content="Coming Soon" innerClass="bg-amber-500" />}
                                                {!!data.is_free && <Badge content="Free" innerClass="bg-emerald-500" />}
                                                {data.prices.some(p => p.sale_price !== null && p.sale_price !== undefined) && (
                                                    <Badge 
                                                        content="Sale Active" 
                                                        innerClass="bg-rose-500 animate-pulse" 
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-500 line-clamp-3 min-h-[60px]">{data.description || 'Provide a description to see how it looks here.'}</p>
                                    
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex flex-col gap-2">
                                        {data.prices.filter(p => p.is_active).map(price => (
                                            <div key={price.type} className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{price.type}ly</span>
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-2">
                                                        {price.sale_price !== null && price.sale_price !== undefined ? (
                                                            <>
                                                                <span className="line-through text-gray-400 opacity-50 text-xs font-normal">${price.price}</span>
                                                                <span className="text-indigo-600 font-bold">${price.sale_price}</span>
                                                            </>
                                                        ) : (
                                                            <span className="font-bold text-gray-900 dark:text-gray-100">${data.is_free ? '0.00' : price.price}</span>
                                                        )}
                                                    </div>
                                                    {price.sale_price !== null && price.sale_price !== undefined && (
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-[9px] text-gray-400 mt-0.5">
                                                                Lowest last 30d: <span className="font-bold">${price.calculated_lowest_price || price.lowest_price_30d || price.price}</span>
                                                            </span>
                                                            {price.sale_ends_at && dayjs(price.sale_ends_at).isAfter(dayjs()) && (
                                                                <div className="text-[9px] font-bold text-rose-500 flex items-center gap-1 animate-pulse">
                                                                    <HiOutlineClock className="w-2.5 h-2.5" /> Ends {dayjs(price.sale_ends_at).fromNow()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Selected Features</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedPlan?.features.slice(0, 3).map(f => (
                                                <Badge key={f.id} innerClass="bg-gray-100 text-gray-700" content={`${f.name}`} />
                                            ))}
                                            <span className="text-[10px] text-gray-400 italic">Preview only (Plan basic info)</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </Drawer>

            {/* Features Sync Modal */}
            <Dialog
                isOpen={isFeaturesModalOpen}
                onClose={() => setIsFeaturesModalOpen(false)}
                width={600}
            >
                <div className="flex flex-col gap-1 mb-6">
                    <h3 className="text-xl font-bold">{`Manage Plan Features: ${selectedPlan?.name}`}</h3>
                </div>
                <form onSubmit={handleFeatureSubmit} className="flex flex-col gap-6 mt-4">
                    <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto px-1">
                        {features.map((f, index) => {
                            const featureIdx = featureData.features.findIndex(fd => fd.id === f.id)
                            const currentVal = featureIdx !== -1 ? featureData.features[featureIdx].value : (f.type === 'boolean' ? 'false' : '0')

                            return (
                                <div key={f.id} className="p-4 border rounded-xl flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-bold">{f.name}</span>
                                        <span className="text-[10px] font-black uppercase text-gray-400 opacity-50">{f.slug}</span>
                                    </div>

                                    <div className="w-1/2 flex items-center gap-3">
                                        {f.type === 'boolean' ? (
                                            <Switcher 
                                                checked={currentVal === 'true'} 
                                                onChange={val => {
                                                    const newFeats = [...featureData.features]
                                                    if (featureIdx !== -1) {
                                                        newFeats[featureIdx].value = val ? 'true' : 'false'
                                                    } else {
                                                        newFeats.push({ id: f.id, value: val ? 'true' : 'false', period: null })
                                                    }
                                                    setFeatureData('features', newFeats)
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center gap-4 w-full">
                                                <Input 
                                                    size="sm"
                                                    type="number"
                                                    disabled={currentVal === 'unlimited'}
                                                    value={currentVal === 'unlimited' ? '' : currentVal}
                                                    placeholder="Limit"
                                                    onChange={e => {
                                                        const newFeats = [...featureData.features]
                                                        if (featureIdx !== -1) {
                                                            newFeats[featureIdx].value = e.target.value
                                                        } else {
                                                            newFeats.push({ id: f.id, value: e.target.value, period: null })
                                                        }
                                                        setFeatureData('features', newFeats)
                                                    }}
                                                />
                                                <div className="flex items-center gap-2 whitespace-nowrap">
                                                    <Checkbox 
                                                        checked={currentVal === 'unlimited'}
                                                        onChange={val => {
                                                            const newFeats = [...featureData.features]
                                                            const newVal = val ? 'unlimited' : '0'
                                                            if (featureIdx !== -1) {
                                                                newFeats[featureIdx].value = newVal
                                                            } else {
                                                                newFeats.push({ id: f.id, value: newVal, period: null })
                                                            }
                                                            setFeatureData('features', newFeats)
                                                        }}
                                                    >
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Unlimited</span>
                                                    </Checkbox>
                                                </div>
                                                <div className="w-1/3 min-w-[100px]">
                                                    {(() => {
                                                        const periodOptions = [
                                                            { label: 'Total (None)', value: '' },
                                                            { label: 'Daily', value: 'daily' },
                                                            { label: 'Weekly', value: 'weekly' },
                                                            { label: 'Monthly', value: 'monthly' },
                                                        ]
                                                        const currentPeriod = featureIdx !== -1 ? featureData.features[featureIdx].period || '' : ''

                                                        return (
                                                            <Select
                                                                size="sm"
                                                                placeholder="Period"
                                                                value={periodOptions.find(opt => opt.value === currentPeriod)}
                                                                options={periodOptions}
                                                                onChange={val => {
                                                                    const newFeats = [...featureData.features]
                                                                    const periodVal = (val as any)?.value || null
                                                                    if (featureIdx !== -1) {
                                                                        newFeats[featureIdx].period = periodVal
                                                                    } else {
                                                                        newFeats.push({ id: f.id, value: currentVal, period: periodVal })
                                                                    }
                                                                    setFeatureData('features', newFeats)
                                                                }}
                                                            />
                                                        )
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                        {features.length === 0 && (
                            <div className="text-center py-10 opacity-50 italic">No features defined. Create features first!</div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="plain" onClick={() => setIsFeaturesModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="solid" loading={featureProcessing}>Save Feature Set</Button>
                    </div>
                </form>
            </Dialog>
        </AdminLayout>
    )
}
