import { Link, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    ChevronRight,
    Clock,
    Facebook,
    MapPin,
    Phone,
    PhoneCall,
} from 'lucide-react';
import Seo from '@/components/seo';
import { contact, menu } from '@/routes';

const steps = [
    {
        title: 'Call either landline',
        description:
            'Both lines are open Monday to Sunday, 8:00 AM to 8:00 PM.',
    },
    {
        title: 'Tell us your order',
        description:
            'Share the dishes, quantities, and your complete delivery address.',
    },
    {
        title: 'We cook and deliver',
        description:
            'Your food is cooked fresh and delivered hot to your door.',
    },
];

export default function Order() {
    const { site } = usePage().props;

    return (
        <>
            <Seo />

            <section className="border-b border-[#F0DCC2] bg-white/70">
                <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                    <p className="text-xs font-bold tracking-[0.18em] text-[#A62A21] uppercase">
                        Delivery orders
                    </p>
                    <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-[#2B1200] sm:text-5xl">
                        Order food for delivery
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#6B4A36] sm:text-lg">
                        We take delivery orders over the phone. Call either
                        landline during our serving hours and our team will
                        prepare your food and bring it to your door.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-[#5C3A28]">
                        <span className="flex items-center gap-2">
                            <Clock
                                className="size-4 text-[#C13329]"
                                aria-hidden
                            />
                            Monday to Sunday, 8:00 AM - 8:00 PM
                        </span>
                        <span className="flex items-center gap-2">
                            <MapPin
                                className="size-4 text-[#C13329]"
                                aria-hidden
                            />
                            {site.service_area}
                        </span>
                    </div>
                    <div className="mt-8">
                        <a
                            href={site.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1877F2] px-6 text-sm font-bold text-white transition-colors hover:bg-[#0F63D6]"
                        >
                            <Facebook className="size-4" aria-hidden />
                            Order via Facebook message
                        </a>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-6 md:grid-cols-2">
                    {site.delivery.landlines.map((landline) => (
                        <a
                            key={landline}
                            href={`tel:${landline.replace(/[^+\d]/g, '')}`}
                            className="group rounded-3xl border-2 border-[#C13329] bg-white p-8 text-center shadow-xl shadow-[#C13329]/10 transition-transform hover:-translate-y-1"
                        >
                            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#C13329] text-white">
                                <PhoneCall className="size-7" aria-hidden />
                            </span>
                            <p className="mt-5 text-xs font-bold tracking-[0.16em] text-[#8A6A55] uppercase">
                                Delivery order line
                            </p>
                            <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#2B1200] sm:text-4xl">
                                {landline}
                            </p>
                            <span className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-[#C13329] px-6 text-sm font-bold text-white transition-colors group-hover:bg-[#A62A21]">
                                <Phone className="size-4" aria-hidden />
                                Call to order
                            </span>
                        </a>
                    ))}
                </div>
                <p className="mt-4 text-center text-xs text-[#8A6A55]">
                    Both landlines are open during serving hours. For large or
                    same-day orders, call ahead so we can prepare.
                </p>
            </section>

            <section className="border-y border-[#F0DCC2] bg-[#4A0F0B] py-16 text-[#F8E8D8]">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold tracking-[0.18em] text-[#FFD60A] uppercase">
                            How ordering works
                        </p>
                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            Three steps from call to delivery
                        </h2>
                    </div>
                    <div className="mt-12 grid gap-8 md:grid-cols-3">
                        {steps.map((step, index) => (
                            <div key={step.title}>
                                <span className="flex size-12 items-center justify-center rounded-2xl bg-[#FFD60A] text-lg font-extrabold text-[#411600]">
                                    {index + 1}
                                </span>
                                <h3 className="mt-4 text-lg font-bold text-white">
                                    {step.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-[#D8B5A8]">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-3xl border border-[#F0DCC2] bg-white p-7 shadow-sm">
                        <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#2B1200]">
                            <BadgeCheck
                                className="size-5 text-[#C13329]"
                                aria-hidden
                            />
                            Delivery details
                        </h2>
                        <ul className="mt-5 space-y-3 text-sm text-[#5C3A28]">
                            <li className="flex items-start gap-2">
                                <MapPin
                                    className="mt-0.5 size-4 shrink-0 text-[#C13329]"
                                    aria-hidden
                                />
                                {site.address}
                            </li>
                            <li className="flex items-start gap-2">
                                <Clock
                                    className="mt-0.5 size-4 shrink-0 text-[#C13329]"
                                    aria-hidden
                                />
                                {site.hours
                                    .map(
                                        (entry) =>
                                            `${entry.days}, ${entry.time}`,
                                    )
                                    .join(' / ')}
                            </li>
                        </ul>
                        <Link
                            href={menu()}
                            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#C13329] px-6 text-sm font-bold text-white transition-colors hover:bg-[#A62A21]"
                        >
                            Browse the menu
                            <ChevronRight className="size-4" aria-hidden />
                        </Link>
                    </div>

                    <div className="rounded-3xl bg-[#FFF3D6] p-7">
                        <h2 className="text-lg font-extrabold text-[#2B1200]">
                            Catering an event?
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-[#5C3A28]">
                            Party trays, buffets, and full event catering are
                            handled separately from delivery orders. For
                            catering quotes, message us on Viber at{' '}
                            <span className="font-bold">
                                {site.quote.viber}
                            </span>{' '}
                            or email{' '}
                            <a
                                href={`mailto:${site.quote.email}`}
                                className="font-bold text-[#A62A21] underline"
                            >
                                {site.quote.email}
                            </a>
                            .
                        </p>
                        <Link
                            href={contact()}
                            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border-2 border-[#C13329] px-6 text-sm font-bold text-[#C13329] transition-colors hover:bg-[#C13329] hover:text-white"
                        >
                            Get a catering quote
                            <ChevronRight className="size-4" aria-hidden />
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
