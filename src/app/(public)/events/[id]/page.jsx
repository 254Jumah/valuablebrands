'use client';
import React from 'react';

import { Calendar, MapPin, ArrowLeft, Play, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { events } from '@/data/mockData';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const EventDetail = () => {
  const { id } = useParams();
  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="mb-4 font-display text-3xl font-bold">
          Event Not Found
        </h1>
        <Link href="/events">
          <Button>Back to Events</Button>
        </Link>
      </div>
    );
  }

  const relatedEvents = events
    .filter((e) => e.category === event.category && e.id !== event.id)
    .slice(0, 2);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <Link
            href="/events"
            className="mb-6 inline-flex items-center gap-2 text-primary-foreground/80 hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <Badge className="mb-4 bg-accent text-accent-foreground">
                {event.category}
              </Badge>
              <h1 className="mb-4 font-display text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                {event.title}
              </h1>
              <div className="mb-6 flex flex-wrap gap-4 text-primary-foreground/80">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  <span>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  <span>{event.location}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-yellow-500 text-white hover:bg-yellow-600">
                  Register Now
                </Button>

                <Button className="border border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white flex gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Event
                </Button>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
              <img
                src={event.image}
                alt={event.title}
                className="h-full w-full object-cover"
              />
              {event.youtubeUrl && (
                <a
                  href={event.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-foreground/20 transition-colors hover:bg-foreground/40"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                    <Play className="h-8 w-8 text-accent-foreground" />
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="mb-4 font-display text-2xl font-bold text-foreground">
                About This Event
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <p>{event.description}</p>
                <p>
                  Join us for an unforgettable experience that brings together
                  industry leaders, innovators, and visionaries. This event
                  promises insightful discussions, valuable networking
                  opportunities, and recognition of outstanding achievements.
                </p>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  What to Expect
                </h3>
                <ul>
                  <li>Keynote speeches from industry experts</li>
                  <li>Panel discussions on emerging trends</li>
                  <li>Networking sessions with fellow professionals</li>
                  <li>Award presentations and recognition ceremonies</li>
                  <li>Exclusive insights and takeaways</li>
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
                    Event Details
                  </h3>
                  <dl className="space-y-4 text-sm">
                    <div>
                      <dt className="font-medium text-muted-foreground">
                        Date
                      </dt>
                      <dd className="text-foreground">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">
                        Location
                      </dt>
                      <dd className="text-foreground">{event.location}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">
                        Category
                      </dt>
                      <dd>
                        <Badge variant="outline">{event.category}</Badge>
                      </dd>
                    </div>
                  </dl>
                  <Button className="mt-6 w-full bg-yellow-500 text-white hover:bg-yellow-600">
                    Register Now
                  </Button>
                </CardContent>
              </Card>

              {relatedEvents.length > 0 && (
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
                      Related Events
                    </h3>
                    <div className="space-y-4">
                      {relatedEvents.map((related) => (
                        <Link
                          key={related.id}
                          href={`/events/${related.id}`}
                          className="block rounded-lg border border-border/50 p-3 transition-colors hover:border-accent/50 hover:bg-muted"
                        >
                          <h4 className="font-medium text-foreground">
                            {related.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(related.date).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              }
                            )}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EventDetail;
