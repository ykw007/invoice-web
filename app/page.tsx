import { MainLayout } from "@/components/layout/main-layout";
import { HeroSection } from "@/components/demo/hero-section";
import { FeatureCards } from "@/components/demo/feature-cards";
import { ComponentsShowcase } from "@/components/demo/components-showcase";
import { ColorPalette } from "@/components/demo/color-palette";
import { TypographyShowcase } from "@/components/demo/typography-showcase";

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <FeatureCards />
      <ComponentsShowcase />
      <ColorPalette />
      <TypographyShowcase />
    </MainLayout>
  );
}
