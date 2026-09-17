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
            ->has('files', 0)
        );
});

test('the page lists every uploaded file', function () {
    Storage::disk('local')->put('submeter/menu.pdf', 'file contents');
    Storage::disk('local')->put('submeter/prices.xlsx', 'more contents');

    $this->get(route('submeter'))
        ->assertInertia(fn ($page) => $page
            ->has('files', 2)
            ->where('files', fn ($files) => $files
                ->pluck('name')
                ->sort()
                ->values()
                ->all() === ['menu.pdf', 'prices.xlsx']
            )
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
            ->where('files.0.name', 'menu.pdf')
            ->where('files.0.size', strlen('file contents'))
        );
});

test('uploading keeps the previously uploaded files', function () {
    Storage::disk('local')->put('submeter/old.pdf', 'old contents');

    $this->post(route('submeter.upload'), [
        'password' => 'top-secret',
        'file' => UploadedFile::fake()->create('new.pdf', 100),
    ])->assertRedirect();

    Storage::disk('local')->assertExists('submeter/old.pdf');
    Storage::disk('local')->assertExists('submeter/new.pdf');
});

test('uploading a file with the same name replaces it', function () {
    Storage::disk('local')->put('submeter/menu.pdf', 'old contents');

    $this->post(route('submeter.upload'), [
        'password' => 'top-secret',
        'file' => UploadedFile::fake()->createWithContent('menu.pdf', 'new contents'),
    ])->assertRedirect();

    expect(Storage::disk('local')->get('submeter/menu.pdf'))->toBe('new contents');
});

test('a file cannot be uploaded with the wrong password', function () {
    $this->post(route('submeter.upload'), [
        'password' => 'wrong-password',
        'file' => UploadedFile::fake()->create('new.pdf', 100),
    ])->assertSessionHasErrors('password');

    Storage::disk('local')->assertMissing('submeter/new.pdf');
});

test('no password is accepted when the configured password is empty', function () {
    config(['submeter.password' => '']);

    $this->post(route('submeter.upload'), [
        'password' => '',
        'file' => UploadedFile::fake()->create('new.pdf', 100),
    ])->assertSessionHasErrors('password');

    Storage::disk('local')->assertMissing('submeter/new.pdf');
});

test('a file can be downloaded with the correct password', function () {
    Storage::disk('local')->put('submeter/menu.pdf', 'file contents');

    $response = $this->post(route('submeter.download'), [
        'password' => 'top-secret',
        'name' => 'menu.pdf',
    ]);

    $response->assertOk();
    expect($response->streamedContent())->toBe('file contents');
    expect($response->headers->get('content-disposition'))
        ->toContain('menu.pdf');
});

test('a file cannot be downloaded with the wrong password', function () {
    Storage::disk('local')->put('submeter/menu.pdf', 'file contents');

    $this->post(route('submeter.download'), [
        'password' => 'wrong-password',
        'name' => 'menu.pdf',
    ])->assertForbidden();
});

test('downloading an unknown file returns not found', function () {
    $this->post(route('submeter.download'), [
        'password' => 'top-secret',
        'name' => 'missing.pdf',
    ])->assertNotFound();
});

test('downloading cannot escape the submeter directory', function () {
    Storage::disk('local')->put('.env', 'secret');

    $this->post(route('submeter.download'), [
        'password' => 'top-secret',
        'name' => '../.env',
    ])->assertNotFound();

    Storage::disk('local')->assertExists('.env');
});

test('a file can be deleted with the correct password', function () {
    Storage::disk('local')->put('submeter/menu.pdf', 'file contents');

    $this->delete(route('submeter.destroy'), [
        'password' => 'top-secret',
        'name' => 'menu.pdf',
    ])->assertOk();

    Storage::disk('local')->assertMissing('submeter/menu.pdf');
});

test('a file cannot be deleted with the wrong password', function () {
    Storage::disk('local')->put('submeter/menu.pdf', 'file contents');

    $this->delete(route('submeter.destroy'), [
        'password' => 'wrong-password',
        'name' => 'menu.pdf',
    ])->assertForbidden();

    Storage::disk('local')->assertExists('submeter/menu.pdf');
});

test('deleting an unknown file returns not found', function () {
    $this->delete(route('submeter.destroy'), [
        'password' => 'top-secret',
        'name' => 'missing.pdf',
    ])->assertNotFound();
});
