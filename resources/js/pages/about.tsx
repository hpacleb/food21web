import { Link, usePage } from '@inertiajs/react';
import {
    CalendarClock,
    ChefHat,
    ChevronRight,
    Heart,
    MapPin,
    ShieldCheck,
    Sparkles,
    Truck,
} from 'lucide-react';
import Seo from '@/components/seo';
import { contact, menu } from '@/routes';

const values = [
    {
        icon: ChefHat,
        title: 'Cooked to order',
        description:
            'Nothing sits in a warmer for days. We prep and cook the day of your event so every tray arrives tasting fresh.',
    },
    {
        icon: Heart,
        title: 'Recipes with history',
        description:
            'Our menu comes from family recipes that have been served at countless birthdays, reunions, and Sunday lunches.',
    },
    {
        icon: Truck,
        title: 'On-time delivery',
        description:
            'We plan routes and cooking schedules around your call time, so food arrives hot and ready to serve.',
    },
    {
        icon: ShieldCheck,
        title: 'Thoughtful from start to finish',
        description:
            'We carefully prepare and pack each order so your food arrives fresh and enjoyable.',
    },
];

export default function About() {
    const { site } = usePage().props;

    return (
        <>
            <Seo />

            <section className="border-b border-[#F0DCC2] bg-white/70">
                <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                    <p className="text-xs font-bold tracking-[0.18em] text-[#A62A21] uppercase">
                        About us
                    </p>
                    <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-[#2B1200] sm:text-5xl">
                        A neighborhood kitchen that grew with its customers
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#6B4A36] sm:text-lg">
                        {site.name} started as a small family kitchen in
                        Parañaque, cooking favorites for friends and neighbors.
                        Word spread, orders grew, and today we deliver
                        celebration food across the metro.
                    </p>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div className="relative mx-auto w-full max-w-sm">
                        <img
                            src={
                                site.gallery.find(
                                    (image) => image.tag === 'Events',
                                )?.src ?? site.logo
                            }
                            alt={`${site.name} event setup`}
                            className="relative aspect-[4/5] w-full rounded-[2rem] border-4 border-white object-cover shadow-2xl shadow-[#C13329]/20"
                        />
                        <img
                            src={site.logo}
                            alt={`${site.name} logo`}
                            className="absolute -top-5 -left-5 size-20 rounded-2xl border-4 border-white object-cover shadow-xl"
                        />
                        <div className="absolute -right-4 -bottom-6 rounded-2xl bg-[#4A0F0B] px-5 py-4 text-white shadow-xl">
                            <p className="text-2xl font-extrabold">
                                Since day one
                            </p>
                            <p className="text-xs text-[#D8B5A8]">
                                Family-run, still cooking
                            </p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight text-[#2B1200]">
                            Food that feels like home
                        </h2>
                        <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#5C3A28] sm:text-base">
                            <p>
                                We believe catering should taste like someone
                                cared about the food, not like it came off an
                                assembly line. That means real garlic in the
                                adobo, a kare-kare that simmers until the peanut
                                sauce is right, and leche flan made the slow
                                way.
                            </p>
                            <p>
                                Every package is flexible. Tell us your
                                headcount, budget, and the kind of event you are
                                planning, and we will put together a menu that
                                works. Vegetarian, gluten-free, and no-pork
                                options are always available.
                            </p>
                            <p>
                                Most of all, we want the food to be one thing
                                you do not have to worry about. You host, we
                                handle the kitchen.
                            </p>
                        </div>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={contact()}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#C13329] px-6 text-sm font-bold text-white transition-colors hover:bg-[#A62A21]"
                            >
                                Plan an event with us
                                <ChevronRight className="size-4" aria-hidden />
                            </Link>
                            <Link
                                href={menu()}
                                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-[#E7C9A6] px-6 text-sm font-bold text-[#411600] transition-colors hover:border-[#C13329] hover:text-[#C13329]"
                            >
                                Browse the menu
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-y border-[#F0DCC2] bg-white/70 py-16">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {values.map((value) => (
                            <div
                                key={value.title}
                                className="rounded-2xl border border-[#F0DCC2] bg-white p-6 shadow-sm"
                            >
                                <span className="flex size-12 items-center justify-center rounded-xl bg-[#C13329]/10 text-[#C13329]">
                                    <value.icon
                                        className="size-6"
                                        aria-hidden
                                    />
                                </span>
                                <h3 className="mt-4 text-lg font-bold text-[#2B1200]">
                                    {value.title}
                                </h3>
                                <p className="mt-2 text-sm leading-relaxed text-[#6B4A36]">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-3xl bg-[#4A0F0B] p-7 text-[#F8E8D8] lg:col-span-1">
                        <MapPin className="size-7 text-[#FFD60A]" aria-hidden />
                        <h2 className="mt-4 text-xl font-extrabold text-white">
                            Where we deliver
                        </h2>
                        <p className="mt-3 text-sm leading-relaxed text-[#D8B5A8]">
                            {site.service_area} Not sure if we reach your area?
                            Send us your venue and we will confirm right away.
                        </p>
                        <p className="mt-4 text-sm font-semibold text-[#FFD60A]">
                            {site.address}
                        </p>
                    </div>

                    <div className="rounded-3xl border border-[#F0DCC2] bg-white p-7 lg:col-span-2">
                        <div className="flex items-center gap-3">
                            <span className="flex size-11 items-center justify-center rounded-xl bg-[#FFD60A] text-[#411600]">
                                <CalendarClock className="size-5" aria-hidden />
                            </span>
                            <h2 className="text-xl font-extrabold text-[#2B1200]">
                                Booking at a glance
                            </h2>
                        </div>
                        <div className="mt-6">
                            <div>
                                <p className="text-xs font-bold tracking-[0.14em] text-[#8A6A55] uppercase">
                                    Follow along
                                </p>
                                <a
                                    href={site.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-[#C13329] hover:text-[#A62A21]"
                                >
                                    <Sparkles className="size-4" aria-hidden />
                                    Facebook page
                                </a>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-3 border-t border-[#F5E5D2] pt-6">
                            <Link
                                href={contact()}
                                className="inline-flex h-10 items-center rounded-full bg-[#C13329] px-5 text-sm font-bold text-white transition-colors hover:bg-[#A62A21]"
                            >
                                Get a quote
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
