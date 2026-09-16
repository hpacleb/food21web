import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Camera, ChevronRight } from 'lucide-react';
import Seo from '@/components/seo';
import { contact } from '@/routes';
import type { GalleryImage } from '@/types';

type Props = {
    gallery: GalleryImage[];
};

export default function Gallery({ gallery }: Props) {
    const [filter, setFilter] = useState<string>('All');

    const tags = ['All', ...new Set(gallery.map((image) => image.tag))];
    const images =
        filter === 'All'
            ? gallery
            : gallery.filter((image) => image.tag === filter);

    return (
        <>
            <Seo />

            <section className="border-b border-[#F0DCC2] bg-white/70">
                <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                    <p className="text-xs font-bold tracking-[0.18em] text-[#A62A21] uppercase">
                        Gallery
                    </p>
                    <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-[#2B1200] sm:text-5xl">
                        Straight from our kitchen and events
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#6B4A36] sm:text-lg">
                        Every dish is cooked the day it is served. Here are some
                        of the plates and setups we have delivered recently.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => setFilter(tag)}
                                className={
                                    filter === tag
                                        ? 'rounded-full bg-[#C13329] px-5 py-2 text-sm font-bold text-white'
                                        : 'rounded-full border border-[#E7C9A6] px-5 py-2 text-sm font-bold text-[#5C3A28] transition-colors hover:border-[#C13329] hover:text-[#C13329]'
                                }
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {images.map((image) => (
                        <figure
                            key={image.src}
                            className="group relative overflow-hidden rounded-2xl border border-[#F0DCC2] bg-white shadow-sm"
                        >
                            <img
                                src={image.src}
                                alt={image.caption}
                                loading="lazy"
                                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#2B0D0A]/85 to-transparent p-4 pt-10">
                                <p className="text-sm font-bold text-white">
                                    {image.caption}
                                </p>
                                <p className="text-xs text-[#FFD9CE]">
                                    {image.tag}
                                </p>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </section>

            <section className="border-t border-[#F0DCC2] bg-[#4A0F0B] py-16 text-center">
                <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
                    <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#FFD60A] text-[#411600]">
                        <Camera className="size-6" aria-hidden />
                    </span>
                    <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-white">
                        Want your event on this page?
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl text-sm text-[#D8B5A8]">
                        Let us cook for your next celebration. Send us your date
                        and headcount and we will take it from there.
                    </p>
                    <Link
                        href={contact()}
                        className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-[#FFD60A] px-7 text-sm font-bold text-[#411600] transition-colors hover:bg-[#FFE45C]"
                    >
                        Get a quote
                        <ChevronRight className="size-4" aria-hidden />
                    </Link>
                </div>
            </section>
        </>
    );
}
