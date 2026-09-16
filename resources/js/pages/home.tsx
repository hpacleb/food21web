import { Link, usePage } from '@inertiajs/react';
import {
    CalendarClock,
    Check,
    ChevronRight,
    Heart,
    MapPin,
    PartyPopper,
    Phone,
    Truck,
    UtensilsCrossed,
} from 'lucide-react';
import Seo from '@/components/seo';
import { about, contact, gallery, menu, order } from '@/routes';
import type { MenuItem } from '@/types';

type Props = {
    featuredDishes: MenuItem[];
};

const services = [
    {
        icon: UtensilsCrossed,
        title: 'Office and corporate',
        description:
            'Lunch meetings, trainings, and team milestones with packed trays or a buffet setup.',
    },
    {
        icon: Heart,
        title: 'Weddings and debuts',
        description:
            'Reception spreads with full service, styling, and a menu your guests will remember.',
    },
    {
        icon: PartyPopper,
        title: 'Birthdays and fiestas',
        description:
            'Trays, buffet lines, and pica-pica for intimate handaan or 150-guest celebrations.',
    },
    {
        icon: CalendarClock,
        title: 'Weekly meal delivery',
        description:
            'Freshly cooked ulam delivered on a schedule for families, offices, and teams.',
    },
];

const steps = [
    {
        title: 'Tell us about your event',
        description:
            'Send your date, headcount, and budget through the quote form or a quick call.',
    },
    {
        title: 'We plan the menu',
        description:
            'We recommend dishes that fit your event, then confirm every detail.',
    },
    {
        title: 'We cook and deliver',
        description:
            'Our team arrives on time with your food hot, set up, and ready to serve.',
    },
];

