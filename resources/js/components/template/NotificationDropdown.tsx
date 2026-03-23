import { usePage, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Bell, Mail, Check, X, Info } from 'lucide-react';
import { Dropdown, Badge, Button, Notification, toast } from '@/components/ui';
import cn from '@/components/ui/utils/classNames';

dayjs.extend(relativeTime);

type NotificationData = {
    id: string;
    type: string;
    data: {
        type: string;
        invitation_id?: number;
        workspace_title?: string;
        inviter_name?: string;
        token?: string;
        message: string;
        invitee_name?: string;
        workspace_name?: string;
    };
    read_at: string | null;
    created_at: string;
};

export default function NotificationDropdown() {
    const { notifications } = usePage<{ notifications: NotificationData[] }>().props;
    const unreadCount = notifications.length;

    const handleAccept = (token: string) => {
        router.get(`/invitations/accept/${token}`, {}, {
            onSuccess: () => {
                toast.push(
                    <Notification title="Sukces" type="success">
                        Zaakceptowano zaproszenie!
                    </Notification>
                );
            }
        });
    };

    const handleReject = (token: string) => {
        router.post(`/invitations/reject/${token}`, {}, {
            onSuccess: () => {
                toast.push(
                    <Notification title="Informacja" type="info">
                        Odrzucono zaproszenie.
                    </Notification>
                );
            }
        });
    };

    return (
        <Dropdown
            renderTitle={
                <div className="relative cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group">
                    <Bell className="w-5 h-5 text-gray-500 group-hover:text-indigo-600 transition-colors" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center p-0 text-[10px] bg-indigo-600 border-2 border-white dark:border-gray-900"
                            content={unreadCount}
                        />
                    )}
                </div>
            }
            placement="bottom-end"
        >
            <div className="w-80 sm:w-96 overflow-hidden bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <h5 className="font-bold text-gray-900 dark:text-gray-100">Powiadomienia</h5>
                    {unreadCount > 0 && (
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                            Masz {unreadCount} nowych
                        </span>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 text-gray-400">
                                <Bell className="w-6 h-6 opacity-30" />
                            </div>
                            <p className="text-sm text-gray-500">Brak nowych powiadomień</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="p-4 border-b last:border-0 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                            >
                                <div className="flex gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                                        notification.data.type === 'workspace_invitation' 
                                            ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" 
                                            : notification.data.type === 'invitation_accepted'
                                                ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                                                : "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                                    )}>
                                        {notification.data.type === 'workspace_invitation' ? (
                                            <Mail className="w-5 h-5" />
                                        ) : notification.data.type === 'invitation_accepted' ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <Info className="w-5 h-5" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs text-gray-400">
                                                {dayjs(notification.created_at).fromNow()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed mb-1">
                                            {notification.data.message}
                                        </p>
                                        
                                        {notification.data.type === 'workspace_invitation' && (
                                            <div className="flex gap-2 mt-2">
                                                <Button
                                                    size="xs"
                                                    variant="solid"
                                                    onClick={() => handleAccept(notification.data.token)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 h-8 px-4 rounded-lg text-xs font-bold"
                                                >
                                                    <Check className="w-3 h-3 mr-1.5" /> Akceptuj
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    variant="default"
                                                    onClick={() => handleReject(notification.data.token)}
                                                    className="h-8 px-4 rounded-lg text-xs font-bold"
                                                >
                                                    <X className="w-3 h-3 mr-1.5" /> Odrzuć
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-3 border-t dark:border-gray-800 text-center">
                    <button className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors">
                        Zobacz wszystkie
                    </button>
                </div>
            </div>
        </Dropdown>
    );
}
