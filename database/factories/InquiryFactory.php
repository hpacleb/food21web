<?php

namespace Database\Factories;

use App\Models\Inquiry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Inquiry>
 */
class InquiryFactory extends Factory
{
    protected $model = Inquiry::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->numerify('09## ### ####'),
            'event_type' => fake()->randomElement(config('site.event_types')),
            'event_date' => fake()->dateTimeBetween('+1 week', '+3 months'),
            'guests' => fake()->numberBetween(10, 200),
            'message' => fake()->sentence(),
            'status' => 'new',
        ];
    }
}
