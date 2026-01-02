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
      {/* Background Image with Greenish Frozen Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/assets/hero-event.jpg"
          alt="Valuable Brands Event"
          fill
          className="w-full h-full object-cover"
          priority
          sizes="100vw"
        />
        {/* Greenish Frozen Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-jungle-green/95 via-jungle-green-dark/90 to-jungle-green/85" />
        {/* Frosted Glass Effect */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        {/* Additional green tint for better text contrast */}
        <div className="absolute inset-0 bg-jungle-green/30 mix-blend-multiply" />
        {/* Subtle vignette effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
        {/* Frozen ice/snow effect texture - using CSS variables */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTAwJyBoZWlnaHQ9JzEwMCcgdmlld0JveD0nMCAwIDEwMCAxMDAnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHBhdGggZD0nTTExIDE4YzMuODY2IDAgNy0zLjEzNCA3LTdzLTMuMTM0LTctNy03LTcgMy4xMzQtNyA3IDMuMTM0IDcgNyA3em00OCAyNWMzLjg2NiAwIDctMy4xMzQgNy03cy0zLjEzNC03LTctNy03IDMuMTM0LTcgNyAzLjEzNCA3IDcgN3ptLTQzLTdjMS42NTcgMCAzLTEuMzQzIDMtM3MtMS4zNDMtMy0zLTMtMyAxLjM0My0zIDMgMS4zNDMgMyAzIDN6bTYzIDMxYzEuNjU3IDAgMy0xLjM0MyAzLTNzLTEuMzQzLTMtMy0zLTMgMS4zNDMtMyAzIDEuMzQzIDMgMyAzek0zNCA5MGMxLjY1NyAwIDMtMS4zNDMgMy0zcy0xLjM0My0zLTMtMy0zIDEuMzQzLTMgMyAxLjM0MyAzIDMgM3ptNTYtNzZjMS42NTcgMCAzLTEuMzQzIDMtM3MtMS4zNDMtMy0zLTMtMyAxLjM0My0zIDMgMS4zNDMgMyAzIDN6TTEyIDg2YzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMjgtNjVjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0yMy0xMWMyLjc2IDAgNS0yLjI0IDUtNXMtMi4yNC01LTUtNS01IDIuMjQtNSA1IDIuMjQgNSA1IDV6bS02IDYwYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMjkgMjJjMi43NiAwIDUtMi4yNCA1LTVzLTIuMjQtNS01LTUtNSAyLjI0LTUgNSAyLjI0IDUgNSA1ek0zMiA2M2MyLjc2IDAgNS0yLjI0IDUtNXMtMi4yNC01LTUtNS01IDIuMjQtNSA1IDIuMjQgNSA1IDV6bTU3LTEzYzIuNzYgMCA1LTIuMjQgNS01cy0yLjI0LTUtNS01LTUgMi4yNC01IDUgMi4yNCA1IDUgNXptLTktMjFjMS4xMDUgMCAyLS44OTUgMi0ycy0uODk1LTItMi0yLTIgLjg5NS0yIDIgLjg5NSAyIDIgMnpNNjAgOTFjMS4xMDUgMCAyLS44OTUgMi0ycy0uODk1LTItMi0yLTIgLjg5NS0yIDIgLjg5NSAyIDIgMnpNMzUgNDFjMS4xMDUgMCAyLS44OTUgMi0ycy0uODk1LTItMi0yLTIgLjg5NS0yIDIgLjg5NSAyIDIgMnpNMTIgNjBjMS4xMDUgMCAyLS44OTUgMi0ycy0uODk1LTItMi0yLTIgLjg5NS0yIDIgLjg5NSAyIDIgMnonIGZpbGw9JyNmZmZmZmYnIGZpbGwtb3BhY2l0eT0nMC40JyBmaWxsLXJ1bGU9J2V2ZW5vZGQnLz48L3N2Zz4=')] bg-[length:200px]" />
      </div>

      {/* Animated Decorative Elements - Adjusted for green theme */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -right-40 -top-40 w-96 h-96 rounded-full bg-gradient-to-br from-gold/10 via-transparent to-gold-light/5 blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.08, 0.12, 0.08],
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-jungle-green-light/20 via-transparent to-gold/10 blur-3xl"
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
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gradient-to-r from-gold/10 to-transparent px-5 py-2.5 text-sm text-white backdrop-blur-md shadow-gold/20"
            >
              <Award className="h-4 w-4 text-gold" />
              <span className="font-medium">
                Kenya&apos;s Premier Event Company
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="mb-6 font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              Celebrating{" "}
              <span className="text-green-600 bg-clip-text  bg-gradient-to-r from-gold via-gold-light to-gold">
                Valuable Brands
              </span>{" "}
              Across Kenya
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mb-10 text-lg text-white/95 lg:text-xl max-w-xl mx-auto lg:mx-0 backdrop-blur-sm px-2 py-1 rounded-lg bg-white/5"
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
                  className="w-full sm:w-auto bg-gradient-to-r from-gold via-gold-light to-gold hover:from-gold-light hover:to-gold text-jungle-green-dark font-bold px-8 py-6 text-lg shadow-lg shadow-gold/30 hover:shadow-gold/50 transition-all duration-300"
                >
                  Explore Events
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Link href="/awards">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-white/80 text-white hover:bg-white/20 hover:text-white px-8 py-6 text-lg backdrop-blur-sm hover:border-gold transition-all duration-300"
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
                className="group rounded-2xl border border-white/30 bg-gradient-to-br from-white/15 to-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:bg-gradient-to-br hover:from-white/25 hover:to-white/15 hover:border-gold/50 hover:shadow-gold/20 hover:shadow-lg"
              >
                <motion.div
                  whileHover={{ rotate: 10 }}
                  className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-gold-light/10 transition-colors group-hover:from-gold/30 group-hover:to-gold-light/20"
                >
                  <stat.icon className="h-6 w-6 text-gold" />
                </motion.div>
                <p className="font-display text-3xl font-bold text-white lg:text-4xl">
                  {stat.value}
                </p>
                <p className="text-sm text-white/90">{stat.label}</p>
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
            className="flex flex-col items-center gap-2 text-white/80"
          >
            <span className="text-xs uppercase tracking-widest backdrop-blur-sm bg-white/10 px-3 py-1 rounded-full">
              Scroll to explore
            </span>
            <div className="h-12 w-6 rounded-full border border-gold/40 bg-white/5 backdrop-blur-sm p-1">
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-gradient-to-b from-gold to-gold-light"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
