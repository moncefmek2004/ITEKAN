<?php

namespace App\Constants;

final class SpecDefinitions
{
    public const DEFINITIONS = [
        'claviers' => [
            'switch_type' => ['type' => 'enum', 'values' => ['mécanique', 'membrane', 'hybride']],
            'switch_color' => ['type' => 'enum', 'values' => ['Rouge', 'Blue', 'Brown', 'Noir']],
            'layout' => ['type' => 'enum', 'values' => ['AZERTY', 'QWERTY', 'ANSI', 'ISO']],
            'backlight' => ['type' => 'boolean'],
            'backlight_type' => ['type' => 'enum', 'values' => ['RGB', 'Blanc', 'Aucun']],
            'connectivity' => ['type' => 'enum', 'values' => ['Fils', 'Bluetooth', '2.4G', 'Fils + Bluetooth']],
            'key_count' => ['type' => 'integer', 'min' => 40, 'max' => 200],
            'material' => ['type' => 'string', 'max' => 100],
            'dimensions' => ['type' => 'string'],
        ],

        'souris' => [
            'dpi' => ['type' => 'integer', 'min' => 100, 'max' => 30000],
            'sensor' => ['type' => 'enum', 'values' => ['Optique', 'Laser']],
            'weight_g' => ['type' => 'number', 'min' => 30, 'max' => 300],
            'connectivity' => ['type' => 'enum', 'values' => ['Fils', 'Bluetooth', '2.4G', 'Fils + Bluetooth']],
            'buttons' => ['type' => 'integer', 'min' => 2, 'max' => 20],
            'side_buttons' => ['type' => 'integer', 'min' => 0, 'max' => 12],
            'rgb' => ['type' => 'boolean'],
            'material' => ['type' => 'string', 'max' => 100],
            'cable_length' => ['type' => 'string'],
        ],

        'casques' => [
            'driver_size' => ['type' => 'string'],
            'frequency_response' => ['type' => 'string'],
            'impedance' => ['type' => 'string'],
            'surround' => ['type' => 'enum', 'values' => ['Stéréo', '7.1', 'Virtual 7.1']],
            'microphone' => ['type' => 'boolean'],
            'mic_type' => ['type' => 'enum', 'values' => ['Amovible', 'Intégré', 'Aucun']],
            'connectivity' => ['type' => 'enum', 'values' => ['Fils', 'Bluetooth', '2.4G', 'Fils + Bluetooth']],
            'noise_cancelling' => ['type' => 'boolean'],
            'weight_g' => ['type' => 'number', 'min' => 100, 'max' => 500],
            'battery_life' => ['type' => 'string'],
            'rgb' => ['type' => 'boolean'],
        ],

        'combos' => [
            'items' => ['type' => 'string'],
            'keyboard_type' => ['type' => 'enum', 'values' => ['Mécanique', 'Membrane']],
            'mouse_sensor' => ['type' => 'enum', 'values' => ['Optique', 'Laser']],
            'mouse_dpi' => ['type' => 'integer', 'min' => 100, 'max' => 30000],
            'connectivity' => ['type' => 'enum', 'values' => ['Fils', 'Bluetooth', '2.4G']],
            'rgb' => ['type' => 'boolean'],
            'includes_mousepad' => ['type' => 'boolean'],
        ],

        'micro-webcam' => [
            'type' => ['type' => 'enum', 'values' => ['Micro', 'Webcam', 'Kit']],
            'connection' => ['type' => 'enum', 'values' => ['USB', 'XLR', 'USB-C']],
            'pattern' => ['type' => 'enum', 'values' => ['Cardioïde', 'Bidirectionnel', 'Omni', 'Shotgun']],
            'sample_rate' => ['type' => 'string'],
            'bit_depth' => ['type' => 'string'],
            'resolution' => ['type' => 'string'],
            'fps' => ['type' => 'integer', 'min' => 15, 'max' => 120],
            'fov' => ['type' => 'string'],
            'autofocus' => ['type' => 'boolean'],
            'low_light' => ['type' => 'boolean'],
            'noise_cancelling' => ['type' => 'boolean'],
            'built_in_mic' => ['type' => 'boolean'],
            'tripod_mount' => ['type' => 'boolean'],
        ],

        'deco-gaming' => [
            'type' => ['type' => 'string'],
            'power' => ['type' => 'string'],
            'voltage' => ['type' => 'string'],
            'color' => ['type' => 'string'],
            'rgb' => ['type' => 'boolean'],
            'length' => ['type' => 'string'],
            'material' => ['type' => 'string'],
            'compatibility' => ['type' => 'string'],
        ],

        'manettes' => [
            'connectivity' => ['type' => 'enum', 'values' => ['Bluetooth', 'USB', '2.4G']],
            'compatibility' => ['type' => 'string'],
            'vibration' => ['type' => 'boolean'],
            'gyroscope' => ['type' => 'boolean'],
            'battery_life' => ['type' => 'string'],
            'analog_triggers' => ['type' => 'boolean'],
            'paddles' => ['type' => 'integer', 'min' => 0, 'max' => 4],
            'color' => ['type' => 'string'],
        ],

        'tapis-de-souris' => [
            'dimensions' => ['type' => 'string'],
            'surface' => ['type' => 'enum', 'values' => ['Tissu', 'Polycarbonate', 'Verre']],
            'base' => ['type' => 'enum', 'values' => ['Antidérapante', 'Caoutchouc']],
            'thickness' => ['type' => 'string'],
            'edge_stitching' => ['type' => 'boolean'],
            'rgb' => ['type' => 'boolean'],
            'rgb_zones' => ['type' => 'integer', 'min' => 1, 'max' => 4],
        ],

        'moniteurs' => [
            'screen_size' => ['type' => 'number', 'min' => 15, 'max' => 50],
            'resolution' => ['type' => 'enum', 'values' => ['HD', 'FHD', 'QHD', 'UHD', 'WQHD']],
            'panel' => ['type' => 'enum', 'values' => ['IPS', 'VA', 'TN', 'OLED']],
            'refresh_rate' => ['type' => 'integer', 'min' => 60, 'max' => 500],
            'response_time' => ['type' => 'string'],
            'hdr' => ['type' => 'enum', 'values' => ['HDR10', 'HDR400', 'HDR600', 'HDR1000', 'Non']],
            'ports' => ['type' => 'string'],
            'freesync' => ['type' => 'boolean'],
            'gsync' => ['type' => 'boolean'],
            'curved' => ['type' => 'boolean'],
            'height_adjustable' => ['type' => 'boolean'],
        ],

        'laptops' => [
            'cpu' => ['type' => 'string'],
            'cpu_gen' => ['type' => 'string'],
            'ram' => ['type' => 'integer', 'min' => 2, 'max' => 128],
            'ram_type' => ['type' => 'enum', 'values' => ['DDR4', 'DDR5', 'LPDDR5', 'LPDDR5X']],
            'storage' => ['type' => 'integer', 'min' => 32, 'max' => 8000],
            'storage_type' => ['type' => 'enum', 'values' => ['NVMe', 'SATA', 'HDD', 'eMMC', 'NVMe + HDD']],
            'gpu' => ['type' => 'string'],
            'gpu_vram' => ['type' => 'integer', 'min' => 0, 'max' => 24],
            'screen_size' => ['type' => 'number'],
            'resolution' => ['type' => 'enum', 'values' => ['HD', 'FHD', 'QHD', 'UHD']],
            'refresh_rate' => ['type' => 'integer', 'min' => 60, 'max' => 500],
            'battery' => ['type' => 'string'],
            'battery_wh' => ['type' => 'integer'],
            'os' => ['type' => 'string'],
            'weight_kg' => ['type' => 'number'],
            'ports' => ['type' => 'string'],
            'keyboard_backlight' => ['type' => 'boolean'],
        ],

        'desktops' => [
            'cpu' => ['type' => 'string'],
            'ram' => ['type' => 'integer', 'min' => 2, 'max' => 128],
            'ram_type' => ['type' => 'enum', 'values' => ['DDR4', 'DDR5']],
            'storage' => ['type' => 'string'],
            'gpu' => ['type' => 'string'],
            'psu' => ['type' => 'string'],
            'case_type' => ['type' => 'enum', 'values' => ['ATX', 'Micro-ATX', 'Mini-ITX']],
            'os' => ['type' => 'string'],
            'wifi' => ['type' => 'boolean'],
            'bluetooth' => ['type' => 'boolean'],
        ],

        'composants' => [
            'type' => ['type' => 'enum', 'values' => ['CPU', 'GPU', 'Carte mère', 'RAM', 'SSD', 'HDD', 'Alimentation', 'Boîtier', 'Refroidissement']],
            'socket' => ['type' => 'string'],
            'chipset' => ['type' => 'string'],
            'form_factor' => ['type' => 'string'],
            'capacity' => ['type' => 'string'],
            'speed' => ['type' => 'string'],
            'tdp' => ['type' => 'string'],
            'wattage' => ['type' => 'string'],
            'modular' => ['type' => 'enum', 'values' => ['Fully Modular', 'Semi-Modular', 'Non Modular']],
            'certification' => ['type' => 'enum', 'values' => ['80+', '80+ Bronze', '80+ Gold', '80+ Platinum', '80+ Titanium']],
            'fan_size' => ['type' => 'string'],
            'aio' => ['type' => 'boolean'],
        ],

        'reseau' => [
            'type' => ['type' => 'enum', 'values' => ['Routeur', 'Switch', 'Point d\'accès', 'Adaptateur', 'Câble']],
            'wifi_standard' => ['type' => 'enum', 'values' => ['WiFi 5', 'WiFi 6', 'WiFi 6E', 'WiFi 7', 'Aucun']],
            'ports' => ['type' => 'integer', 'min' => 1, 'max' => 48],
            'speed' => ['type' => 'string'],
            'poe' => ['type' => 'boolean'],
            'range' => ['type' => 'string'],
        ],

        'accessoires' => [
            'type' => ['type' => 'string'],
            'compatibility' => ['type' => 'string'],
            'material' => ['type' => 'string'],
            'color' => ['type' => 'string'],
        ],
    ];

    public static function getForCategory(string $categorySlug): array
    {
        return self::DEFINITIONS[$categorySlug] ?? [];
    }

    public static function getLabels(string $categorySlug): array
    {
        $specs = self::getForCategory($categorySlug);

        return array_map(fn ($spec) => $spec['type'], $specs);
    }
}
