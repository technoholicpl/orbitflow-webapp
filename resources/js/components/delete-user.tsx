import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import { useState } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Dashboard/Account/ProfileController';
import Heading from '@/components/heading';
import { Button, Dialog, Input, FormItem } from '@/components/ui';

export default function DeleteUser() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Delete account"
                description="Delete your account and all of its resources"
            />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Warning</p>
                    <p className="text-sm">
                        Please proceed with caution, this cannot be undone.
                    </p>
                </div>

                <Button
                    className="bg-red-600 hover:bg-red-700 text-white border-transparent"
                    onClick={() => setIsDialogOpen(true)}
                    data-test="delete-user-button"
                >
                    Delete account
                </Button>

                <Dialog
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    width={480}
                >
                    <h5 className="text-xl font-bold mb-4">Are you sure you want to delete your account?</h5>
                    <p className="text-muted-foreground mb-6">
                        Once your account is deleted, all of its resources
                        and data will also be permanently deleted. Please
                        enter your password to confirm you would like to
                        permanently delete your account.
                    </p>

                    <Form
                        {...ProfileController.destroy.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        onError={() => passwordInput.current?.focus()}
                        onSuccess={() => setIsDialogOpen(false)}
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
                                    />
                                </FormItem>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="default"
                                        type="button"
                                        onClick={() => {
                                            resetAndClearErrors();
                                            setIsDialogOpen(false);
                                        }}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        className="bg-red-600 hover:bg-red-700 text-white border-transparent"
                                        variant="solid"
                                        type="submit"
                                        loading={processing}
                                        data-test="confirm-delete-user-button"
                                    >
                                        Delete account
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

