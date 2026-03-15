import { Form, Head } from '@inertiajs/react';
import { Button, Input, FormItem } from '@/components/ui';
import AuthLayout from '@/layouts/auth-layout';

type Props = {
    status?: string;
};

export default function Login({ status }: Props) {
    return (
        <AuthLayout
            title="Admin access"
            description="Enter your administrator credentials"
        >
            <Head title="Admin Log in" />

            <Form
                action="/admin/login"
                method="post"
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <div className="grid gap-4">
                        <FormItem 
                            label="Email" 
                            invalid={!!errors.email}
                            errorMessage={errors.email}
                        >
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="admin@example.com"
                                autoFocus
                            />
                        </FormItem>

                        <FormItem 
                            label="Password" 
                            invalid={!!errors.password}
                            errorMessage={errors.password}
                        >
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                placeholder="Password"
                            />
                        </FormItem>

                        <Button 
                            variant="solid" 
                            type="submit" 
                            className="mt-2 w-full" 
                            loading={processing}
                        >
                            Acccess Admin Panel
                        </Button>
                    </div>
                )}
            </Form>

            {status && (
                <div className="mt-4 text-center text-sm font-medium text-emerald-600">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}



