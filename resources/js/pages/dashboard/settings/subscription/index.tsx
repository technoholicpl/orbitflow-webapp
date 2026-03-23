import { Head, useForm, router } from '@inertiajs/react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import React, { useState } from 'react'
import { HiOutlineCheck, HiOutlineSparkles, HiOutlineCalendar, HiOutlineClock } from 'react-icons/hi'
import { Button, Card, Badge, Notification, toast, Tag, Input } from '@/components/ui'
import cn from '@/components/ui/utils/classNames'
import DashboardLayout from '@/layouts/DashboardLayout'
import SettingsLayout from '@/layouts/settings/layout'
import { update as updateRoute } from '@/routes/workspace/subscription'
import 'dayjs/locale/pl'

dayjs.extend(relativeTime)
dayjs.locale('pl')
import axios from 'axios'

interface Feature {
    id: number
    name: string
    slug: string
    type: 'boolean' | 'limit'
}

interface PlanPrice {
    id: number
    type: 'month' | 'year'
    price: string
    sale_price?: string
    sale_start_at?: string
    sale_ends_at?: string
    lowest_price_30d?: string
    calculated_lowest_price?: string
    is_on_sale?: boolean
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
    trial_days: number | null
    prices: PlanPrice[]
    features: (Feature & { pivot: { value: string } })[]
}

interface Workspace {
    id: number
    name: string
    plan_id: number | null
    subscription_status: string
    subscription_ends_at: string | null
    trial_ends_at: string | null
    coupon_code: string | null
    isOnTrial?: boolean
    trialDaysRemaining?: number
    plan?: Plan
}

interface Props {
    workspace: Workspace
    plans: Plan[]
}

