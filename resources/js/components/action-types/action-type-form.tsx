import React from 'react';
import { Button, Input } from '@/components/ui';
import { IconPicker } from './icon-picker';

interface ActionTypeFormProps {
    data: {
        name: string;
        description: string;
        color: string;
        icon: string;
    };
    setData: (field: string, value: any) => void;
    errors: Record<string, string>;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    submitLabel: string;
}

export const ActionTypeForm = ({
    data,
    setData,
    errors,
    processing,
    onSubmit,
    onCancel,
    submitLabel,
}: ActionTypeFormProps) => {
    const colorPresets = [
        '#6366f1', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#71717a'
    ];

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                    placeholder="e.g. Graphic Design"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    invalid={!!errors.name}
                    autoFocus
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                    placeholder="Optional description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    invalid={!!errors.description}
                />
                {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Icon</label>
                <IconPicker 
                    value={data.icon} 
                    onChange={(val) => setData('icon', val)} 
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {colorPresets.map((color) => (
                        <button
                            key={color}
                            type="button"
                            className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${data.color === color ? 'border-primary' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setData('color', color)}
                        />
                    ))}
                </div>
                <div className="flex items-center space-x-2">
                    <Input
                        type="color"
                        className="h-10 w-12 p-1"
                        value={data.color}
                        onChange={(e) => setData('color', e.target.value)}
                    />
                    <Input
                        placeholder="#000000"
                        value={data.color}
                        onChange={(e) => setData('color', e.target.value)}
                        className="flex-1 font-mono uppercase"
                    />
                </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
                <Button variant="default" type="button" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="solid" type="submit" loading={processing}>
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
};
