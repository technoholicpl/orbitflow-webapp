<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimeEntryResource extends JsonResource
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
            'project_id' => $this->project_id,
            'task_id' => $this->task_id,
            'description' => $this->description,
            'started_at' => $this->started_at,
            'ended_at' => $this->ended_at,
            'duration' => $this->duration,
            'is_manual' => $this->is_manual,
            'needs_recovery' => $this->needs_recovery ?? false,
            'project' => new ProjectResource($this->whenLoaded('project')),
            'task' => new TaskResource($this->whenLoaded('task')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
