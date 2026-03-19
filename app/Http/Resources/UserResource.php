<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar_url' => $this->avatar_url,
            'current_workspace_id' => $this->current_workspace_id,
            'timer_hard_timeout' => $this->timer_hard_timeout,
            'timer_remind_every' => $this->timer_remind_every,
            'work_day_starts_at' => $this->work_day_starts_at,
            'work_day_ends_at' => $this->work_day_ends_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
