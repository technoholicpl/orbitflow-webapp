import React, { useState, useEffect, useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';
import { HiPlay, HiStop, HiChevronDown, HiPencilAlt, HiExternalLink, HiPlusCircle, HiPhotograph, HiHashtag, HiOutlineClock } from 'react-icons/hi';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import { cn } from '@/lib/utils';
import { Button, Dropdown } from '@/components/ui';
import {
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    useHover,
    useFocus,
    useDismiss,
    useRole,
    useInteractions,
    safePolygon,
    FloatingPortal,
} from '@floating-ui/react';

dayjs.extend(duration);
dayjs.extend(utc);

const GlobalTimer = () => {
    const { current_timer, workspace_projects } = usePage<any>().props;
    const [seconds, setSeconds] = useState(0);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

    // Floating UI for Info Popover
    const { refs, floatingStyles, context } = useFloating({
        open: isInfoOpen,
        onOpenChange: setIsInfoOpen,
        middleware: [offset(10), flip(), shift()],
        whileElementsMounted: autoUpdate,
    });

    const hover = useHover(context, { 
        enabled: true, 
        handleClose: safePolygon(),
        delay: { open: 200, close: 300 }
    });
    const focus = useFocus(context);
    const dismiss = useDismiss(context);
    const role = useRole(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([
        hover,
        focus,
        dismiss,
        role,
    ]);

    // Sync seconds with currently running timer
    useEffect(() => {
        let interval: any;
        if (current_timer) {
            const start = dayjs.utc(current_timer.started_at);
            const updateSeconds = () => {
                const diff = dayjs.utc().diff(start, 'second');
                setSeconds(diff > 0 ? diff : 0);
            };
            updateSeconds();
            interval = setInterval(updateSeconds, 1000);
        } else {
            setSeconds(0);
        }
        return () => clearInterval(interval);
    }, [current_timer]);

    const formatTime = (totalSeconds: number) => {
        const d = dayjs.duration(totalSeconds, 'seconds');
        const h = Math.floor(d.asHours());
        const m = d.minutes();
        const s = d.seconds();
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = (projectId: number) => {
        router.post('/time-entries', {
            project_id: projectId
        }, {
            onSuccess: () => {
                setIsPopoverOpen(false);
            }
        });
    };

    const handleStop = () => {
        if (!current_timer) return;
        router.post(`/time-entries/${current_timer.id}/stop`, {}, {
            onSuccess: () => {
                // Done
            }
        });
    };

    const totalSeconds = ((current_timer?.task?.spent_time ?? current_timer?.project?.spent_time ?? 0)) + seconds;

    const priorityIcon = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high': return <HiChevronDown className="text-red-500 rotate-180" title="High Priority" />;
            case 'medium': return <HiHashtag className="text-orange-500" title="Medium Priority" />;
            case 'low': return <HiChevronDown className="text-blue-500" title="Low Priority" />;
            default: return null;
        }
    };

    const activeProject = current_timer?.project;

    return (
        <div className="flex items-center">
            <div 
                className={cn(
                    "flex items-center gap-3 px-4 py-1.5 rounded-full transition-all duration-300 border shadow-sm",
                    current_timer 
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" 
                        : "bg-gray-800/40 border-gray-700/50 text-gray-400 hover:border-gray-600"
                )}
            >
                {/* Timer Control Section */}
                <div className="flex items-center gap-3 pr-3 border-r border-gray-700/50">
                    {current_timer ? (
                        <button 
                            onClick={handleStop}
                            className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 group"
                            title="Zatrzymaj licznik"
                        >
                            <HiStop className="text-lg group-hover:scale-110 transition-transform" />
                        </button>
                    ) : (
                        <Dropdown
                            renderTitle={
                                <button 
                                    className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 group"
                                    title="Rozpocznij nowy licznik"
                                >
                                    <HiPlay className="text-lg ml-0.5 group-hover:scale-110 transition-transform" />
                                </button>
                            }
                            placement="bottom-start"
                        >
                            <div className="w-64 p-2">
                                <div className="px-3 py-2 text-[10px] font-black uppercase text-gray-500 tracking-widest border-b border-gray-800 mb-2">
                                    Wybierz projekt
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    {workspace_projects?.length > 0 ? workspace_projects.map((p: any) => (
                                        <Dropdown.Item 
                                            key={p.id} 
                                            onClick={() => handleStart(p.id)}
                                            className="rounded-lg hover:bg-gray-800 p-2 cursor-pointer transition-colors group flex flex-col items-start gap-0.5"
                                        >
                                            <span className="text-xs font-bold text-gray-200 group-hover:text-indigo-400 transition-colors">{p.name}</span>
                                            {p.client && (
                                                <span className="text-[10px] text-gray-500 font-medium italic">{p.client.company_name}</span>
                                            )}
                                        </Dropdown.Item>
                                    )) : (
                                        <div className="p-4 text-center text-xs text-gray-500 italic">Brak projektów</div>
                                    )}
                                </div>
                            </div>
                        </Dropdown>
                    )}
                    
                    <div className="flex flex-col justify-center min-w-[70px]">
                        <span className={cn(
                            "text-base font-black tabular-nums tracking-wider leading-none",
                            current_timer ? "text-emerald-400 animate-pulse-subtle" : "text-gray-400"
                        )}>
                            {formatTime(seconds)}
                        </span>
                    </div>
                </div>

                {/* Info & Popover Trigger Section */}
                {current_timer && (
                    <div 
                        ref={refs.setReference}
                        {...getReferenceProps()}
                        className="flex items-center gap-3 cursor-pointer group select-none"
                        onClick={() => setIsInfoOpen(!isInfoOpen)}
                    >
                        <div className="flex flex-col max-w-[180px] overflow-hidden leading-tight">
                            <span className="text-[10px] font-black uppercase text-gray-500 truncate tracking-tight group-hover:text-gray-400 transition-colors">
                                {current_timer.project?.client?.company_name || 'Brak klienta'}
                            </span>
                            <span className="text-sm font-bold text-emerald-400 truncate group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                                {current_timer.task?.name || current_timer.project?.name}
                                <HiChevronDown className={cn("text-gray-600 transition-transform duration-300", isInfoOpen && "rotate-180")} />
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Detailed Info Popover */}
            {isInfoOpen && current_timer && (
                <FloatingPortal>
                    <div
                        ref={refs.setFloating}
                        style={floatingStyles}
                        {...getFloatingProps()}
                        className="z-9999 bg-[#0d1117] border border-gray-800 rounded-2xl shadow-2xl p-5 w-80 animate-in fade-in zoom-in duration-200"
                    >
                        <div className="space-y-4">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1 overflow-hidden">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                            Aktywny
                                        </span>
                                        {priorityIcon(current_timer.task?.priority || current_timer.project?.priority)}
                                    </div>
                                    <h4 className="text-white font-black text-base tracking-tight leading-tight">
                                        {current_timer.task?.name || current_timer.project?.name}
                                    </h4>
                                    <div className="flex flex-col text-[11px] text-gray-400 font-medium space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-gray-600 text-[10px] uppercase font-bold tracking-tighter">Klient:</span>
                                            <span className="truncate">{current_timer.project?.client?.company_name}</span>
                                        </div>
                                        {current_timer.project?.brand && (
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-gray-600 text-[10px] uppercase font-bold tracking-tighter">Marka:</span>
                                                <span className="truncate text-gray-500 opacity-80">{current_timer.project.brand.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-900/60 rounded-xl p-4 flex flex-col border border-gray-800/50 shadow-inner relative overflow-hidden group/card">
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/card:opacity-20 transition-opacity">
                                    <HiOutlineClock className="text-4xl text-emerald-400" />
                                </div>
                                <span className="text-[10px] uppercase font-black text-gray-600 tracking-widest mb-1 relative z-10">Łączny czas poświęcony</span>
                                <span className="text-2xl font-black text-emerald-400 font-mono tracking-tighter relative z-10">
                                    {formatTime(totalSeconds)}
                                </span>
                            </div>

                            <div className="pt-4 flex items-center justify-between border-t border-gray-800/80">
                                <div className="flex gap-2">
                                    <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800/50 text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-400 border border-gray-700/50 transition-all active:scale-90 hover:scale-105" title="Dodaj notatkę">
                                        <HiPlusCircle className="text-xl" />
                                    </button>
                                    <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800/50 text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-400 border border-gray-700/50 transition-all active:scale-90 hover:scale-105" title="Dodaj zdjęcie">
                                        <HiPhotograph className="text-xl" />
                                    </button>
                                    <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800/50 text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-400 border border-gray-700/50 transition-all active:scale-90 hover:scale-105" title="Edytuj">
                                        <HiPencilAlt className="text-xl" />
                                    </button>
                                </div>
                                <button 
                                    onClick={() => router.get(`/projects/${current_timer.project_id}`)}
                                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 transition-all active:scale-90 hover:scale-105" 
                                    title="Pokaż pełny opis projektu"
                                >
                                    <HiExternalLink className="text-xl" />
                                </button>
                            </div>
                        </div>
                    </div>
                </FloatingPortal>
            )}
        </div>
    );
};

export default GlobalTimer;
