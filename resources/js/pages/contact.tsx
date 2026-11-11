import { Link, useForm, usePage } from '@inertiajs/react';
import {
    Clock,
    Facebook,
    Mail,
    MapPin,
    MessageCircle,
    Send,
} from 'lucide-react';
import type { FormEvent } from 'react';
import Seo from '@/components/seo';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { order } from '@/routes';

type Props = {
    eventTypes: string[];
};

type QuoteForm = {
    name: string;
    email: string;
    phone: string;
    event_type: string;
    event_date: string;
    guests: string;
    message: string;
};

export default function Contact({ eventTypes }: Props) {
    const { site } = usePage().props;
    const viberNumber = site.quote.viber.replace(/[^+\d]/g, '');
    const viberLink = `viber://chat?number=${encodeURIComponent(
        `+63${viberNumber.replace(/^0/, '')}`,
    )}`;

    const form = useForm<QuoteForm>({
        name: '',
        email: '',
        phone: '',
        event_type: '',
        event_date: '',
        guests: '',
        message: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post('/contact', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    return (
        <>
            <Seo />

            <section className="border-b border-[#F0DCC2] bg-white/70">
                <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                    <p className="text-xs font-bold tracking-[0.18em] text-[#A62A21] uppercase">
                        Contact
                    </p>
                    <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-[#2B1200] sm:text-5xl">
                        Talk to us about your event
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#6B4A36] sm:text-lg">
                        Send the quote form below, message us on Viber, or reach
                        out on Facebook. We usually reply within the same day.
                    </p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl space-y-6">
                    <div className="rounded-3xl border border-[#F0DCC2] bg-white p-7 shadow-sm">
                        <h2 className="text-lg font-extrabold text-[#2B1200]">
                            Request a quote
                        </h2>
                        <p className="mt-2 text-sm leading-relaxed text-[#6B4A36]">
                            Tell us the date, headcount, and budget. We will
                            reply with a menu and a quote.
                        </p>

                        <form onSubmit={submit} className="mt-6 space-y-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(e) =>
                                            form.setData('name', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError message={form.errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) =>
                                            form.setData(
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError message={form.errors.email} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">
                                        Phone (optional)
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={form.data.phone}
                                        onChange={(e) =>
                                            form.setData(
                                                'phone',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={form.errors.phone} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="event_date">
                                        Event date (optional)
                                    </Label>
                                    <Input
                                        id="event_date"
                                        type="date"
                                        value={form.data.event_date}
                                        onChange={(e) =>
                                            form.setData(
                                                'event_date',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError
                                        message={form.errors.event_date}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="event_type">
                                        Event type
                                    </Label>
                                    <select
                                        id="event_type"
                                        value={form.data.event_type}
                                        onChange={(e) =>
                                            form.setData(
                                                'event_type',
                                                e.target.value,
                                            )
                                        }
                                        required
                                        className="h-9 w-full rounded-md border border-[#E7C9A6] bg-white px-3 text-sm shadow-xs outline-none focus:border-[#C13329] focus:ring-[3px] focus:ring-[#C13329]/20"
                                    >
                                        <option value="" disabled>
                                            Select an event type
                                        </option>
                                        {eventTypes.map((eventType) => (
                                            <option
                                                key={eventType}
                                                value={eventType}
                                            >
                                                {eventType}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError
                                        message={form.errors.event_type}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="guests">
                                        Guest count (optional)
                                    </Label>
                                    <Input
                                        id="guests"
                                        type="number"
                                        min={1}
                                        value={form.data.guests}
                                        onChange={(e) =>
                                            form.setData(
                                                'guests',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <InputError message={form.errors.guests} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="message">
                                    Message (optional)
                                </Label>
                                <Textarea
                                    id="message"
                                    rows={4}
                                    value={form.data.message}
                                    onChange={(e) =>
                                        form.setData('message', e.target.value)
                                    }
                                />
                                <InputError message={form.errors.message} />
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="inline-flex h-11 items-center gap-2 rounded-full bg-[#C13329] px-6 text-sm font-bold text-white transition-colors hover:bg-[#A62A21] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Send className="size-4" aria-hidden />
                                    Send request
                                </button>
                                {form.recentlySuccessful ? (
                                    <p className="text-sm font-semibold text-green-700">
                                        Thanks — your request is in.
                                    </p>
                                ) : null}
                            </div>
                        </form>
                    </div>

                    <div className="rounded-3xl bg-[#4A0F0B] p-7 text-[#F8E8D8]">
                        <h2 className="text-lg font-extrabold text-white">
                            Talk to us directly
                        </h2>
                        <ul className="mt-5 space-y-4 text-sm">
                            <li>
                                <a
                                    href={viberLink}
                                    className="flex items-start gap-3 transition-colors hover:text-white"
                                >
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FFD60A] text-[#411600]">
                                        <MessageCircle
                                            className="size-4"
                                            aria-hidden
                                        />
                                    </span>
                                    <span>
                                        <span className="block font-bold text-white">
                                            {site.quote.viber}
                                        </span>
                                        <span className="text-xs text-[#D8B5A8]">
                                            Viber - fastest for catering quotes
                                        </span>
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`mailto:${site.quote.email}`}
                                    className="flex items-start gap-3 transition-colors hover:text-white"
                                >
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FFD60A] text-[#411600]">
                                        <Mail className="size-4" aria-hidden />
                                    </span>
                                    <span>
                                        <span className="block font-bold break-all text-white">
                                            {site.quote.email}
                                        </span>
                                        <span className="text-xs text-[#D8B5A8]">
                                            Email us your event details
                                        </span>
                                    </span>
                                </a>
                            </li>
                            <li>
                                <a
                                    href={site.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 transition-colors hover:text-white"
                                >
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#FFD60A] text-[#411600]">
                                        <Facebook
                                            className="size-4"
                                            aria-hidden
                                        />
                                    </span>
                                    <span className="font-bold text-white">
                                        Message on Facebook
                                    </span>
                                </a>
                            </li>
                        </ul>
                        <p className="mt-5 border-t border-white/10 pt-4 text-xs text-[#D8B5A8]">
                            Ordering food for delivery instead?{' '}
                            <Link
                                href={order()}
                                className="font-bold text-[#FFD60A] underline"
                            >
                                Use the delivery order lines
                            </Link>
                            .
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#F0DCC2] bg-white p-7 shadow-sm">
                        <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#2B1200]">
                            <MapPin
                                className="size-5 text-[#C13329]"
                                aria-hidden
                            />
                            Visit or deliver
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-[#5C3A28]">
                            {site.address}
                        </p>
                        <p className="mt-2 text-xs text-[#8A6A55]">
                            {site.service_area}
                        </p>

                        <h3 className="mt-6 flex items-center gap-2 text-sm font-bold tracking-[0.14em] text-[#8A6A55] uppercase">
                            <Clock
                                className="size-4 text-[#C13329]"
                                aria-hidden
                            />
                            Hours
                        </h3>
                        <ul className="mt-3 space-y-2 text-sm">
                            {site.hours.map((entry) => (
                                <li
                                    key={entry.days}
                                    className="flex items-center justify-between gap-4 border-b border-[#F5E5D2] pb-2"
                                >
                                    <span className="text-[#5C3A28]">
                                        {entry.days}
                                    </span>
                                    <span className="font-semibold text-[#2B1200]">
                                        {entry.time}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
        </>
    );
}
