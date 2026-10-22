import { redirect } from "next/navigation";
import { Navigation } from "@/components/landing/navigation";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { RoomSection } from "@/components/landing/room-section";
import { SecuritySection } from "@/components/landing/security-section";
import { CtaSection } from "@/components/landing/cta-section";
import { FooterSection } from "@/components/landing/footer-section";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Older links such as /?dataset=discord-replay pointed at the operator app.
  const { dataset } = await searchParams;
  if (typeof dataset === "string") redirect(`/app?dataset=${encodeURIComponent(dataset)}`);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <RoomSection />
      <SecuritySection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
