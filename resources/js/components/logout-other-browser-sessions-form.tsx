import { Form, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Button, Dialog, Input, FormItem } from '@/components/ui';
import { Monitor, Smartphone, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';

interface Session {
    id: string;
    agent: {
        is_desktop: boolean;
        platform: string;
        browser: string;
    };
    ip_address: string;
    is_current_device: boolean;
    last_active: string;
}

interface Props {
    sessions: Session[];
    action: string;
}

export default function LogoutOtherBrowserSessionsForm({ sessions, action }: Props) {
    const [confirmingLogout, setConfirmingLogout] = useState(false);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const passwordInput = useRef<HTMLInputElement>(null);

    const confirmLogout = (session: Session | null = null) => {
        setSelectedSession(session);
        setConfirmingLogout(true);
    };

    const closeDialog = () => {
        setConfirmingLogout(false);
        setTimeout(() => setSelectedSession(null), 200);
    };

    const logoutAction = selectedSession 
        ? action.replace('other-browser-sessions', `browser-session/${selectedSession.id}`)
        : action;

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Browser Sessions"
                description="Manage and log out your active sessions on other browsers and devices."
            />

            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    If necessary, you may log out of all of your other browser sessions across all of your devices. Some of your recent sessions are listed below; however, this list may not be exhaustive. If you feel your account has been compromised, you should also update your password.
                </p>

                {sessions.length > 0 && (
                    <div className="mt-5 space-y-6">
                        {sessions.map((session, i) => (
                            <div className="flex items-center justify-between" key={i}>
                                <div className="flex items-center">
                                    <div>
                                        {session.agent.is_desktop ? (
                                            <Monitor className="h-8 w-8 text-muted-foreground" />
                                        ) : (
                                            <Smartphone className="h-8 w-8 text-muted-foreground" />
                                        )}
                                    </div>

                                    <div className="ml-3">
                                        <div className="text-sm font-medium">
                                            {session.agent.platform ? session.agent.platform : 'Unknown'} - {session.agent.browser ? session.agent.browser : 'Unknown'}
                                        </div>

                                        <div>
                                            <div className="text-xs text-muted-foreground">
                                                {session.ip_address},

                                                {session.is_current_device ? (
                                                    <span className="ml-1 font-semibold text-emerald-600">
                                                        This device
                                                    </span>
                                                ) : (
                                                    <span className="ml-1">
                                                        Last active {session.last_active}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {!session.is_current_device && (
                                    <button
                                        onClick={() => confirmLogout(session)}
                                        className="text-muted-foreground hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                        title="Log out of this session"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center mt-5">
                    <Button onClick={() => confirmLogout(null)} variant="solid">
                        Log Out Other Browser Sessions
                    </Button>
                </div>

                <Dialog
                    isOpen={confirmingLogout}
                    onClose={closeDialog}
                    width={480}
                >
                    <h5 className="text-xl font-bold mb-4">
                        {selectedSession ? 'Log Out Browser Session' : 'Log Out Other Browser Sessions'}
                    </h5>
                    <p className="text-muted-foreground mb-6">
                        {selectedSession 
                            ? `Please enter your password to confirm you would like to log out of the session on ${selectedSession.agent.platform} (${selectedSession.agent.browser}).`
                            : 'Please enter your password to confirm you would like to log out of your other browser sessions across all of your devices.'
                        }
                    </p>

                    <Form
                        action={logoutAction}
                        method="delete"
                        options={{
                            preserveScroll: true,
                        }}
                        onError={() => passwordInput.current?.focus()}
                        onSuccess={closeDialog}
                        resetOnSuccess
                        className="space-y-6"
                    >
                        {({ resetAndClearErrors, processing, errors }) => (
                            <>
                                <FormItem
                                    label="Password"
                                    invalid={!!errors.password}
                                    errorMessage={errors.password}
                                >
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        ref={passwordInput}
                                        placeholder="Password"
                                        autoComplete="current-password"
                                        autoFocus
                                    />
                                </FormItem>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="default"
                                        type="button"
                                        onClick={() => {
                                            resetAndClearErrors();
                                            closeDialog();
                                        }}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        variant="solid"
                                        type="submit"
                                        loading={processing}
                                    >
                                        {selectedSession ? 'Log Out Session' : 'Log Out Other Sessions'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </Dialog>
            </div>
        </div>
    );
}
