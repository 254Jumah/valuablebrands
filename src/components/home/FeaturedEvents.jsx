"use client";
import React from "react";

import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { events } from "@/data/mockData";
import { motion } from "framer-motion";
import Link from "next/link";

// Update these imports to use the public folder paths
const eventImages = [
  "/assets/event-networking.jpg",
  "/assets/award-trophy.jpg",
  "/assets/event-speaker.jpg",
];

export const FeaturedEvents = () => {
  const featuredEvents = events.filter((e) => e.featured).slice(0, 3);

  return (
    <section className="py-20 lg:py-32 bg-background">
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
            Upcoming Events
          </Badge>
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Featured <span className="text-primary">Events</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
            Join us at our upcoming events designed to inspire, connect, and
            celebrate the best of Kenyas business community.
          </p>
        </motion.div>

        {/* Events Grid */}
        <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Card className="group overflow-hidden border-border/50 transition-all duration-500 hover:border-accent/50 hover:shadow-elevated h-full flex flex-col">
                <CardHeader className="p-0">
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <motion.img
                      src={eventImages[index] || "/assets/event-networking.jpg"}
                      alt={event.title}
                      className="h-full w-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Badge className="absolute right-4 top-4 bg-accent text-accent-foreground font-medium">
                      {event.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  <h3 className="mb-3 font-display text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                    {event.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {event.description}
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-accent" />
                      <span>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Link href={`/events/${event.id}`} className="w-full">
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300"
                    >
                      Learn More
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Link href="/events">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-primary font-semibold px-8 shadow-gold"
            >
              View All Events
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
