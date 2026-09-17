<?php

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
    config(['submeter.password' => 'top-secret']);
});

test('a guest can view the submeter page', function () {
    $this->get(route('submeter'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('submeter')
            ->where('file', null)
        );
});

test('a file can be uploaded with the correct password', function () {
    $this->post(route('submeter.upload'), [
        'password' => 'top-secret',
        'file' => UploadedFile::fake()->createWithContent('menu.pdf', 'file contents'),
    ])->assertRedirect();

    Storage::disk('local')->assertExists('submeter/menu.pdf');

    $this->get(route('submeter'))
        ->assertInertia(fn ($page) => $page
            ->where('file.name', 'menu.pdf')
            ->where('file.size', strlen('file contents'))
        );
});

test('uploading a new file replaces the previous one', function () {
    Storage::disk('local')->put('submeter/old.pdf', 'old contents');
    Storage::disk('local')->put('submeter/older.pdf', 'older contents');

    $this->post(route('submeter.upload'), [
        'password' => 'top-secret',
        'file' => UploadedFile::fake()->create('new.pdf', 100),
    ])->assertRedirect();

    Storage::disk('local')->assertMissing('submeter/old.pdf');
    Storage::disk('local')->assertMissing('submeter/older.pdf');
    Storage::disk('local')->assertExists('submeter/new.pdf');
});

test('a file cannot be uploaded with the wrong password', function () {
    Storage::disk('local')->put('submeter/old.pdf', 'old contents');

    $this->post(route('submeter.upload'), [
        'password' => 'wrong-password',
        'file' => UploadedFile::fake()->create('new.pdf', 100),
    ])->assertSessionHasErrors('password');

    Storage::disk('local')->assertMissing('submeter/new.pdf');
    Storage::disk('local')->assertExists('submeter/old.pdf');
});

test('no password is accepted when the configured password is empty', function () {
    config(['submeter.password' => '']);

    $this->post(route('submeter.upload'), [
        'password' => '',
        'file' => UploadedFile::fake()->create('new.pdf', 100),
    ])->assertSessionHasErrors('password');

    Storage::disk('local')->assertMissing('submeter/new.pdf');
});

test('the current file can be downloaded with the correct password', function () {
    Storage::disk('local')->put('submeter/menu.pdf', 'file contents');

    $response = $this->post(route('submeter.download'), [
        'password' => 'top-secret',
    ]);

    $response->assertOk();
    expect($response->streamedContent())->toBe('file contents');
    expect($response->headers->get('content-disposition'))
        ->toContain('menu.pdf');
});

test('the current file cannot be downloaded with the wrong password', function () {
    Storage::disk('local')->put('submeter/menu.pdf', 'file contents');

    $this->post(route('submeter.download'), [
        'password' => 'wrong-password',
    ])->assertForbidden();
});

test('downloading without an uploaded file returns not found', function () {
    $this->post(route('submeter.download'), [
        'password' => 'top-secret',
    ])->assertNotFound();
});
