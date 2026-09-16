import { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Check, RotateCcw, Save, Search, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { dashboard, menu } from '@/routes';
import { index, update } from '@/routes/prices';
import type { MenuPrice } from '@/types';

type Props = {
    prices: MenuPrice[];
    groups: string[];
};

function PriceEditor({ price }: { price: MenuPrice }) {
    const [value, setValue] = useState(price.price);
    const [processing, setProcessing] = useState(false);
    const dirty = value !== price.price;

    const save = () => {
        if (!dirty || value.trim() === '') {
            return;
        }

        router.patch(
            update(price.id).url,
            { price: value },
            {
                preserveScroll: true,
                preserveState: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <div className="flex items-center gap-2">
            <Input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        save();
                    }
                }}
                aria-label={`Price for ${price.label}`}
                className="h-9 w-full max-w-xs"
            />

            {dirty ? (
                <>
                    <Button
                        size="sm"
                        onClick={save}
                        disabled={processing || value.trim() === ''}
                        className="gap-1.5"
                    >
                        {processing ? (
                            <Spinner className="size-3.5" />
                        ) : (
                            <Save className="size-3.5" />
                        )}
                        Save
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground size-8"
                        onClick={() => setValue(price.price)}
                    >
                        <RotateCcw className="size-3.5" />
                        <span className="sr-only">
                            Discard changes for {price.label}
                        </span>
                    </Button>
                </>
            ) : (
                <span className="text-muted-foreground inline-flex items-center gap-1 text-xs whitespace-nowrap">
                    <Check className="size-3.5 text-emerald-500" />
                    Saved
                </span>
            )}
        </div>
    );
}

export default function PricesIndex({ prices, groups }: Props) {
    const [search, setSearch] = useState('');
    const [group, setGroup] = useState('All');

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();

        return prices.filter((price) => {
            const matchesGroup = group === 'All' || price.group === group;
            const matchesSearch =
                term === '' ||
                price.label.toLowerCase().includes(term) ||
                price.group.toLowerCase().includes(term);

            return matchesGroup && matchesSearch;
        });
    }, [prices, group, search]);

    return (
        <>
            <Head title="Menu prices" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Menu prices
                        </h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Edit any price and it updates on the public menu
                            right away. {prices.length} entries.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <a
                                href={menu().url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View public menu
                            </a>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={dashboard()}>Back to dashboard</Link>
                        </Button>
                    </div>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search dishes..."
                                className="pl-9"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {['All', ...groups].map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setGroup(option)}
                                    className={
                                        group === option
                                            ? 'bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-xs font-semibold'
                                            : 'border-input text-muted-foreground hover:text-foreground rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors'
                                    }
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-muted-foreground mt-3 text-xs">
                        Tip: prices appear on the website exactly as typed, for
                        example{' '}
                        <span className="text-foreground font-medium">
                            From ₱260 / good for 2
                        </span>
                        . Press Enter or click Save after editing.
                    </p>
                </div>

                {filtered.length === 0 ? (
                    <div className="border-sidebar-border/70 dark:border-sidebar-border flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-12 text-center">
                        <Tag className="text-muted-foreground size-6" />
                        <p className="font-medium">No prices found</p>
                        <p className="text-muted-foreground text-sm">
                            Try a different search term or group filter.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="border-sidebar-border/70 dark:border-sidebar-border hidden overflow-x-auto rounded-xl border md:block">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Item
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Price
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-sidebar-border/70 dark:divide-sidebar-border divide-y">
                                    {filtered.map((price) => (
                                        <tr key={price.id}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium">
                                                    {price.label}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {price.group}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <PriceEditor price={price} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid gap-3 md:hidden">
                            {filtered.map((price) => (
                                <div
                                    key={price.id}
                                    className="border-sidebar-border/70 dark:border-sidebar-border rounded-xl border p-4"
                                >
                                    <p className="font-medium">{price.label}</p>
                                    <p className="text-muted-foreground text-xs">
                                        {price.group}
                                    </p>
                                    <div className="mt-3">
                                        <PriceEditor price={price} />
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

PricesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
        {
            title: 'Menu prices',
            href: index(),
        },
    ],
};
