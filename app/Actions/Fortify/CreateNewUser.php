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
                'email_verification_code' => str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT),
                'email_verification_expires_at' => now()->addHour(),
            ]);

            // Workspace creation is now handled by the onboarding wizard after email verification.
            // $this->createWorkspace($user);

            // Send verification email
            $user->notify(new \App\Notifications\EmailVerificationNotification($user->email_verification_code));

            return $user;
        });
    }
}
