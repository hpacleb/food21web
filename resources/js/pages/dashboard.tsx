import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, CalendarDays, Inbox, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index } from '@/routes/inquiries';
import { index as prices } from '@/routes/prices';
import type { Inquiry } from '@/types';

type Props = {
    stats: {
        new: number;
        upcoming: number;
        total: number;
    };
    recentInquiries: Inquiry[];
};

const statusLabels: Record<Inquiry['status'], string> = {
    new: 'New',
    contacted: 'Contacted',
    booked: 'Booked',
    closed: 'Closed',
};

function formatDate(value: string | null): string {
    if (!value) {
        return 'No date yet';
    }

    return new Date(value).toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function Dashboard({ stats, recentInquiries }: Props) {
    const cards = [
        {
            title: 'New inquiries',
            value: stats.new,
            description: 'Waiting for your reply',
            icon: Inbox,
            href: index(),
        },
        {
            title: 'Upcoming events',
            value: stats.upcoming,
            description: 'Events with a future date',
            icon: CalendarDays,
            href: index(),
        },
        {
            title: 'Total inquiries',
            value: stats.total,
            description: 'All quote requests received',
            icon: Users,
            href: index(),
        },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Here is what is happening with your catering
                            business.
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={prices()}>Edit menu prices</Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {cards.map((card) => (
                        <Link key={card.title} href={card.href}>
                            <Card className="hover:border-primary/40 transition-colors">
                                <CardHeader className="flex flex-row items-start justify-between gap-4">
                                    <div>
                                        <CardDescription>
                                            {card.title}
                                        </CardDescription>
                                        <CardTitle className="mt-1 text-3xl">
                                            {card.value}
                                        </CardTitle>
                                    </div>
                                    <span className="bg-muted flex size-10 items-center justify-center rounded-lg">
                                        <card.icon className="text-muted-foreground size-5" />
                                    </span>
                                </CardHeader>
                                <CardContent className="text-muted-foreground flex items-center justify-between text-xs">
                                    {card.description}
                                    <ArrowUpRight className="size-4" />
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Recent inquiries</CardTitle>
                            <CardDescription>
                                The latest quote requests from your website.
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={index()}>View all</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentInquiries.length === 0 ? (
                            <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-center text-sm">
                                <Inbox className="size-6" />
                                No inquiries yet. Share your website to start
                                collecting quote requests.
                            </div>
                        ) : (
                            <ul className="divide-sidebar-border/70 dark:divide-sidebar-border divide-y">
                                {recentInquiries.map((inquiry) => (
                                    <li
                                        key={inquiry.id}
                                        className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">
                                                {inquiry.name}
                                            </p>
                                            <p className="text-muted-foreground truncate text-xs">
                                                {inquiry.event_type} &middot;{' '}
                                                {formatDate(inquiry.event_date)}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className="capitalize"
                                        >
                                            {statusLabels[inquiry.status]}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
