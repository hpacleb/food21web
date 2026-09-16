import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronRight, MapPin, UtensilsCrossed } from 'lucide-react';
import { contact, order } from '@/routes';
import type { MenuConfig } from '@/types';

type Props = {
    menu: MenuConfig;
};

export default function Menu({ menu }: Props) {
    const { site } = usePage().props;

    return (
        <>
            <Head title="Menu">
                <meta
                    name="description"
                    content={`Catering menu from ${site.name}. ${site.tagline}`}
                />
            </Head>

            <section className="border-b border-[#F0DCC2] bg-white/70">
                <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                    <p className="text-xs font-bold tracking-[0.18em] text-[#A62A21] uppercase">
                        Menu
                    </p>
                    <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-[#2B1200] sm:text-5xl">
                        Home-cooked dishes, built for a crowd
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#6B4A36] sm:text-lg">
                        Mix and match from our rotating menu or let us build a
                        custom spread for your event. Every order is cooked the
                        day it is served.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-[#5C3A28]">
                        <span className="flex items-center gap-2">
                            <MapPin
                                className="size-4 text-[#C13329]"
                                aria-hidden
                            />
                            {site.service_area}
                        </span>
                    </div>
                </div>
            </section>

            <section className="border-b border-[#F0DCC2] bg-white/70 py-16">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-12">
                        {menu.categories.map((category) => (
                            <div key={category.name}>
                                <div className="flex items-center gap-3">
                                    <span className="flex size-10 items-center justify-center rounded-xl bg-[#C13329]/10 text-[#C13329]">
                                        <UtensilsCrossed
                                            className="size-5"
                                            aria-hidden
                                        />
                                    </span>
                                    <div>
                                        <h2 className="text-2xl font-extrabold tracking-tight text-[#2B1200]">
                                            {category.name}
                                        </h2>
                                        <p className="text-sm text-[#8A6A55]">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-x-10 gap-y-5 md:grid-cols-2">
                                    {category.items.map((item) => (
                                        <div
                                            key={item.name}
                                            className="flex items-start justify-between gap-4 border-b border-dashed border-[#E7C9A6] pb-4"
                                        >
                                            <div>
                                                <h3 className="text-sm font-bold text-[#2B1200]">
                                                    {item.name}
                                                </h3>
                                                <p className="mt-1 text-xs leading-relaxed text-[#8A6A55]">
                                                    {item.description}
                                                </p>
                                            </div>
                                            <span className="shrink-0 rounded-full bg-[#FFF3D6] px-3 py-1 text-xs font-bold text-[#A62A21]">
                                                {item.price}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center rounded-[2rem] bg-gradient-to-br from-[#C13329] to-[#8F1F18] px-6 py-12 text-center shadow-2xl shadow-[#C13329]/25 sm:px-12">
                    <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Hungry? We cook it fresh and bring it to you.
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#FFD9CE] sm:text-base">
                        Call our delivery lines for food delivery, or message us
                        on Viber or email for catering quotes.
                    </p>
                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            href={order()}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#FFD60A] px-7 text-sm font-bold text-[#411600] transition-colors hover:bg-[#FFE45C]"
                        >
                            Order for delivery
                            <ChevronRight className="size-4" aria-hidden />
                        </Link>
                        <Link
                            href={contact()}
                            className="inline-flex h-12 items-center justify-center rounded-full border-2 border-white/40 px-7 text-sm font-bold text-white transition-colors hover:border-white"
                        >
                            Get a catering quote
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
