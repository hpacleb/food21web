import { Link, usePage } from '@inertiajs/react';
import {
    Clock,
    Facebook,
    Mail,
    MapPin,
    Phone,
    UtensilsCrossed,
} from 'lucide-react';
import {
    about,
    contact,
    dashboard,
    gallery,
    home,
    login,
    menu,
    order,
} from '@/routes';

const exploreLinks = [
    { title: 'Home', href: home() },
    { title: 'Menu', href: menu() },
    { title: 'Gallery', href: gallery() },
    { title: 'About us', href: about() },
    { title: 'Order delivery', href: order() },
    { title: 'Get a quote', href: contact() },
];

export default function SiteFooter() {
    const { site, auth } = usePage().props;

    return (
        <footer className="bg-[#2B0D0A] text-[#F8E8D8]">
            <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                        <img
                            src={site.logo}
                            alt={`${site.name} logo`}
                            className="size-11 rounded-xl object-cover ring-2 ring-[#FFD60A]"
                        />
                        <span className="flex flex-col leading-none">
                            <span className="text-lg font-extrabold tracking-tight text-white">
                                Food
                                <span className="text-[#FFD60A]">21</span>
                            </span>
                            <span className="mt-0.5 text-[10px] font-semibold tracking-[0.18em] text-[#D8A08F] uppercase">
                                Catering &amp; Delivery
                            </span>
                        </span>
                    </div>
                    <p className="text-sm leading-relaxed text-[#D8B5A8]">
                        {site.description}
                    </p>
                    <a
                        href={site.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-[#C13329] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#A62A21]"
                    >
                        <Facebook className="size-4" aria-hidden />
                        Message us on Facebook
                    </a>
                </div>

                <div>
                    <h3 className="text-sm font-bold tracking-[0.14em] text-[#FFD60A] uppercase">
                        Explore
                    </h3>
                    <ul className="mt-4 space-y-2.5 text-sm">
                        {exploreLinks.map((link) => (
                            <li key={link.title}>
                                <Link
                                    href={link.href}
                                    className="text-[#E8C7B9] transition-colors hover:text-white"
                                >
                                    {link.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-bold tracking-[0.14em] text-[#FFD60A] uppercase">
                        Contact
                    </h3>
                    <ul className="mt-4 space-y-3 text-sm">
                        {site.phones.map((phone) => (
                            <li key={phone.number}>
                                <a
                                    href={`tel:${phone.number.replace(/[^+\d]/g, '')}`}
                                    className="flex items-start gap-2.5 text-[#E8C7B9] transition-colors hover:text-white"
                                >
                                    <Phone
                                        className="mt-0.5 size-4 shrink-0 text-[#FFD60A]"
                                        aria-hidden
                                    />
                                    <span>
                                        {phone.number}
                                        <span className="block text-xs text-[#B98A7C]">
                                            {phone.label}
                                        </span>
                                    </span>
                                </a>
                            </li>
                        ))}
                        <li>
                            <a
                                href={`mailto:${site.email}`}
                                className="flex items-center gap-2.5 text-[#E8C7B9] transition-colors hover:text-white"
                            >
                                <Mail
                                    className="size-4 shrink-0 text-[#FFD60A]"
                                    aria-hidden
                                />
                                {site.email}
                            </a>
                        </li>
                        <li className="flex items-start gap-2.5 text-[#E8C7B9]">
                            <MapPin
                                className="mt-0.5 size-4 shrink-0 text-[#FFD60A]"
                                aria-hidden
                            />
                            {site.address}
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-sm font-bold tracking-[0.14em] text-[#FFD60A] uppercase">
                        Serving hours
                    </h3>
                    <ul className="mt-4 space-y-2.5 text-sm">
                        {site.hours.map((entry) => (
                            <li
                                key={entry.days}
                                className="flex items-start justify-between gap-4 border-b border-white/10 pb-2.5"
                            >
                                <span className="flex items-center gap-2 text-[#E8C7B9]">
                                    <Clock
                                        className="size-4 shrink-0 text-[#FFD60A]"
                                        aria-hidden
                                    />
                                    {entry.days}
                                </span>
                                <span className="text-right font-medium text-white">
                                    {entry.time}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 flex items-start gap-2 text-xs text-[#B98A7C]">
                        <UtensilsCrossed
                            className="mt-0.5 size-3.5 shrink-0"
                            aria-hidden
                        />
                        {site.service_area}
                    </p>
                </div>
            </div>

            <div className="border-t border-white/10">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-[#B98A7C] sm:flex-row sm:px-6 lg:px-8">
                    <p>
                        &copy; {new Date().getFullYear()} {site.name}. All
                        rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link
                            href={auth.user ? dashboard() : login()}
                            className="font-semibold text-[#E8C7B9] transition-colors hover:text-white"
                        >
                            {auth.user ? 'Admin dashboard' : 'Admin login'}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
