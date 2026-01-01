import CTASection from "@/components/home/CTASection";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import HeroSection from "@/components/home/HeroSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import React from "react";

const Index = () => {
  return (
    <>
      <Header />
      <HeroSection />
      <FeaturedEvents />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </>
  );
};

export default Index;
