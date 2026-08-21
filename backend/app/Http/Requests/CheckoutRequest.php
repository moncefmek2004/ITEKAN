<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'address_id' => ['nullable', 'integer', 'exists:addresses,id'],
            'full_name' => ['required_without:address_id', 'string', 'max:255'],
            'phone' => ['required_without:address_id', 'string', 'max:20'],
            'line1' => ['required_without:address_id', 'string', 'max:255'],
            'line2' => ['nullable', 'string', 'max:255'],
            'wilaya_code' => ['required_without:address_id', 'string', 'size:2', 'exists:wilayas,code'],
            'city' => ['required_without:address_id', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:10'],
            'payment_method' => ['required', 'string', 'in:cod'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'address_id.exists' => 'Adresse invalide.',
            'full_name.required_without' => 'Le nom complet est requis.',
            'phone.required_without' => 'Le numéro de téléphone est requis.',
            'line1.required_without' => 'L\'adresse est requise.',
            'wilaya_code.required_without' => 'La wilaya est requise.',
            'wilaya_code.size' => 'Le code wilaya doit contenir 2 caractères.',
            'wilaya_code.exists' => 'Wilaya invalide.',
            'city.required_without' => 'La ville est requise.',
            'payment_method.required' => 'La méthode de paiement est requise.',
            'payment_method.in' => 'Seul le paiement à la livraison est accepté.',
        ];
    }
}
