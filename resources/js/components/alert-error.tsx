import { Alert } from '@/components/ui';

export default function AlertError({
    errors,
    title,
}: {
    errors: string[];
    title?: string;
}) {
    return (
        <Alert 
            type="danger" 
            showIcon 
            title={title || 'Something went wrong.'}
            className="mb-4"
        >
            <ul className="list-inside list-disc text-sm">
                {Array.from(new Set(errors)).map((error, index) => (
                    <li key={index}>{error}</li>
                ))}
            </ul>
        </Alert>
    );
}

