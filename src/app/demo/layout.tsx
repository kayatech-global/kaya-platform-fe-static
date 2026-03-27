import { Inter } from 'next/font/google';
import '../globals.css';
import 'remixicon/fonts/remixicon.css';

const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-inter',
});

export const metadata = {
    title: 'Tool Executor Demo | KAYA AI Platform',
};

export default function DemoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={`${inter.variable} dark`}>
            <body className="dark bg-gray-900">{children}</body>
        </html>
    );
}
