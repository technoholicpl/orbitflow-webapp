<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PlanRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Middleware handles authorization
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_recommended' => 'boolean',
            'is_free' => 'boolean',
            'is_active' => 'boolean',
            'is_coming_soon' => 'boolean',
            'is_promoted' => 'boolean',
            'display_order' => 'integer',
            'trial_days' => 'nullable|integer|min:0',
            'prices' => 'required|array',
            'prices.*.id' => 'nullable|exists:plan_prices,id',
            'prices.*.type' => 'required|string|in:month,year',
            'prices.*.price' => 'required|numeric|min:0',
            'prices.*.sale_price' => 'nullable|numeric|min:0|lt:prices.*.price',
            'prices.*.sale_start_at' => 'nullable|date',
            'prices.*.sale_ends_at' => 'nullable|date|after_or_equal:prices.*.sale_start_at',
            'prices.*.lowest_price_30d' => 'nullable|numeric|min:0',
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'prices.*.sale_price.lt' => 'The sale price must be lower than the regular price.',
            'prices.*.sale_ends_at.after_or_equal' => 'The sale end date must be after or equal to the start date.',
        ];
    }
}
