import { useForm } from '@inertiajs/react';
import axios from 'axios';
import React, { useRef, useState } from 'react';
import { Button, Dialog, Input, FormItem } from '@/components/ui';
import { store } from '@/routes/password/confirm';

interface ConfirmsPasswordProps {
    title?: string;
    content?: string;
    button?: string;
    confirmUrl?: string;
    children: React.ReactElement;
    onConfirmed?: () => void;
}

export default function ConfirmsPassword({
    title = 'Confirm Password',
    content = 'For your security, please confirm your password to continue.',
    button = 'Confirm',
    confirmUrl,
    children,
    onConfirmed,
}: ConfirmsPasswordProps) {
    const [confirmingPassword, setConfirmingPassword] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const { data, setData, setError, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const confirmPassword = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearErrors();

        try {
            await axios.post(confirmUrl || store.url(), {
                password: data.password,
            });
            
            setConfirmingPassword(false);
            reset();
            onConfirmed?.();
        } catch (error: any) {
            if (error.response?.data?.errors) {
                const backendErrors = error.response.data.errors;
                Object.keys(backendErrors).forEach((key) => {
                    setError(key as any, backendErrors[key][0]);
                });
            } else {
                setError('password', 'The provided password was incorrect.');
            }
            passwordInput.current?.focus();
        }
    };

    const closeModal = () => {
        setConfirmingPassword(false);
        clearErrors();
        reset();
    };

    return (
        <>
            {React.cloneElement(children as React.ReactElement<any>, {
                onClick: (e: React.MouseEvent) => {
                    e.preventDefault();
                    const childProps = children.props as any;
                    if (typeof childProps?.onClick === 'function') {
                        childProps.onClick(e);
                    }
                    setConfirmingPassword(true);
                },
            })}

            <Dialog
                isOpen={confirmingPassword}
                onClose={closeModal}
                width={400}
            >
                <div className="p-6">
                    <h5 className="text-xl font-bold mb-2">{title}</h5>
                    <p className="text-muted-foreground mb-6 text-sm">{content}</p>

                    <form onSubmit={confirmPassword} className="space-y-4">
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
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="•••••••••"
                                autoComplete="current-password"
                                autoFocus
                            />
                        </FormItem>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button 
                                variant="default" 
                                type="button" 
                                onClick={closeModal}
                                disabled={processing}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="solid"
                                type="submit"
                                loading={processing}
                            >
                                {button}
                            </Button>
                        </div>
                    </form>
                </div>
            </Dialog>
        </>
    );
}
