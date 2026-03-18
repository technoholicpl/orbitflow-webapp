<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input) {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
            ]);

            $this->createWorkspace($user);

            return $user;
        });
    }

    /**
     * Create a personal workspace for the user.
     */
    protected function createWorkspace(User $user): void
    {
        $workspace = Workspace::create([
            'name' => $user->name . "'s Workspace",
            'slug' => str()->slug($user->name . "-workspace-" . uniqid()),
            'owner_id' => $user->id,
        ]);

        $user->workspaces()->attach($workspace, ['role' => 'owner']);

        $user->forceFill([
            'current_workspace_id' => $workspace->id,
        ])->save();

        // Assign Spatie Role for this workspace
        setPermissionsTeamId($workspace->id);
        $user->assignRole('Owner');
    }
}