export default function Home({ featuredDishes }: Props) {
    const { site } = usePage().props;

    return (
        <>
            <Seo />

            <section className="relative overflow-hidden">
                <div
                    className="pointer-events-none absolute -top-32 -right-24 -z-10 size-[26rem] rounded-full bg-[#FFD60A]/30 blur-3xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -bottom-40 -left-32 -z-10 size-[24rem] rounded-full bg-[#C13329]/10 blur-3xl"
                    aria-hidden
                />

                <div className="mx-auto grid w-full max-w-6xl gap-14 px-4 pt-14 pb-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pt-20">
                    <div>
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#EBC9A9] bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-[#A62A21] uppercase">
                            <MapPin className="size-3.5" aria-hidden />
                            Parañaque City &middot; Catering &amp; Delivery
                        </span>

                        <h1 className="mt-6 text-4xl leading-[1.05] font-extrabold tracking-tight text-[#2B1200] sm:text-5xl lg:text-6xl">
                            Filipino party favorites,{' '}
                            <span className="relative whitespace-nowrap text-[#C13329]">
                                delivered hot
                                <svg
                                    className="absolute -bottom-2 left-0 w-full text-[#FFD60A]"
                                    viewBox="0 0 300 12"
                                    fill="none"
                                    aria-hidden
                                >
                                    <path
                                        d="M2 9C60 3 120 2 180 5C220 7 260 8 298 4"
                                        stroke="currentColor"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>{' '}
                            to your event.
                        </h1>

                        <p className="mt-6 max-w-xl text-base leading-relaxed text-[#6B4A36] sm:text-lg">
                            {site.description}
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={contact()}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#C13329] px-7 text-sm font-bold text-white shadow-lg shadow-[#C13329]/25 transition-colors hover:bg-[#A62A21]"
                            >
                                Get a free quote
                                <ChevronRight className="size-4" aria-hidden />
                            </Link>
                            <Link
                                href={menu()}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#E7C9A6] bg-white/60 px-7 text-sm font-bold text-[#411600] transition-colors hover:border-[#C13329] hover:text-[#C13329]"
                            >
                                View the menu
                            </Link>
                        </div>

                        <ul className="mt-9 grid gap-3 text-sm font-medium text-[#5C3A28] sm:grid-cols-3">
                            {[
                                'Fresh-cooked every order',
                                'On-time delivery',
                                'Flexible menus',
                            ].map((item) => (
                                <li
                                    key={item}
                                    className="flex items-center gap-2"
                                >
                                    <span className="flex size-5 items-center justify-center rounded-full bg-[#FFD60A] text-[#411600]">
                                        <Check
                                            className="size-3"
                                            strokeWidth={3}
                                            aria-hidden
                                        />
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                        <div
                            className="absolute -top-6 -right-4 hidden size-28 rotate-12 rounded-3xl bg-[#FFD60A] sm:block"
                            aria-hidden
                        />

                        <div className="relative rounded-[2rem] bg-gradient-to-br from-[#C13329] to-[#8F1F18] p-5 shadow-2xl shadow-[#C13329]/30">
                            <div className="relative">
                                <img
                                    src={site.hero_image}
                                    alt={`Signature dishes from ${site.name}`}
                                    className="aspect-[4/3] w-full rounded-2xl object-cover"
                                />
                                <div className="absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-[#F0DCC2]">
                                    <img
                                        src={site.logo}
                                        alt={`${site.name} logo`}
                                        className="size-12 rounded-xl object-cover"
                                    />
                                    <div>
                                        <p className="text-sm font-extrabold text-[#2B1200]">
                                            Food{' '}
                                            <span className="text-[#C13329]">
                                                21
                                            </span>
                                        </p>
                                        <p className="text-[10px] font-semibold tracking-[0.14em] text-[#8A5A3B] uppercase">
                                            Catering &amp; Delivery
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 rounded-2xl bg-white p-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold tracking-[0.16em] text-[#A62A21] uppercase">
                                        Guest favorites
                                    </p>
                                    <UtensilsCrossed
                                        className="size-4 text-[#C13329]"
                                        aria-hidden
                                    />
                                </div>
                                <ul className="mt-3 divide-y divide-[#F5E5D2]">
                                    {featuredDishes.map((dish) => (
                                        <li
                                            key={dish.name}
                                            className="flex items-center justify-between gap-4 py-2.5"
                                        >
                                            <div>
                                                <p className="text-sm font-bold text-[#2B1200]">
                                                    {dish.name}
                                                </p>
                                                <p className="text-xs text-[#8A6A55]">
                                                    {dish.description}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-xs font-bold text-[#C13329]">
                                                {dish.price}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="absolute -top-5 -left-4 flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-xl sm:-left-8">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-[#C13329]/10 text-[#C13329]">
                                <Truck className="size-5" aria-hidden />
                            </span>
                            <div>
                                <p className="text-sm font-bold text-[#2B1200]">
                                    We deliver
                                </p>
                                <p className="text-xs text-[#8A6A55]">
                                    {site.service_area.split('.')[0]}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-y border-[#F0DCC2] bg-white/70">
                <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
                    {site.stats.map((stat) => (
                        <div key={stat.label} className="text-center">
                            <p className="text-3xl font-extrabold tracking-tight text-[#C13329] sm:text-4xl">
                                {stat.value}
                            </p>
                            <p className="mt-1 text-xs font-semibold tracking-wide text-[#7A5540] uppercase">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                    <p className="text-xs font-bold tracking-[0.18em] text-[#A62A21] uppercase">
                        What we cater
                    </p>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#2B1200] sm:text-4xl">
                        One kitchen for every kind of celebration
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-[#6B4A36]">
                        Tell us the headcount and the occasion, and we will
                        build a spread that fits.
                    </p>
                </div>

                <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {services.map((service) => (
                        <div
                            key={service.title}
                            className="group rounded-2xl border border-[#F0DCC2] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#C13329]/40 hover:shadow-lg"
                        >
                            <span className="flex size-12 items-center justify-center rounded-xl bg-[#C13329]/10 text-[#C13329] transition-colors group-hover:bg-[#C13329] group-hover:text-white">
                                <service.icon className="size-6" aria-hidden />
                            </span>
                            <h3 className="mt-4 text-lg font-bold text-[#2B1200]">
                                {service.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[#6B4A36]">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-[#4A0F0B] py-20 text-[#F8E8D8]">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold tracking-[0.18em] text-[#FFD60A] uppercase">
                            How it works
                        </p>
                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            From inquiry to handaan in three steps
                        </h2>
                    </div>

                    <div className="mt-12 grid gap-8 md:grid-cols-3">
                        {steps.map((step, index) => (
                            <div key={step.title} className="relative">
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

                    <div className="mt-12 flex flex-col items-start gap-3 sm:flex-row">
                        <a
                            href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}
                            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FFD60A] px-6 text-sm font-bold text-[#411600] transition-colors hover:bg-[#FFE45C]"
                        >
                            <Phone className="size-4" aria-hidden />
                            Call {site.phone}
                        </a>
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
                    <div className="max-w-2xl">
                        <p className="text-xs font-bold tracking-[0.18em] text-[#A62A21] uppercase">
                            Gallery
                        </p>
                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#2B1200] sm:text-4xl">
                            A peek at our plates and parties
                        </h2>
                    </div>
                    <Link
                        href={gallery()}
                        className="inline-flex items-center gap-1 text-sm font-bold text-[#C13329] hover:text-[#A62A21]"
                    >
                        View full gallery
                        <ChevronRight className="size-4" aria-hidden />
                    </Link>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {site.gallery.slice(0, 8).map((image) => (
                        <Link
                            key={image.src}
                            href={gallery()}
                            className="group relative overflow-hidden rounded-2xl"
                        >
                            <img
                                src={image.src}
                                alt={image.caption}
                                loading="lazy"
                                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2B0D0A]/80 to-transparent p-3 pt-8 text-xs font-semibold text-white">
                                {image.caption}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#C13329] to-[#8F1F18] px-6 py-14 text-center shadow-2xl shadow-[#C13329]/25 sm:px-12">
                    <div
                        className="pointer-events-none absolute -top-16 -right-10 size-56 rounded-full bg-[#FFD60A]/20 blur-2xl"
                        aria-hidden
                    />
                    <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Planning an event? Let us feed your guests.
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#FFD9CE] sm:text-base">
                        Send us your date and headcount and we will reply with a
                        menu and a quote within the day.
                    </p>
                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href={contact()}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#FFD60A] px-7 text-sm font-bold text-[#411600] transition-colors hover:bg-[#FFE45C]"
                        >
                            Request a quote
                            <ChevronRight className="size-4" aria-hidden />
                        </Link>
                        <a
                            href={site.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-12 items-center justify-center rounded-full border-2 border-white/40 px-7 text-sm font-bold text-white transition-colors hover:border-white"
                        >
                            Message us on Facebook
                        </a>
                    </div>
                    <p className="mt-6 text-xs text-[#FFB9A8]">
                        Prefer to talk?{' '}
                        <Link href={about()} className="underline">
                            Learn more about us
                        </Link>{' '}
                        or call{' '}
                        <a
                            href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}
                            className="font-bold text-white underline"
                        >
                            {site.phone}
                        </a>
                    </p>
                    <p className="mt-3 text-xs text-[#FFB9A8]">
                        For delivery orders, call{' '}
                        <Link
                            href={order()}
                            className="font-bold text-white underline"
                        >
                            {site.delivery.landlines.join(' or ')}
                        </Link>{' '}
                        - open Monday to Sunday, 8:00 AM to 8:00 PM.
                    </p>
                </div>
            </section>
        </>
    );
}
