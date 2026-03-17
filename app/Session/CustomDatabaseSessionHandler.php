<?php

namespace App\Session;

use Illuminate\Contracts\Auth\Guard;
use Illuminate\Session\DatabaseSessionHandler;

class CustomDatabaseSessionHandler extends DatabaseSessionHandler
{
    /**
     * Add the user information to the session payload.
     *
     * @param  array  $payload
     * @return $this
     */
    protected function addUserInformation(&$payload)
    {
        if ($this->container->bound(Guard::class)) {
            $payload['user_id'] = $this->userId();
            $payload['user_type'] = $this->userType();
        }

        return $this;
    }

    /**
     * Get the currently authenticated user's type (model class).
     *
     * @return string|null
     */
    protected function userType()
    {
        $user = $this->container->make(Guard::class)->user();

        return $user ? get_class($user) : null;
    }
}
