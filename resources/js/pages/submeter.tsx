import { Head, useForm } from '@inertiajs/react';
import { Download, FileText, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { download, upload } from '@/routes/submeter';

type SharedFile = {
    name: string;
    size: number;
    uploaded_at: string;
};

type Props = {
    file: SharedFile | null;
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

export default function Submeter({ file }: Props) {
    const fileInput = useRef<HTMLInputElement>(null);
    const [downloading, setDownloading] = useState(false);

    const form = useForm<{ password: string; file: File | null }>({
        password: '',
        file: null,
    });

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

    const handleDownload = async () => {
        if (!form.data.password) {
            toast.error('Enter the password first.');

            return;
        }

        setDownloading(true);

        try {
            const response = await fetch(download().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    ...csrfHeaders(),
                },
                body: JSON.stringify({ password: form.data.password }),
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
            link.download = file?.name ?? 'download';
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(objectUrl);
        } catch {
            toast.error('Unable to download the file.');
        } finally {
            setDownloading(false);
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
                        Upload and download the shared file
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#6B4A36] sm:text-lg">
                        Enter the password to upload a new file or download the
                        current one. Only the most recent file is kept.
                    </p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
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

                    <div className="flex items-start gap-3 rounded-2xl bg-[#FFF8EE] p-4">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#C13329] text-white">
                            <FileText className="size-4" aria-hidden />
                        </span>
                        <div className="min-w-0">
                            <p className="text-xs font-bold tracking-[0.14em] text-[#8A6A55] uppercase">
                                Current file
                            </p>
                            {file ? (
                                <>
                                    <p className="truncate text-sm font-bold text-[#2B1200]">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-[#8A6A55]">
                                        {formatBytes(file.size)} - uploaded{' '}
                                        {new Date(
                                            file.uploaded_at,
                                        ).toLocaleString()}
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-[#6B4A36]">
                                    No file has been uploaded yet.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="bg-[#C13329] text-white hover:bg-[#A62A21]"
                        >
                            <Upload aria-hidden />
                            {form.processing ? 'Uploading...' : 'Upload'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDownload}
                            disabled={downloading || file === null}
                        >
                            <Download aria-hidden />
                            {downloading ? 'Downloading...' : 'Download'}
                        </Button>
                    </div>
                </form>
            </section>
        </>
    );
}
