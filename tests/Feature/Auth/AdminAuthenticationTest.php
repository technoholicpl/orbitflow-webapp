<?php

use App\Models\Admin;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Route;

test('admin login screen can be rendered at default prefix', function () {
    $response = $this->get(route('admin.login'));

    $response->assertOk();
});

test('admins can authenticate using the login screen', function () {
    $admin = Admin::factory()->create();

    $response = $this->post(route('admin.login.store'), [
        'email' => $admin->email,
        'password' => 'password',
    ]);

    if ($response->isRedirect()) {
        $target = $response->headers->get('Location');
        fwrite(STDERR, "\nRedirected to: " . $target . "\n");
        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('admin.dashboard'));
    } else {
        $response->dump();
    }

    $this->assertAuthenticated('admins');
    $response->assertRedirect(route('admin.dashboard'));
});

test('admins are redirected to admin login when unauthenticated', function () {
    $response = $this->get(route('admin.dashboard'));

    $response->assertRedirect(route('admin.login'));
});
