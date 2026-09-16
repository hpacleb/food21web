import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Facebook, Menu as MenuIcon, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn } from '@/lib/utils';
import { about, contact, gallery, home, menu, order } from '@/routes';

const navItems = [
    { title: 'Home', href: home() },
    { title: 'Menu', href: menu() },
    { title: 'Gallery', href: gallery() },
    { title: 'About', href: about() },
    { title: 'Order Delivery', href: order() },
];

export default function SiteHeader() {
    const { site } = usePage().props;
    const { isCurrentUrl } = useCurrentUrl();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            <div className="bg-[#4A0F0B] text-[#FFE9C7]">
                <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-1 px-4 py-2 text-xs font-medium sm:flex-row sm:px-6 lg:px-8">
                    <p className="flex items-center gap-2">
                        <Phone className="size-3.5" aria-hidden />
                        <a
                            href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}
                            className="hover:text-white"
                        >
                            {site.phone}
                        </a>
                        <span className="hidden text-[#D89A8E] sm:inline">
                            |
                        </span>
                        <span className="hidden sm:inline">{site.address}</span>
                    </p>
                    <a
                        href={site.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 hover:text-white"
                    >
                        <Facebook className="size-3.5" aria-hidden />
                        Follow us on Facebook
                    </a>
                </div>
            </div>

            <header className="sticky top-0 z-50 border-b border-[#F0DCC2] bg-[#FFF8EE]/95 backdrop-blur">
                <div className="mx-auto flex h-18 w-full max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                    <Link
                        href={home()}
                        prefetch
                        className="flex items-center gap-2.5"
                    >
                        <img
                            src={site.logo}
                            alt={`${site.name} logo`}
                            className="size-11 rounded-xl object-cover ring-2 ring-[#FFD60A]"
                        />
                        <span className="flex flex-col leading-none">
                            <span className="text-lg font-extrabold tracking-tight text-[#411600]">
                                Food
                                <span className="text-[#C13329]">21</span>
                            </span>
                            <span className="mt-0.5 text-[10px] font-semibold tracking-[0.18em] text-[#8A5A3B] uppercase">
                                Catering &amp; Delivery
                            </span>
                        </span>
                    </Link>

                    <nav className="ml-6 hidden items-center gap-1 lg:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={cn(
                                    'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                                    isCurrentUrl(item.href)
                                        ? 'bg-[#C13329] text-white'
                                        : 'text-[#5C3A28] hover:bg-[#F7E7CF] hover:text-[#2B1200]',
                                )}
                            >
                                {item.title}
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        <a
                            href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}
                            className="hidden items-center gap-2 rounded-full border border-[#E7C9A6] px-4 py-2 text-sm font-semibold text-[#5C3A28] transition-colors hover:border-[#C13329] hover:text-[#C13329] xl:flex"
                        >
                            <Phone className="size-4" aria-hidden />
                            {site.phone}
                        </a>
                        <Button
                            asChild
                            className="hidden bg-[#C13329] text-white shadow-sm hover:bg-[#A62A21] sm:inline-flex"
                        >
                            <Link href={contact()}>Get a quote</Link>
                        </Button>

                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="border-[#E7C9A6] bg-transparent text-[#411600] hover:bg-[#F7E7CF] lg:hidden"
                                >
                                    <MenuIcon className="size-5" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="w-80 border-[#F0DCC2] bg-[#FFF8EE]"
                            >
                                <SheetHeader className="border-b border-[#F0DCC2] pb-4">
                                    <SheetTitle className="flex items-center gap-2.5 text-left">
                                        <img
                                            src={site.logo}
                                            alt={`${site.name} logo`}
                                            className="size-10 rounded-lg object-cover ring-2 ring-[#FFD60A]"
                                        />
                                        <span className="flex flex-col leading-none">
                                            <span className="text-base font-extrabold text-[#411600]">
                                                Food
                                                <span className="text-[#C13329]">
                                                    21
                                                </span>
                                            </span>
                                            <span className="mt-0.5 text-[9px] font-semibold tracking-[0.18em] text-[#8A5A3B] uppercase">
                                                Catering &amp; Delivery
                                            </span>
                                        </span>
                                    </SheetTitle>
                                </SheetHeader>

                                <nav className="flex flex-col gap-1 px-4">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={cn(
                                                'rounded-lg px-4 py-3 text-sm font-semibold',
                                                isCurrentUrl(item.href)
                                                    ? 'bg-[#C13329] text-white'
                                                    : 'text-[#5C3A28] hover:bg-[#F7E7CF]',
                                            )}
                                        >
                                            {item.title}
                                        </Link>
                                    ))}
                                </nav>

                                <div className="mt-auto space-y-3 border-t border-[#F0DCC2] p-4">
                                    <Button
                                        asChild
                                        className="w-full bg-[#C13329] text-white hover:bg-[#A62A21]"
                                    >
                                        <Link
                                            href={contact()}
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            Get a quote
                                        </Link>
                                    </Button>
                                    <a
                                        href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}
                                        className="flex items-center justify-center gap-2 text-sm font-semibold text-[#5C3A28]"
                                    >
                                        <Phone className="size-4" aria-hidden />
                                        {site.phone}
                                    </a>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>
        </>
    );
}
