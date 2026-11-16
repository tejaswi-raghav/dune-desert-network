import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'DUNE — Desert Unified Network for Emergencies', description: 'No signal. No internet. No one left unheard. Explore a deterministic desert emergency network simulator.', manifest: '/manifest.webmanifest' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
