import { Hero } from '@/components/sections/Hero';
import { Features } from '@/components/sections/Features';
import { About } from '@/components/sections/About';
import { HybridMetroMap } from '@/components/sections/HybridMetroMap';
import { Footer } from '@/components/sections/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { HealthPing } from '@/components/HealthPing';
import { GuestAccessPopup } from '@/components/GuestAccessPopup';

export default function HomePage() {
  return (
    <>
      <HealthPing />
      <GuestAccessPopup />
      <Navbar />
      <Hero />
      <Features />
      <About />
        <HybridMetroMap />
      <Footer />
    </>
  );
}
