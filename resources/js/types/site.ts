export type SiteHours = {
    days: string;
    time: string;
};

export type SitePhone = {
    label: string;
    number: string;
};

export type SiteStat = {
    value: string;
    label: string;
};

export type GalleryImage = {
    src: string;
    caption: string;
    tag: string;
};

export type SeoProps = {
    title: string;
    description: string;
    canonical: string;
    image: string | null;
    json_ld: Record<string, unknown> | null;
};

export type SiteConfig = {
    name: string;
    short_name: string;
    tagline: string;
    description: string;
    logo: string;
    hero_image: string;
    phone: string;
    phones: SitePhone[];
    quote: {
        viber: string;
        email: string;
    };
    delivery: {
        landlines: string[];
    };
    email: string;
    address: string;
    service_area: string;
    facebook: string;
    instagram: string | null;
    hours: SiteHours[];
    stats: SiteStat[];
    event_types: string[];
    gallery: GalleryImage[];
};

export type MenuItem = {
    name: string;
    description: string;
    price: string;
};

export type MenuCategory = {
    name: string;
    description: string;
    items: MenuItem[];
};

export type MenuPrice = {
    id: number;
    key: string;
    label: string;
    group: string;
    price: string;
};

export type MenuConfig = {
    currency: string;
    categories: MenuCategory[];
};

export type Inquiry = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    event_type: string;
    event_date: string | null;
    guests: number | null;
    message: string | null;
    status: 'new' | 'contacted' | 'booked' | 'closed';
    created_at: string;
    updated_at: string;
};
