import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['700', '900'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500'],
});

export const metadata = {
  title: 'SafeHer — Women Safety App',
  description: 'Real-time SOS alerts, trusted contacts, and GPS tracking for women safety in Bangladesh.',
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="en" 
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${dmSans.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}