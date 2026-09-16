import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, Inbox, Mail, Phone, Trash2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { dashboard, home } from '@/routes';
import { destroy, index, status } from '@/routes/inquiries';
import type { Inquiry } from '@/types';

type Props = {
    inquiries: Inquiry[];
    statuses: Inquiry['status'][];
};

const statusStyles: Record<Inquiry['status'], string> = {
    new: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300',
    contacted:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
    booked: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
    closed: 'border-neutral-200 bg-neutral-100 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400',
};

function formatDate(value: string | null): string {
    if (!value) {
        return 'Not set';
    }

    return new Date(value).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function StatusSelect({
    inquiry,
    statuses,
}: {
    inquiry: Inquiry;
    statuses: Inquiry['status'][];
}) {
    return (
        <Select
            value={inquiry.status}
            onValueChange={(value) =>
                router.patch(
                    status(inquiry.id).url,
                    { status: value },
                    { preserveScroll: true },
                )
            }
        >
            <SelectTrigger
                size="sm"
                className="h-8 w-32 text-xs font-medium capitalize"
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {statuses.map((option) => (
                    <SelectItem
                        key={option}
                        value={option}
                        className="text-xs capitalize"
                    >
                        {option}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

function DeleteButton({ inquiry }: { inquiry: Inquiry }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive size-8"
            onClick={() => {
                if (
                    window.confirm(
                        `Delete the inquiry from ${inquiry.name}? This cannot be undone.`,
                    )
                ) {
                    router.delete(destroy(inquiry.id).url, {
                        preserveScroll: true,
                    });
                }
            }}
        >
            <Trash2 className="size-4" />
            <span className="sr-only">Delete inquiry</span>
        </Button>
    );
}

export default function InquiriesIndex({ inquiries, statuses }: Props) {
    return (
        <>
            <Head title="Inquiries" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Quote requests
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {inquiries.length} request
                            {inquiries.length === 1 ? '' : 's'} from the website
                            contact form.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={dashboard()}>Back to dashboard</Link>
                    </Button>
                </div>

                {inquiries.length === 0 ? (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-center">
                        <span className="bg-muted flex size-12 items-center justify-center rounded-full">
                            <Inbox className="text-muted-foreground size-6" />
                        </span>
                        <h2 className="text-lg font-semibold">
                            No inquiries yet
                        </h2>
                        <p className="text-muted-foreground max-w-sm text-sm">
                            When clients send the quote form on your website,
                            their requests will show up here.
                        </p>
                        <Button asChild className="mt-2">
                            <Link href={home()}>View public site</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="border-sidebar-border/70 dark:border-sidebar-border hidden overflow-x-auto rounded-xl border md:block">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Client
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Event
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Date
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Guests
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Received
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-sidebar-border/70 dark:divide-sidebar-border divide-y">
                                    {inquiries.map((inquiry) => (
                                        <tr
                                            key={inquiry.id}
                                            className="align-top"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium">
                                                    {inquiry.name}
                                                </p>
                                                <a
                                                    href={`mailto:${inquiry.email}`}
                                                    className="text-muted-foreground flex items-center gap-1.5 text-xs hover:underline"
                                                >
                                                    <Mail className="size-3" />
                                                    {inquiry.email}
                                                </a>
                                                {inquiry.phone && (
                                                    <a
                                                        href={`tel:${inquiry.phone.replace(/[^+\d]/g, '')}`}
                                                        className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs hover:underline"
                                                    >
                                                        <Phone className="size-3" />
                                                        {inquiry.phone}
                                                    </a>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p>{inquiry.event_type}</p>
                                                {inquiry.message && (
                                                    <p
                                                        className="text-muted-foreground mt-1 line-clamp-2 max-w-xs text-xs"
                                                        title={inquiry.message}
                                                    >
                                                        {inquiry.message}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {formatDate(inquiry.event_date)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {inquiry.guests ?? '—'}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3 text-xs whitespace-nowrap">
                                                {formatDate(inquiry.created_at)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusSelect
                                                    inquiry={inquiry}
                                                    statuses={statuses}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <DeleteButton
                                                    inquiry={inquiry}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-4 md:hidden">
                            {inquiries.map((inquiry) => (
                                <div
                                    key={inquiry.id}
                                    className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="font-semibold">
                                                {inquiry.name}
                                            </p>
                                            <Badge
                                                variant="outline"
                                                className={`mt-1 capitalize ${statusStyles[inquiry.status]}`}
                                            >
                                                {inquiry.status}
                                            </Badge>
                                        </div>
                                        <DeleteButton inquiry={inquiry} />
                                    </div>
                                    <div className="text-muted-foreground mt-3 space-y-1.5 text-xs">
                                        <p className="flex items-center gap-1.5">
                                            <Mail className="size-3" />
                                            {inquiry.email}
                                        </p>
                                        {inquiry.phone && (
                                            <p className="flex items-center gap-1.5">
                                                <Phone className="size-3" />
                                                {inquiry.phone}
                                            </p>
                                        )}
                                        <p className="flex items-center gap-1.5">
                                            <CalendarDays className="size-3" />
                                            {inquiry.event_type} &middot;{' '}
                                            {formatDate(inquiry.event_date)}
                                        </p>
                                        <p className="flex items-center gap-1.5">
                                            <Users className="size-3" />
                                            {inquiry.guests
                                                ? `${inquiry.guests} guests`
                                                : 'Guest count not set'}
                                        </p>
                                    </div>
                                    {inquiry.message && (
                                        <p className="bg-muted/50 mt-3 rounded-lg p-3 text-xs">
                                            {inquiry.message}
                                        </p>
                                    )}
                                    <div className="mt-4">
                                        <StatusSelect
                                            inquiry={inquiry}
                                            statuses={statuses}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

InquiriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Inquiries',
            href: index(),
        },
    ],
};
