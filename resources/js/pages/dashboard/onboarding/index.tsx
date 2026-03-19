import { useForm, Head } from '@inertiajs/react';
import { Button, Input, FormItem, Notification, toast, Select } from '@/components/ui';
import { useState, useEffect } from 'react';
import { Plus, X, Rocket, Users, Check, Sparkles, Building2, BarChart3, Search } from 'lucide-react';
import cn from '@/components/ui/utils/classNames';

type Props = {
    initialStep: number;
};

export default function Onboarding({ initialStep }: Props) {
    const [step, setStep] = useState(initialStep);
    
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        invites: [''],
        // Survey data
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

    const nextStep = () => {
        setStep(step + 1);
    };

    const finish = () => {
        window.location.href = '/dashboard';
    };

    const plans = [
        { id: 'basic', name: 'Basic', price: '0 zł', features: ['Do 3 projektów', 'Podstawowe raporty', '1 użytkownik'] },
        { id: 'standard', name: 'Standard', price: '49 zł', features: ['Nielimitowane projekty', 'Zaawansowane raporty', 'Do 10 użytkowników'], popular: true },
        { id: 'premium', name: 'Premium', price: '99 zł', features: ['Wszystko co w Standard', 'Integracje API', 'Nielimitowani użytkownicy'] },
    ];

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

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <Users className="w-5 h-5 text-indigo-500" />
                                        <span className="text-sm font-semibold uppercase tracking-wider">Zaproś zespół (opcjonalnie)</span>
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
                                            </div>
                                        ))}
                                        <button type="button" onClick={addInvite} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-2">
                                            <Plus className="w-4 h-4" /> Dodaj kolejny e-mail
                                        </button>
                                    </div>
                                </div>
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
                            <div className="grid gap-4">
                                {plans.map((plan) => (
                                    <div key={plan.id} className={cn(
                                        "relative group cursor-pointer p-5 rounded-2xl border-2 transition-all hover:shadow-md",
                                        plan.popular ? "border-purple-600 bg-purple-50/50 dark:bg-purple-900/10" : "border-gray-100 dark:border-gray-800 hover:border-purple-200"
                                    )} onClick={nextStep}>
                                        {plan.popular && (
                                            <span className="absolute -top-3 right-4 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Najczęściej wybierany</span>
                                        )}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">{plan.name}</h3>
                                                <ul className="mt-2 space-y-1">
                                                    {plan.features.map((f, i) => (
                                                        <li key={i} className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                            <Check className="w-4 h-4 text-green-500" /> {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-gray-900 dark:text-gray-100">{plan.price}</span>
                                                <p className="text-xs text-gray-400">miesięcznie</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="solid" onClick={nextStep} className="w-full h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 text-lg font-bold shadow-xl shadow-purple-200 dark:shadow-none">
                                Wybierz plan
                            </Button>
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
                            </div>

                            <div className="pt-4">
                                <Button variant="solid" onClick={finish} className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-xl shadow-emerald-200">
                                    Zakończ konfigurację
                                </Button>
                                <button onClick={finish} className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors">Pomiń i przejdź do panelu</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
