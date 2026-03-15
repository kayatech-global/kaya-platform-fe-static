import { Inter } from 'next/font/google';

import { ThemeProvider } from '@/theme';
import { AuthProvider, QueryProvider } from '@/context';
import { AIAssistant } from '@/components/organisms/ai-assistant';
import './globals.css';
import 'remixicon/fonts/remixicon.css';
import { AppContextProvider } from '@/context/app-context';
import { Toaster } from '@/components/atoms/sonner';

const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-inter',
});

export const metadata = {
    title: 'KAYA AI Platform',
};

const RootLayout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    return (
        <html lang="en" className={inter.variable}>
            <head></head>
            <body>
                <QueryProvider dehydratedState={undefined}>
                    <AppContextProvider>
                        <AuthProvider>
                            <ThemeProvider defaultTheme="light">
                                {children}
                                <AIAssistant />
                            </ThemeProvider>
                        </AuthProvider>
                    </AppContextProvider>
                </QueryProvider>
                <Toaster />
            </body>
        </html>
    );
};

export default RootLayout;
