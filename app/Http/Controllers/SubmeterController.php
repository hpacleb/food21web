<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SubmeterController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('submeter', [
            'files' => $this->files(),
        ]);
    }

    public function upload(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
            'file' => ['required', 'file', 'max:51200'],
        ]);

        $this->ensurePasswordIsValid($request->string('password')->toString());

        /** @var UploadedFile $upload */
        $upload = $request->file('file');

        $this->disk()->putFileAs(
            $this->directory(),
            $upload,
            basename($upload->getClientOriginalName()),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('File uploaded.'),
        ]);

        return back();
    }

    public function download(Request $request): StreamedResponse|JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
            'name' => ['required', 'string'],
        ]);

        if (! $this->passwordMatches($request->string('password')->toString())) {
            return $this->invalidPassword();
        }

        $path = $this->existingFilePath($request->string('name')->toString());

        if ($path === null) {
            return $this->fileNotFound();
        }

        return $this->disk()->download($path, basename($path));
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
            'name' => ['required', 'string'],
        ]);

        if (! $this->passwordMatches($request->string('password')->toString())) {
            return $this->invalidPassword();
        }

        $path = $this->existingFilePath($request->string('name')->toString());

        if ($path === null) {
            return $this->fileNotFound();
        }

        $this->disk()->delete($path);

        return response()->json(['message' => __('File deleted.')]);
    }

    private function ensurePasswordIsValid(string $password): void
    {
        if ($this->passwordMatches($password)) {
            return;
        }

        throw ValidationException::withMessages([
            'password' => __('The password is incorrect.'),
        ]);
    }

    private function passwordMatches(string $password): bool
    {
        $expected = (string) config('submeter.password');

        return $expected !== '' && hash_equals($expected, $password);
    }

    private function invalidPassword(): JsonResponse
    {
        return response()->json([
            'message' => __('The password is incorrect.'),
        ], 403);
    }

    private function fileNotFound(): JsonResponse
    {
        return response()->json([
            'message' => __('File not found.'),
        ], 404);
    }

    private function existingFilePath(string $name): ?string
    {
        $path = $this->directory().'/'.basename($name);

        return $this->paths()->contains($path) ? $path : null;
    }

    /**
     * @return array<int, array{name: string, size: int, uploaded_at: string}>
     */
    private function files(): array
    {
        $disk = $this->disk();

        return $this->paths()
            ->map(fn (string $path): array => [
                'name' => basename($path),
                'size' => $disk->size($path),
                'uploaded_at' => now()->setTimestamp($disk->lastModified($path))->toIso8601String(),
            ])
            ->values()
            ->all();
    }

    /**
     * @return Collection<int, string>
     */
    private function paths(): Collection
    {
        $disk = $this->disk();

        return collect($disk->files($this->directory()))
            ->sortByDesc(fn (string $path): int => $disk->lastModified($path))
            ->values();
    }

    private function disk(): Filesystem
    {
        return Storage::disk(config('submeter.disk'));
    }

    private function directory(): string
    {
        return (string) config('submeter.directory');
    }
}
