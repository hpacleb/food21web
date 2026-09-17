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
            'file' => $this->currentFileInfo(),
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

        $disk = $this->disk();
        $disk->delete($disk->files($this->directory()));

        $disk->putFileAs(
            $this->directory(),
            $upload,
            basename($upload->getClientOriginalName()),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('File uploaded. The previous file has been replaced.'),
        ]);

        return back();
    }

    public function download(Request $request): StreamedResponse|JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        if (! $this->passwordMatches($request->string('password')->toString())) {
            return response()->json([
                'message' => __('The password is incorrect.'),
            ], 403);
        }

        $path = $this->currentFilePath();

        abort_if($path === null, 404, __('No file has been uploaded yet.'));

        return $this->disk()->download($path, basename($path));
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

    /**
     * @return array{name: string, size: int, uploaded_at: string}|null
     */
    private function currentFileInfo(): ?array
    {
        $path = $this->currentFiles()->first();

        if ($path === null) {
            return null;
        }

        $disk = $this->disk();

        return [
            'name' => basename($path),
            'size' => $disk->size($path),
            'uploaded_at' => now()->setTimestamp($disk->lastModified($path))->toIso8601String(),
        ];
    }

    private function currentFilePath(): ?string
    {
        return $this->currentFiles()->first();
    }

    /**
     * @return Collection<int, string>
     */
    private function currentFiles(): Collection
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
