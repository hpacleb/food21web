import type { Auth } from '@/types/auth';
import type { SeoProps, SiteConfig } from '@/types/site';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }

    interface HTMLAttributes<T> {
        'head-key'?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            site: SiteConfig;
            seo: SeoProps;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
