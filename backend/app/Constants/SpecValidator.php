<?php

namespace App\Constants;

use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class SpecValidator
{
    private array $definition;

    public function __construct(array $definition)
    {
        $this->definition = $definition;
    }

    public function validate(array $specs): void
    {
        $rules = [];

        foreach ($this->definition as $key => $config) {
            $rules[$key] = $this->buildRules($config);
        }

        $validator = Validator::make($specs, $rules);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }
    }

    private function buildRules(array $config): array
    {
        $rules = ['nullable'];

        switch ($config['type']) {
            case 'string':
                $rules[] = 'string';
                $rules[] = 'max:'.($config['max'] ?? 255);
                break;

            case 'integer':
                $rules[] = 'integer';
                if (isset($config['min'])) {
                    $rules[] = 'min:'.$config['min'];
                }
                if (isset($config['max'])) {
                    $rules[] = 'max:'.$config['max'];
                }
                break;

            case 'number':
                $rules[] = 'numeric';
                if (isset($config['min'])) {
                    $rules[] = 'min:'.$config['min'];
                }
                if (isset($config['max'])) {
                    $rules[] = 'max:'.$config['max'];
                }
                break;

            case 'boolean':
                $rules[] = 'boolean';
                break;

            case 'enum':
                $rules[] = 'string';
                $rules[] = 'in:'.implode(',', $config['values']);
                break;
        }

        return $rules;
    }
}
