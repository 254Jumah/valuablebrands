"use client";
import React from "react";

import { ArrowRight, Award, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
      {/* Animated Decorative Elements */}
      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 12, repeat: Infinity }}
        className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -20, 0],
          y: [0, 30, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-white/10 blur-3xl"
      />

      {/* Floating Sparkles */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 text-accent/30"
      >
        <Sparkles className="h-8 w-8" />
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [360, 180, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/3 right-1/3 text-white/20"
      >
        <Sparkles className="h-6 w-6" />
      </motion.div>

      <div className="container relative mx-auto px-4">
        <div className="grid items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Nominate Section */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -5 }}
            className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-md lg:p-10 transition-all duration-300 hover:bg-white/15"
          >
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20"
            >
              <Award className="h-8 w-8 text-accent" />
            </motion.div>
            <h3 className="mb-4 font-display text-2xl font-bold text-white lg:text-3xl">
              Nominate a Brand
            </h3>
            <p className="mb-8 text-white/80 text-lg leading-relaxed">
              Know a brand that deserves recognition? Nominate them for our
              upcoming awards and help celebrate excellence in Kenyas business
              community.
            </p>
            <Link href="/awards">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-primary font-semibold group shadow-gold"
              >
                Submit Nomination
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-md lg:p-10 transition-all duration-300 hover:bg-white/15"
          >
            <motion.div
              whileHover={{ rotate: -10, scale: 1.1 }}
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/20"
            >
              <Send className="h-8 w-8 text-accent" />
            </motion.div>
            <h3 className="mb-4 font-display text-2xl font-bold text-white lg:text-3xl">
              Partner With Us
            </h3>
            <p className="mb-8 text-white/80 text-lg leading-relaxed">
              Looking to host an event or sponsor our programs? Get in touch
              with our team to discuss partnership opportunities.
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-shadow-green-600 hover:bg-white hover:text-primary font-semibold group"
              >
                Contact Us
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md"
        >
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { label: "Events This Year", value: "12+" },
              { label: "Partner Companies", value: "50+" },
              { label: "Award Categories", value: "8" },
              { label: "Media Coverage", value: "100+" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-3xl font-bold text-accent lg:text-4xl">
                  {stat.value}
                </p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
