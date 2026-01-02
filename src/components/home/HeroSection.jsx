"use client";
import React from "react";
import { ArrowRight, Play, Award, Star, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stats } from "@/data/mockData";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const statsData = [
  { icon: Award, value: `${stats.eventsHosted}+`, label: "Events Hosted" },
  {
    icon: Star,
    value: `${stats.brandsRecognized}+`,
    label: "Brands Recognized",
  },
  {
    icon: Users,
    value: `${(stats.attendees / 1000).toFixed(0)}K+`,
    label: "Attendees",
  },
  {
    icon: Calendar,
    value: `${stats.yearsExperience}+`,
    label: "Years Experience",
  },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/assets/hero-event.jpg"
          alt="Valuable Brands Event"
          fill
          className="w-full h-full object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0  from-primary/95 via-primary/85 to-primary/70" />
        <div className="absolute inset-0  from-primary/80 via-transparent to-transparent" />
      </div>

      {/* Animated Decorative Elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -right-40 -top-40  rounded-full bg-accent/20 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute -bottom-40 -left-40   rounded-full bg-white/10 blur-3xl"
      />

      <div className="container relative mx-auto px-4 py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.div
              variants={itemVariants}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm text-white backdrop-blur-sm"
            >
              <Award className="h-4 w-4 text-accent" />
              <span>Kenya&apos;s Premier Event Company</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-6 font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Celebrating{" "}
              <span className="text-gradient-gold">Valuable Brands</span> Across
              Kenya
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mb-10 text-lg text-white/90 lg:text-xl max-w-xl mx-auto lg:mx-0"
            >
              We organize premium events that recognize, celebrate, and empower
              SMEs and outstanding brands. From award ceremonies to innovation
              summits, we create unforgettable experiences.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link href="/events">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-primary font-semibold px-8 py-6 text-lg shadow-gold"
                >
                  Explore Events
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/awards">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-white text-black hover:bg-white hover:text-primary px-8 py-6 text-lg"
                >
                  <Play className="h-5 w-5 mr-2" />
                  View Awards
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-2 gap-4 lg:gap-6"
          >
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md transition-all duration-300 hover:bg-white/20 hover:border-accent/50"
              >
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 transition-colors group-hover:bg-accent/30"
                >
                  <stat.icon className="h-6 w-6 text-accent" />
                </motion.div>
                <p className="font-display text-3xl font-bold text-white lg:text-4xl">
                  {stat.value}
                </p>
                <p className="text-sm text-white/80">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-white/60"
          >
            <span className="text-xs uppercase tracking-widest">
              Scroll to explore
            </span>
            <div className="h-12 w-6 rounded-full border-2 border-white/30 p-1">
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-accent"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
