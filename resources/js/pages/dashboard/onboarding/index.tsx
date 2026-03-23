import { useForm, Head, router } from '@inertiajs/react';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ArrowLeft, Plus, X, Rocket, Users, Check, Sparkles, BarChart3, Clock } from 'lucide-react';
import { useState } from 'react';
import { Button, Input, FormItem, Notification, toast } from '@/components/ui';
import cn from '@/components/ui/utils/classNames';
import { plan as planRoute, finish as finishRoute, back as backRoute } from '@/routes/onboarding';
import 'dayjs/locale/pl';

dayjs.extend(relativeTime);
dayjs.locale('pl');

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

type Props = {
    initialStep: number;
    plans: Plan[];
};

export default function Onboarding({ initialStep, plans }: Props) {
    const [step, setStep] = useState(initialStep);
    const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: 'fixed' | 'percentage'; value: string } | null>(null);
    const [couponError, setCouponError] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<number>(0);
    
    const { post, setData, data, processing, errors } = useForm({
        name: '',
        plan_id: 0,
        billing_cycle: 'month',
        invites: [''],
        companySize: '',
        industry: '',
        referralSource: '',
    });

    const addInvite = () => {
        setData('invites', [...data.invites, '']);
    };

    const removeInvite = (index: number) => {
        const newInvites = [...data.invites];
        newInvites.splice(index, 1);
        setData('invites', newInvites);
    };

    const updateInvite = (index: number, value: string) => {
        const newInvites = [...data.invites];
        newInvites[index] = value;
        setData('invites', newInvites);
    };

    const submitStep1 = (e: React.FormEvent) => {
        e.preventDefault();
        post('/onboarding', {
            onSuccess: () => {
                setStep(2);
                toast.push(
                    <Notification title="Sukces" type="success">
                        Przestrzeń robocza została utworzona!
                    </Notification>
                );
            },
            onError: (err) => {
                console.error('Onboarding errors:', err);
                toast.push(
                    <Notification title="Błąd" type="danger">
                        Sprawdź dane swojej przestrzeni roboczej.
                    </Notification>
                );
            }
        });
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setValidatingCoupon(true);
        setCouponError('');
        try {
            const response = await axios.post('/coupons/validate', { code: couponCode });
            setAppliedCoupon(response.data);
            toast.push(
                <Notification title="Kupon zastosowany" type="success">
                    Zniżka została naliczona!
                </Notification>
            );
        } catch (err: any) {
            setAppliedCoupon(null);
            setCouponError(err.response?.data?.message || 'Nie udało się zweryfikować kuponu.');
        } finally {
            setValidatingCoupon(false);
        }
    };

    const getPriceWithDiscount = (price: string) => {
        if (!appliedCoupon) return price;
        const p = parseFloat(price);
        const v = parseFloat(appliedCoupon.value);
        if (appliedCoupon.type === 'percentage') {
            return (p * (1 - v / 100)).toFixed(2);
        }
        return Math.max(0, p - v).toFixed(2);
    };

    const goBack = () => {
        router.post(backRoute().url, {}, {
            onSuccess: () => {
                setStep(s => s - 1);
            }
        });
    };

    const submitPlan = () => {
        if (selectedPlanId === 0) return;
        setData(d => ({ ...d, plan_id: selectedPlanId, billing_cycle: billingCycle }));
        
        router.post(
            planRoute().url, 
            {
                plan_id: selectedPlanId,
                billing_cycle: billingCycle,
                coupon_code: appliedCoupon?.code
            },
            {
                onSuccess: () => {
                    setStep(3);
                    toast.push(
                        <Notification title="Plan wybrany" type="success">
                            Twój plan został pomyślnie wybrany. Teraz możesz zaprosić swój zespół.
                        </Notification>
                    );
                }
            }
        );
    };

    const finish = () => {
        // Filter out empty strings before sending
        const payload = {
            ...data,
            invites: data.invites.filter(i => i && i.trim() !== '')
        };

        router.post(finishRoute().url, payload, {
            onSuccess: () => {
                window.location.href = '/dashboard';
            },
            onError: (err: any) => {
                console.error('Finish errors:', err);
                if (err.invites) {
                    toast.push(
                        <Notification title="Błąd zaproszeń" type="danger">
                            {err.invites}
                        </Notification>
                    );
                }
                // Handle nested errors like invites.0
                const firstInviteError = Object.keys(err).find(k => k.startsWith('invites.'));
                if (firstInviteError) {
                     toast.push(
                        <Notification title="Błąd zaproszeń" type="danger">
                            Jeden lub więcej adresów e-mail jest nieprawidłowych.
                        </Notification>
                    );
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6">
            <Head title="Konfiguracja OrbitFlow" />
            
            {/* Step Progress */}
            <div className="w-full max-w-xl mb-8 flex justify-between items-center px-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-2",
                            step >= s ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-400"
                        )}>
                            {step > s ? <Check className="w-6 h-6" /> : s}
                        </div>
                        {s < 3 && (
                            <div className={cn(
                                "h-1 flex-1 mx-2 rounded-full",
                                step > s ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-800"
                            )}></div>
                        )}
                    </div>
                ))}
            </div>

            <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-indigo-600 p-8 text-white text-center relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm">
                                    <Rocket className="w-8 h-8" />
                                </div>
                                <h1 className="text-3xl font-extrabold tracking-tight">Twoja Przestrzeń</h1>
                                <p className="mt-2 text-indigo-100 text-lg">Zacznijmy od podstaw.</p>
                            </div>
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50"></div>
                        </div>

                        <form onSubmit={submitStep1} className="p-8 space-y-8">
                            <div className="space-y-6">
                                <FormItem label="Nazwa Przestrzeni Roboczej" invalid={!!errors.name} errorMessage={errors.name}>
                                    <Input
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Np. Moja Firma"
                                        className="h-14 text-lg rounded-xl border-gray-200 focus:border-indigo-500"
                                        required
                                    />
                                </FormItem>
                            </div>
                            <Button variant="solid" type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-indigo-200" loading={processing}>
                                Kontynuuj <Rocket className="ml-2 w-5 h-5" />
                            </Button>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-purple-600 p-8 text-white text-center relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <h1 className="text-3xl font-extrabold tracking-tight">Wybierz plan</h1>
                                <p className="mt-2 text-purple-100 text-lg">Dostosuj OrbitFlow do swoich potrzeb.</p>
                            </div>
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-50"></div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex justify-center mb-4">
                                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex gap-1">
                                    <button 
                                        onClick={() => setBillingCycle('month')}
                                        className={cn(
                                            "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                                            billingCycle === 'month' ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600" : "text-gray-500"
                                        )}
                                    >
                                        Miesięcznie
                                    </button>
                                    <button 
                                        onClick={() => setBillingCycle('year')}
                                        className={cn(
                                            "px-4 py-2 text-xs font-bold rounded-lg transition-all",
                                            billingCycle === 'year' ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600" : "text-gray-500"
                                        )}
                                    >
                                        Rocznie <span className="text-[10px] text-green-500 ml-1">-20%</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {plans.map((plan) => (
                                    <div key={plan.id} className={cn(
                                        "relative group p-5 rounded-2xl border-2 transition-all hover:shadow-md cursor-pointer",
                                        plan.id === selectedPlanId ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-indigo-100" : (plan.is_recommended ? "border-purple-600 bg-purple-50/50 dark:bg-purple-900/10" : "border-gray-100 dark:border-gray-800 hover:border-purple-200"),
                                        plan.is_coming_soon && "opacity-75 cursor-not-allowed"
                                    )} onClick={() => !plan.is_coming_soon && setSelectedPlanId(plan.id)}>
                                        {!!plan.is_recommended && (
                                            <span className="absolute -top-3 right-4 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Najczęściej wybierany</span>
                                        )}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">{plan.name}</h3>
                                                    {plan.trial_days && plan.trial_days > 0 && (
                                                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest animate-pulse border border-indigo-200">
                                                            {plan.trial_days} dni testów
                                                        </span>
                                                    )}
                                                </div>
                                                <ul className="mt-2 space-y-1">
                                                    {plan.features.slice(0, 3).map((f) => (
                                                        <li key={f.id} className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                            <Check className="w-4 h-4 text-green-500" /> {f.name}: {f.pivot.value === 'true' ? 'Tak' : f.pivot.value === 'false' ? 'Nie' : f.pivot.value === 'unlimited' ? 'Bez limitu' : f.pivot.value}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                {plan.is_coming_soon ? (
                                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Wkrótce</span>
                                                ) : (
                                                    <>
                                                        {(() => {
                                                            const price = plan.prices.find(p => p.type === billingCycle);
                                                            if (plan.is_free) return <span className="text-2xl font-black text-gray-900 dark:text-gray-100">0 zł</span>;
                                                            if (!price) return <span className="text-2xl font-black text-gray-900 dark:text-gray-100">N/A</span>;
                                                            
                                                            const basePrice = price.sale_price || price.price;
                                                            const discountedPrice = getPriceWithDiscount(basePrice);

                                                            return (
                                                                <>
                                                                    <div className="flex flex-col items-end">
                                                                        <div className="flex items-center justify-end gap-2 text-right">
                                                                            {price.is_on_sale || appliedCoupon ? (
                                                                                <>
                                                                                    <span className="text-sm line-through text-gray-400 opacity-60 font-normal">
                                                                                        {appliedCoupon ? (price.sale_price || price.price) : price.price} zł
                                                                                    </span>
                                                                                    <span className="text-2xl font-black text-indigo-600">{discountedPrice} zł</span>
                                                                                </>
                                                                            ) : (
                                                                                <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{price.price} zł</span>
                                                                            )}
                                                                        </div>
                                                                        {price.is_on_sale && !appliedCoupon && (
                                                                            <div className="flex flex-col items-end gap-1 mt-1">
                                                                                <div className="text-[10px] text-gray-400 italic text-right">
                                                                                    Najniższa cena z 30 dni: <span className="font-bold">{price.calculated_lowest_price || price.lowest_price_30d || price.price} zł</span>
                                                                                </div>
                                                                                {price.sale_ends_at && dayjs(price.sale_ends_at).isAfter(dayjs()) && (
                                                                                    <div className="text-[10px] font-bold text-rose-500 flex items-center gap-1 justify-end animate-pulse">
                                                                                        <Clock className="w-3 h-3" /> Koniec {dayjs(price.sale_ends_at).fromNow()}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
                                                        <p className="text-xs text-gray-400">{billingCycle === 'month' ? 'miesięcznie' : 'rocznie'}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {plans.some(p => !p.is_free) && (
                                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-4">
                                        <Sparkles className="w-5 h-5 text-purple-500" />
                                        <span className="text-sm font-semibold uppercase tracking-wider">Kod promocyjny</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            placeholder="Masz kod kuponu?"
                                            className={cn("h-11 rounded-lg border-gray-200", couponError && "border-red-500")}
                                            disabled={!!appliedCoupon}
                                        />
                                        {appliedCoupon ? (
                                            <Button variant="default" className="h-11" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}>
                                                Usuń
                                            </Button>
                                        ) : (
                                            <Button variant="solid" className="h-11 px-6 bg-purple-600 hover:bg-purple-700 font-bold" onClick={handleApplyCoupon} loading={validatingCoupon}>
                                                Zastosuj
                                            </Button>
                                        )}
                                    </div>
                                    {couponError && <p className="text-xs text-red-500 mt-2 font-medium">{couponError}</p>}
                                    {appliedCoupon && (
                                        <p className="text-xs text-green-600 mt-2 font-bold flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Kod {appliedCoupon.code} aktywny: {appliedCoupon.type === 'percentage' ? `-${appliedCoupon.value}%` : `-${appliedCoupon.value} zł`}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="pt-4">
                                <Button 
                                    variant="solid" 
                                    onClick={submitPlan} 
                                    disabled={selectedPlanId === 0} 
                                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg font-bold shadow-xl shadow-indigo-200"
                                    loading={processing}
                                >
                                    Przejdź dalej <Rocket className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-emerald-600 p-8 text-white text-center relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm">
                                    <BarChart3 className="w-8 h-8" />
                                </div>
                                <h1 className="text-3xl font-extrabold tracking-tight">Kilka pytań</h1>
                                <p className="mt-2 text-emerald-100 text-lg">Chcemy Cię lepiej poznać.</p>
                            </div>
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-50"></div>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="space-y-6">
                                <FormItem label="Wielkość Twojej firmy">
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Sam', '0-10 osób', '10-20 osób', '20+ osób'].map((opt) => (
                                            <button key={opt} onClick={() => setData('companySize', opt)} className={cn(
                                                "p-3 text-sm font-medium rounded-xl border-2 transition-all",
                                                data.companySize === opt ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-100 hover:border-emerald-200"
                                            )}>{opt}</button>
                                        ))}
                                    </div>
                                </FormItem>

                                <FormItem label="Dziedzina działalności">
                                    <Input
                                        value={data.industry}
                                        onChange={(e) => setData('industry', e.target.value)}
                                        placeholder="Np. IT, Marketing, Budownictwo..."
                                        className="h-12 rounded-xl border-gray-200"
                                    />
                                </FormItem>

                                <FormItem label="Jak o nas usłyszałeś?">
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Google', 'Social Media', 'Znajomy', 'Inne'].map((opt) => (
                                            <button key={opt} onClick={() => setData('referralSource', opt)} className={cn(
                                                "p-3 text-sm font-medium rounded-xl border-2 transition-all",
                                                data.referralSource === opt ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-100 hover:border-emerald-200"
                                            )}>{opt}</button>
                                        ))}
                                    </div>
                                </FormItem>

                                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <Users className="w-5 h-5 text-emerald-500" />
                                        <span className="text-sm font-semibold uppercase tracking-wider">Zaproś zespół</span>
                                    </div>
                                    <div className="space-y-3">
                                        {data.invites.map((email, index) => (
                                            <div key={index} className="space-y-1">
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="email"
                                                        value={email}
                                                        onChange={(e) => updateInvite(index, e.target.value)}
                                                        placeholder="email@przyklad.pl"
                                                        className={cn("h-11 rounded-lg border-gray-200", errors[`invites.${index}`] && "border-red-500")}
                                                    />
                                                    {data.invites.length > 1 && (
                                                        <Button type="button" variant="default" className="h-11 w-11 p-0" onClick={() => removeInvite(index)}>
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                {errors[`invites.${index}`] && (
                                                    <p className="text-xs text-red-500">{errors[`invites.${index}`]}</p>
                                                )}
                                            </div>
                                        ))}
                                        <div className="flex justify-between items-center">
                                            <button type="button" onClick={addInvite} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-2">
                                                <Plus className="w-4 h-4" /> Dodaj e-mail
                                            </button>
                                            <span className="text-[10px] text-gray-400 uppercase font-bold">
                                                Limit planu: {(() => {
                                                    const plan = plans.find(p => p.id === data.plan_id);
                                                    const feat = plan?.features.find(f => f.slug === 'max-users');
                                                    return feat?.pivot.value === 'unlimited' ? 'Bez limitu' : `${feat?.pivot.value || '1'} osób`;
                                                })()}
                                            </span>
                                        </div>
                                        {errors.invites && (
                                            <p className="text-sm text-red-500 font-bold mt-2">{errors.invites}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button 
                                    variant="default" 
                                    onClick={goBack} 
                                    className="flex-1 h-14 rounded-2xl text-lg font-bold"
                                >
                                    <ArrowLeft className="mr-2 w-5 h-5" /> Wróć
                                </Button>
                                <Button 
                                    variant="solid" 
                                    onClick={finish} 
                                    className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-xl shadow-emerald-200"
                                    loading={processing}
                                >
                                    Zakończ
                                </Button>
                            </div>
                            <button onClick={finish} className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 transition-all italic">Pomiń i przejdź do panelu</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
