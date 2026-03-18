<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\SoftDeletes;

use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class Admin extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes, HasUlids, TwoFactorAuthenticatable, HasRoles;

    public function uniqueIds(): array
    {
        return ['ulid'];
    }

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone_number',
        'is_superadmin',
        'type',
        'state',
        'avatar_url',
        'custom_fields',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'online_at' => 'datetime',
            'password' => 'hashed',
            'is_superadmin' => 'boolean',
            'custom_fields' => 'json',
        ];
    }
}
