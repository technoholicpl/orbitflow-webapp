import { Head } from '@inertiajs/react'
import { Clock, CheckCircle2, ListTodo, Plus, Calendar as CalendarIcon } from 'lucide-react'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import { Card, Button } from '@/components/ui';
import { AnimatedShinyButton } from "@/components/ui/animated-shiny-button"
import DashboardLayout from '@/layouts/DashboardLayout';
export default function Dashboard() {
    return (
        <DashboardLayout>
            <Head title="User Dashboard" />
            <div className="flex flex-col gap-8">
                <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
                        <p className="text-muted-foreground">Here's what's happening in your workspace today.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="default" size="sm" icon={<CalendarIcon className="size-4" />}>
                            Schedule
                        </Button>
                        <Button variant="solid" size="sm" icon={<Plus className="size-4" />}>
                            New Task
                        </Button>
                        <AnimatedShinyButton>Get Started</AnimatedShinyButton>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AdaptiveCard>
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-muted-foreground">Active Projects</span>
                                <h3 className="text-3xl font-bold">5</h3>
                            </div>
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <CheckCircle2 className="size-5 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
                            <span>2 projects ahead of schedule</span>
                        </div>
                    </AdaptiveCard>

                    <AdaptiveCard>
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-muted-foreground">Tracked Today</span>
                                <h3 className="text-3xl font-bold">4h 32m</h3>
                            </div>
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <Clock className="size-5 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-muted-foreground">
                            <span>82% of daily Goal reached</span>
                        </div>
                    </AdaptiveCard>

                    <AdaptiveCard>
                        <div className="flex items-start justify-between">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm font-medium text-muted-foreground">New Tasks</span>
                                <h3 className="text-3xl font-bold">12</h3>
                            </div>
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <ListTodo className="size-5 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-xs text-muted-foreground">
                            <span>4 tasks due by EOD</span>
                        </div>
                    </AdaptiveCard>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <Card header={{ content: 'Recent Activities' }}>
                        <div className="h-64 flex flex-col items-center justify-center border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                            <span className="text-muted-foreground italic font-medium tracking-wide opacity-50 uppercase text-xs">Activity Feed Coming Soon</span>
                        </div>
                    </Card>
                    <Card header={{ content: 'Upcoming Deadlines' }}>
                        <div className="h-64 flex flex-col items-center justify-center border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                            <span className="text-muted-foreground italic font-medium tracking-wide opacity-50 uppercase text-xs">Deadline Tracker Coming Soon</span>
                        </div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}