export default function SubscriptionIndex({ workspace, plans }: Props) {
    const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month')
    const [couponCode, setCouponCode] = useState(workspace.coupon_code || '')
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: 'fixed' | 'percentage'; value: string } | null>(null)
    const [couponError, setCouponError] = useState('')
    const [validatingCoupon, setValidatingCoupon] = useState(false)

    const { setData, processing } = useForm({
        plan_id: null as number | null,
        billing_cycle: 'month',
        coupon_code: null as string | null
    })

    const handleApplyCoupon = async () => {
        if (!couponCode) return
        setValidatingCoupon(true)
        setCouponError('')
        try {
            const response = await axios.post('/coupons/validate', { code: couponCode })
            setAppliedCoupon(response.data)
            toast.push(
                <Notification title="Kupon zastosowany" type="success">
                    Zniżka została naliczona!
                </Notification>
            )
        } catch (err: any) {
            setAppliedCoupon(null)
            setCouponError(err.response?.data?.message || 'Nie udało się zweryfikować kuponu.')
        } finally {
            setValidatingCoupon(false)
        }
    }

    const getPriceWithDiscount = (price: string) => {
        if (!appliedCoupon) return price
        const p = parseFloat(price)
        const v = parseFloat(appliedCoupon.value)
        if (appliedCoupon.type === 'percentage') {
            return (p * (1 - v / 100)).toFixed(2)
        }
        return Math.max(0, p - v).toFixed(2)
    }

    const handleUpgrade = (planId: number) => {
        setData(d => ({ ...d, plan_id: planId, billing_cycle: billingCycle, coupon_code: appliedCoupon?.code || null }));
        
        router.patch(
            // @ts-ignore
            updateRoute().url, 
            {
                plan_id: planId,
                billing_cycle: billingCycle,
                coupon_code: appliedCoupon?.code || null
            },
            {
                onSuccess: () => {
                    toast.push(
                        <Notification title="Success" type="success">
                            Subscription updated successfully!
                        </Notification>
                    )
                }
            }
        )
    }

    const currentPlan = workspace.plan

    return (
          <DashboardLayout title="Subscription">
                <SettingsLayout>
            <Head title="Subscription Settings" />
            
            <div className="flex flex-col gap-8">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Subscription Management</h2>
                    <p className="text-gray-500">View your current plan and explore available upgrades.</p>
                </div>

                {/* Current Plan Card */}
                <Card className="border-2 border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-900/10">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Your Current Plan</span>
                            <div className="flex items-center gap-3">
                                <h3 className="text-3xl font-black text-gray-900 dark:text-gray-100">
                                    {currentPlan ? currentPlan.name : 'Free Trial'}
                                </h3>
                                <Badge 
                                    content={workspace.isOnTrial ? 'Trial' : (workspace.subscription_status || 'Active')} 
                                    innerClass={cn("uppercase text-[10px] px-2 py-0.5", workspace.isOnTrial ? "bg-indigo-500" : "bg-emerald-500")}
                                />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                                {currentPlan?.description || 'You are currently on a limited free trial. Upgrade to unlock more features.'}
                            </p>
                            
                            {workspace.isOnTrial && workspace.trial_ends_at && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-indigo-600 font-bold">
                                    <HiOutlineSparkles className="animate-pulse" />
                                    <span>Trial ends in: <b>{workspace.trialDaysRemaining} days</b> ({new Date(workspace.trial_ends_at).toLocaleDateString()})</span>
                                </div>
                            )}

                            {!workspace.isOnTrial && workspace.subscription_ends_at && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                    <HiOutlineCalendar className="text-gray-400" />
                                    <span>Renewal date: <b>{new Date(workspace.subscription_ends_at).toLocaleDateString()}</b></span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="text-sm text-gray-400 uppercase font-bold tracking-tighter">Plan Features</span>
                                <div className="flex gap-1 mt-1">
                                    {(currentPlan?.features || []).slice(0, 3).map(f => (
                                        <Tag key={f.id} className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">{f.name}</Tag>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">Available Plans</h3>
                            <p className="text-sm text-gray-500">Choose the best plan for your team's growth.</p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Coupon Section */}
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex gap-2">
                                    <Input
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="Kod kuponu"
                                        className={cn("h-9 rounded-lg border-gray-200 text-xs w-32", couponError && "border-red-500")}
                                        disabled={!!appliedCoupon}
                                    />
                                    {appliedCoupon ? (
                                        <Button size="sm" variant="default" className="h-9" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}>
                                            Usuń
                                        </Button>
                                    ) : (
                                        <Button size="sm" variant="solid" className="h-9 px-4 bg-purple-600 hover:bg-purple-700 font-bold text-xs" onClick={handleApplyCoupon} loading={validatingCoupon}>
                                            Zastosuj
                                        </Button>
                                    )}
                                </div>
                                {couponError && <p className="text-[10px] text-red-500 font-medium">{couponError}</p>}
                                {appliedCoupon && (
                                    <p className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                                        <HiOutlineCheck className="w-3 h-3" /> Kod {appliedCoupon.code} aktywny
                                    </p>
                                )}
                            </div>

                            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex gap-1">
                                <button 
                                    onClick={() => setBillingCycle('month')}
                                    className={cn(
                                        "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                                        billingCycle === 'month' ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600" : "text-gray-500"
                                    )}
                                >
                                    Monthly
                                </button>
                                <button 
                                    onClick={() => setBillingCycle('year')}
                                    className={cn(
                                        "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                                        billingCycle === 'year' ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600" : "text-gray-500"
                                    )}
                                >
                                    Yearly <span className="text-[10px] text-green-500 ml-1">-20%</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <Card 
                                key={plan.id}
                                className={cn(
                                    "relative flex flex-col h-full border-2 transition-all hover:border-indigo-200",
                                    plan.id === workspace.plan_id ? "border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20" : "border-gray-100 dark:border-gray-800"
                                )}
                            >
                                {!!plan.is_recommended && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                        Recommended
                                    </div>
                                )}
                                {plan.trial_days && plan.trial_days > 0 && (
                                    <span className="absolute -top-3 right-4 bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest animate-pulse border border-indigo-200">
                                        {plan.trial_days} dni testów
                                    </span>
                                )}
                                <div className="flex flex-col gap-4 grow">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-lg font-black text-gray-900 dark:text-gray-100">{plan.name}</h4>
                                        {plan.id === workspace.plan_id && (
                                            <Badge content="Current" innerClass="bg-indigo-500" />
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-col">
                                        <div className="flex items-baseline gap-2">
                                            {(() => {
                                                const price = plan.prices.find(p => p.type === billingCycle);
                                                if (plan.is_free) return <span className="text-3xl font-black text-gray-900 dark:text-gray-100">0 zł</span>;
                                                if (!price) return <span className="text-3xl font-black text-gray-900 dark:text-gray-100">N/A</span>;
                                                
                                                const basePrice = price.sale_price || price.price;
                                                const discountedPrice = getPriceWithDiscount(basePrice);

                                                return (
                                                    <div className="flex flex-col">
                                                        <div className="flex items-baseline gap-2">
                                                            {price.is_on_sale || appliedCoupon ? (
                                                                <>
                                                                    <span className="text-sm line-through text-gray-400 opacity-60 font-normal">
                                                                        {appliedCoupon ? (price.sale_price || price.price) : price.price} zł
                                                                    </span>
                                                                    <span className="text-3xl font-black text-indigo-600">{discountedPrice} zł</span>
                                                                </>
                                                            ) : (
                                                                <span className="text-3xl font-black text-gray-900 dark:text-gray-100">{price.price} zł</span>
                                                            )}
                                                            {!plan.is_free && <span className="text-xs text-gray-400 lowercase">/{billingCycle}</span>}
                                                        </div>
                                                        {price.is_on_sale && !appliedCoupon && (
                                                            <>
                                                                <div className="text-[10px] text-gray-400 mt-1 italic">
                                                                    Najniższa cena z 30 dni: <span className="font-bold">{price.calculated_lowest_price || price.lowest_price_30d || price.price} zł</span>
                                                                </div>
                                                                {price.sale_ends_at && dayjs(price.sale_ends_at).isAfter(dayjs()) && (
                                                                    <div className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1 animate-pulse">
                                                                        <HiOutlineClock className="w-3 h-3" /> Koniec {dayjs(price.sale_ends_at).fromNow()}
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 min-h-[32px]">{plan.description}</p>

                                    <div className="flex flex-col gap-2 mt-4">
                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Included Features</span>
                                            <ul className="mt-4 space-y-2">
                                                {(plan.features || []).slice(0, 4).map(f => (
                                                    <li key={f.id} className="flex items-center gap-2 text-sm text-gray-500">
                                                        <HiOutlineCheck className="text-green-500 w-4 h-4" />
                                                        {f.name}: {f.pivot.value === 'true' ? 'Tak' : f.pivot.value === 'false' ? 'Nie' : f.pivot.value === 'unlimited' ? 'Bez limitu' : f.pivot.value}
                                                    </li>
                                                ))}
                                            </ul>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    {plan.id === workspace.plan_id ? (
                                        <Button variant="default" block disabled>Your current plan</Button>
                                    ) : plan.is_coming_soon ? (
                                        <Button variant="default" block disabled>Coming Soon</Button>
                                    ) : (
                                        <Button 
                                            variant={plan.is_recommended ? 'solid' : 'default'} 
                                            block 
                                            loading={processing}
                                            onClick={() => handleUpgrade(plan.id)}
                                        >
                                            {plan.trial_days && plan.trial_days > 0 && (!workspace.plan_id || workspace.plan?.is_free) ? `Start ${plan.trial_days} Day Trial` : (plan.is_free ? 'Switch to Free' : 'Upgrade Now')}
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* FAQ or Info Section */}
                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 mt-4">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                            <HiOutlineSparkles className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">Need a Custom Plan?</h3>
                            <p className="text-sm text-gray-500">Contact our sales team for enterprise-grade solutions.</p>
                        </div>
                        <Button variant="default" size="sm" className="ml-auto">Contact Sales</Button>
                    </div>
                </div>
            </div>
        </SettingsLayout>
        </DashboardLayout>
    )
}
