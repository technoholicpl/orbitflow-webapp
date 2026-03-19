<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;
    protected $casts = [
        'name' => 'string',
        'enabled' => 'boolean',
    ];


    protected $table= 'tags';

    protected $fillable = [
        'name',
        'slug',
        'enabled',
        'order_column',
    ];
    public function taggables()
    {
        return $this->morphTo();
    }
}
