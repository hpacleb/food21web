<?php

use App\Models\Inquiry;
use App\Models\User;

test('a guest can submit a quote request', function () {
    $this->post(route('inquiries.store'), [
        'name' => 'Maria Santos',
        'email' => 'maria@example.com',
        'phone' => '0917 000 0000',
        'event_type' => 'Birthday or anniversary',
        'event_date' => now()->addWeeks(2)->toDateString(),
        'guests' => 50,
        'message' => 'Please include lechon belly.',
    ])->assertRedirect();

    $this->assertDatabaseHas('inquiries', [
        'name' => 'Maria Santos',
        'email' => 'maria@example.com',
        'event_type' => 'Birthday or anniversary',
        'guests' => 50,
        'status' => 'new',
    ]);
});

test('a quote request requires name, email, and event type', function () {
    $this->post(route('inquiries.store'), [])
        ->assertSessionHasErrors(['name', 'email', 'event_type']);
});

test('a quote request rejects a past event date', function () {
    $this->post(route('inquiries.store'), [
        'name' => 'Maria Santos',
        'email' => 'maria@example.com',
        'event_type' => 'Private party',
        'event_date' => now()->subDay()->toDateString(),
    ])->assertSessionHasErrors('event_date');
});

test('guests cannot view inquiries', function () {
    $this->get(route('inquiries.index'))->assertRedirect(route('login'));
});

test('authenticated users can view inquiries', function () {
    Inquiry::factory()->create();

    $this->actingAs(User::factory()->create())
        ->get(route('inquiries.index'))
        ->assertOk();
});

test('authenticated users can update the status of an inquiry', function () {
    $inquiry = Inquiry::factory()->create();

    $this->actingAs(User::factory()->create())
        ->patch(route('inquiries.status', $inquiry), ['status' => 'contacted'])
        ->assertRedirect();

    expect($inquiry->refresh()->status)->toBe('contacted');
});

test('authenticated users can delete an inquiry', function () {
    $inquiry = Inquiry::factory()->create();

    $this->actingAs(User::factory()->create())
        ->delete(route('inquiries.destroy', $inquiry))
        ->assertRedirect();

    $this->assertDatabaseMissing('inquiries', ['id' => $inquiry->id]);
});
