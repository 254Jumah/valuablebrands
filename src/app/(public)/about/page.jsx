"use client";
import React from "react";
import { Award, Target, Users, Heart, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { stats } from "@/data/mockData";

const values = [
  {
    icon: Award,
    title: "Excellence",
    description:
      "We strive for the highest standards in everything we do, from event planning to execution.",
  },
  {
    icon: Target,
    title: "Impact",
    description:
      "Our events create lasting impressions and meaningful connections for businesses.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "We build bridges between SMEs, corporations, and the broader business ecosystem.",
  },
  {
    icon: Heart,
    title: "Integrity",
    description:
      "Transparency and honesty guide our relationships with partners and clients.",
  },
];

const milestones = [
  { year: "2016", event: "Valuable Brands founded in Nairobi" },
  { year: "2017", event: "First SME Excellence Awards ceremony" },
  { year: "2019", event: "Expanded to East African markets" },
  { year: "2021", event: "Launched virtual event platform" },
  { year: "2023", event: "Celebrated 100th successful event" },
  { year: "2024", event: "Introduced Innovation Summit series" },
];

const About = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mb-4 border-accent/50 bg-accent/10 text-accent"
            >
              About Us
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold text-primary-foreground sm:text-5xl lg:text-6xl">
              Empowering{" "}
              <span className="text-gradient-gold">Kenyan Brands</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 lg:text-xl">
              Since 2016, Valuable Brands has been at the forefront of
              recognizing and celebrating excellence in Kenyas business
              landscape.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge
                variant="outline"
                className="mb-4 border-accent text-accent"
              >
                Our Story
              </Badge>
              <h2 className="mb-6 font-display text-3xl font-bold text-foreground sm:text-4xl">
                Building a Legacy of{" "}
                <span className="text-primary">Recognition</span>
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Valuable Brands was founded with a simple yet powerful
                  mission: to shine a spotlight on the incredible businesses
                  that drive Kenyas economy forward.
                </p>
                <p>
                  What started as a small awards ceremony has grown into a
                  comprehensive events company that hosts conferences,
                  workshops, galas, and recognition programs throughout the
                  year.
                </p>
                <p>
                  Today, were proud to have recognized over 500 brands, hosted
                  more than 150 events, and connected thousands of business
                  leaders, entrepreneurs, and innovators.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: `${stats.eventsHosted}+`, label: "Events Hosted" },
                {
                  value: `${stats.brandsRecognized}+`,
                  label: "Brands Recognized",
                },
                {
                  value: `${(stats.attendees / 1000).toFixed(0)}K+`,
                  label: "Attendees",
                },
                {
                  value: `${stats.yearsExperience}+`,
                  label: "Years Experience",
                },
              ].map((stat, index) => (
                <Card key={index} className="border-border/50 text-center">
                  <CardContent className="p-6">
                    <p className="font-display text-3xl font-bold text-primary lg:text-4xl">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-secondary py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4 border-accent text-accent">
              Our Values
            </Badge>
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
              What <span className="text-primary">Drives Us</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Card
                key={index}
                className="border-border/50 bg-card transition-all duration-300 hover:border-accent/50 hover:shadow-elevated"
              >
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                    <value.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4 border-accent text-accent">
              Our Journey
            </Badge>
            <h2 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-4xl">
              Key <span className="text-primary">Milestones</span>
            </h2>
          </div>
          <div className="mx-auto max-w-2xl">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex gap-4 pb-8 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  {index !== milestones.length - 1 && (
                    <div className="mt-2 h-full w-0.5 bg-border" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="font-display text-lg font-bold text-primary">
                    {milestone.year}
                  </p>
                  <p className="text-muted-foreground">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
