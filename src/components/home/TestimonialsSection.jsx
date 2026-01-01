"use client";
import React from "react";
import { Quote, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { testimonials } from "@/data/mockData";
import { motion } from "framer-motion";

export default function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32 bg-secondary/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <Badge
            variant="outline"
            className="mb-4 border-accent text-accent px-4 py-1"
          >
            Testimonials
          </Badge>
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            What Our <span className="text-primary">Partners Say</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
            Hear from businesses and brands that have partnered with us to
            create memorable events and recognition programs.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Card className="group h-full border-border/50 bg-white transition-all duration-500 hover:border-accent/50 hover:shadow-elevated">
                <CardContent className="p-8">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-accent text-accent"
                      />
                    ))}
                  </div>

                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 group-hover:bg-accent/20 transition-colors">
                    <Quote className="h-6 w-6 text-primary group-hover:text-accent transition-colors" />
                  </div>

                  <blockquote className="mb-6 text-foreground/90 text-lg leading-relaxed">
                    {testimonial.quote}
                  </blockquote>

                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-white"
                    >
                      {testimonial.author.charAt(0)}
                    </motion.div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.author}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
