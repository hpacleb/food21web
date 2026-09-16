<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'event_type' => ['required', 'string', 'max:100'],
            'event_date' => ['nullable', 'date', 'after_or_equal:today'],
            'guests' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'message' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
