<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreInquiryRequest;
use App\Models\Inquiry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InquiryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('inquiries/index', [
            'inquiries' => Inquiry::latest()->get(),
            'statuses' => Inquiry::STATUSES,
        ]);
    }

    public function store(StoreInquiryRequest $request): RedirectResponse
    {
        Inquiry::create($request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Thanks! Your request is in and we will get back to you shortly.'),
        ]);

        return back();
    }

    public function status(Request $request, Inquiry $inquiry): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(Inquiry::STATUSES)],
        ]);

        $inquiry->update($validated);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Inquiry status updated.'),
        ]);

        return back();
    }

    public function destroy(Inquiry $inquiry): RedirectResponse
    {
        $inquiry->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Inquiry deleted.'),
        ]);

        return back();
    }
}
