import CTASection from "@/components/home/CTASection";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import HeroSection from "@/components/home/HeroSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import React from "react";

const Index = () => {
  return (
    <>
      <HeroSection />
      <FeaturedEvents />
      <TestimonialsSection />
      <CTASection />
    </>
  );
};

export default Index;
