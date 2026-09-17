import { Head, router, useForm } from '@inertiajs/react';
import { Download, FileText, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { destroy, download, upload } from '@/routes/submeter';

type SharedFile = {
    name: string;
    size: number;
    uploaded_at: string;
};

type Props = {
    files: SharedFile[];
};

function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function csrfHeaders(): Record<string, string> {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

    return match ? { 'X-XSRF-TOKEN': decodeURIComponent(match[1]) } : {};
}

async function sendAction(
    url: string,
    method: 'POST' | 'DELETE',
    payload: Record<string, string>,
): Promise<Response> {
    return fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...csrfHeaders(),
        },
        body: JSON.stringify(payload),
    });
}

export default function Submeter({ files }: Props) {
    const fileInput = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState<string | null>(null);

    const form = useForm<{ password: string; file: File | null }>({
        password: '',
        file: null,
    });

    const requirePassword = (): string | null => {
        if (!form.data.password) {
            toast.error('Enter the password first.');

            return null;
        }

        return form.data.password;
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post(upload().url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset('file');

                if (fileInput.current) {
                    fileInput.current.value = '';
                }
            },
        });
    };

    const handleDownload = async (file: SharedFile) => {
        const password = requirePassword();

        if (password === null) {
            return;
        }

        setBusy(`download:${file.name}`);

        try {
            const response = await sendAction(download().url, 'POST', {
                password,
                name: file.name,
            });

            if (!response.ok) {
                const data = (await response.json().catch(() => null)) as {
                    message?: string;
                } | null;

                toast.error(data?.message ?? 'Unable to download the file.');

                return;
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = objectUrl;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(objectUrl);
        } catch {
            toast.error('Unable to download the file.');
        } finally {
            setBusy(null);
        }
    };

    const handleDelete = async (file: SharedFile) => {
        const password = requirePassword();

        if (password === null) {
            return;
        }

        if (!window.confirm(`Delete "${file.name}"? This cannot be undone.`)) {
            return;
        }

        setBusy(`delete:${file.name}`);

        try {
            const response = await sendAction(destroy().url, 'DELETE', {
                password,
                name: file.name,
            });

            const data = (await response.json().catch(() => null)) as {
                message?: string;
            } | null;

            if (!response.ok) {
                toast.error(data?.message ?? 'Unable to delete the file.');

                return;
            }

            toast.success(data?.message ?? 'File deleted.');
            router.reload();
        } catch {
            toast.error('Unable to delete the file.');
        } finally {
            setBusy(null);
        }
    };

    return (
        <>
            <Head title="Submeter" />

            <section className="border-b border-[#F0DCC2] bg-white/70">
                <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                    <p className="text-xs font-bold tracking-[0.18em] text-[#A62A21] uppercase">
                        Submeter
                    </p>
                    <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-[#2B1200] sm:text-5xl">
                        Upload and manage the shared files
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#6B4A36] sm:text-lg">
                        Enter the password to upload a new file, or to download
                        or delete an existing one.
                    </p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
                <form
                    onSubmit={submit}
                    className="mx-auto max-w-2xl space-y-6 rounded-3xl border border-[#F0DCC2] bg-white p-7 shadow-sm"
                >
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="off"
                            value={form.data.password}
                            onChange={(event) =>
                                form.setData('password', event.target.value)
                            }
                            aria-invalid={Boolean(form.errors.password)}
                        />
                        <InputError message={form.errors.password} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file">File</Label>
                        <Input
                            id="file"
                            type="file"
                            ref={fileInput}
                            onChange={(event) =>
                                form.setData(
                                    'file',
                                    event.target.files?.[0] ?? null,
                                )
                            }
                            aria-invalid={Boolean(form.errors.file)}
                        />
                        <InputError message={form.errors.file} />
                    </div>

                    <Button
                        type="submit"
                        disabled={form.processing}
                        className="bg-[#C13329] text-white hover:bg-[#A62A21]"
                    >
                        <Upload aria-hidden />
                        {form.processing ? 'Uploading...' : 'Upload'}
                    </Button>
                </form>

                <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[#F0DCC2] bg-white shadow-sm">
                    <div className="border-b border-[#F5E5D2] bg-[#FFF8EE] px-6 py-4">
                        <h2 className="text-lg font-extrabold text-[#2B1200]">
                            Uploaded files
                        </h2>
                        <p className="text-xs text-[#8A6A55]">
                            {files.length === 0
                                ? 'No files have been uploaded yet.'
                                : `${files.length} file${files.length === 1 ? '' : 's'}`}
                        </p>
                    </div>

                    {files.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-[#F5E5D2] text-xs font-bold tracking-[0.14em] text-[#8A6A55] uppercase">
                                        <th className="px-6 py-3">File</th>
                                        <th className="px-6 py-3">Size</th>
                                        <th className="px-6 py-3">Uploaded</th>
                                        <th className="px-6 py-3 text-right">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {files.map((file) => (
                                        <tr
                                            key={file.name}
                                            className="border-b border-[#F5E5D2] last:border-b-0"
                                        >
                                            <td className="max-w-xs px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#C13329] text-white">
                                                        <FileText
                                                            className="size-4"
                                                            aria-hidden
                                                        />
                                                    </span>
                                                    <span className="truncate font-bold text-[#2B1200]">
                                                        {file.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[#5C3A28]">
                                                {formatBytes(file.size)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[#5C3A28]">
                                                {new Date(
                                                    file.uploaded_at,
                                                ).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDownload(file)
                                                        }
                                                        disabled={busy !== null}
                                                        className="border-[#E8C9A8] text-[#2B1200] hover:bg-[#FFF3E4] hover:text-[#2B1200]"
                                                    >
                                                        <Download aria-hidden />
                                                        {busy ===
                                                        `download:${file.name}`
                                                            ? 'Downloading...'
                                                            : 'Download'}
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(file)
                                                        }
                                                        disabled={busy !== null}
                                                        className="border-[#C13329]/30 text-[#C13329] hover:bg-[#C13329]/10 hover:text-[#A62A21]"
                                                    >
                                                        <Trash2 aria-hidden />
                                                        {busy ===
                                                        `delete:${file.name}`
                                                            ? 'Deleting...'
                                                            : 'Delete'}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
