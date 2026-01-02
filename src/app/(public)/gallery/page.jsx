"use client";
import React, { useState } from "react";
import { Image, Play, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { galleryItems } from "@/data/mockData";

const Gallery = () => {
  const [filter, setFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = galleryItems.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  const selectedGalleryItem = galleryItems.find(
    (item) => item.id === selectedItem
  );

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mb-4 border-accent/50 bg-accent/10 text-accent"
            >
              Media Gallery
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold text-primary-foreground sm:text-5xl">
              Event <span className="text-gradient-gold">Highlights</span>
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Explore photos and videos from our past events. Relive the
              memorable moments and celebrations.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {/* Filter Buttons */}
          <div className="mb-12 flex justify-center gap-2">
            {[
              { value: "all", label: "All", icon: null },
              { value: "image", label: "Photos", icon: Image },
              { value: "video", label: "Videos", icon: Play },
            ].map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                onClick={() => setFilter(option.value)}
                className="flex items-center gap-2"
              >
                {option.icon && <option.icon className="h-4 w-4" />}
                {option.label}
              </Button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="group cursor-pointer overflow-hidden border-border/50 transition-all duration-300 hover:border-accent/50 hover:shadow-elevated"
                onClick={() => setSelectedItem(item.id)}
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="relative h-full w-full">
                      <img
                        src="/placeholder.svg"
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent transition-transform group-hover:scale-110">
                          <Play className="h-6 w-6 text-accent-foreground" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-foreground/80 to-transparent p-4">
                    <p className="font-medium text-background">{item.title}</p>
                    <p className="text-sm text-background/80">
                      {item.eventName}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-12 text-center">
              <Filter className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
                No items found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your filter criteria.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedItem && selectedGalleryItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-background hover:bg-background/20 hover:text-background"
            onClick={() => setSelectedItem(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <div
            className="max-h-[90vh] max-w-4xl overflow-hidden rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedGalleryItem.type === "image" ? (
              <img
                src={selectedGalleryItem.url}
                alt={selectedGalleryItem.title}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="aspect-video w-full">
                <iframe
                  src={selectedGalleryItem.url}
                  title={selectedGalleryItem.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
            <div className="bg-card p-4">
              <p className="font-display font-semibold text-foreground">
                {selectedGalleryItem.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedGalleryItem.eventName}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Gallery;
