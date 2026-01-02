"use client";
import { useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Image as ImageIcon,
  Video,
  Upload,
  Grid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { galleryItems } from "@/data/mockData";
import { toast } from "sonner";

export default function AdminMedia() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filter, setFilter] = useState("all");

  const filteredItems = galleryItems.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || item.type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id) => {
    toast.success({
      title: "Media Deleted",
      description: "The media item has been removed successfully.",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            Media Library
          </h1>
          <p className="text-muted-foreground">Manage images and videos</p>
        </div>
        <Button variant="hero">
          <Upload className="w-4 h-4" />
          Upload Media
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {[
              { key: "all", label: "All" },
              { key: "image", label: "Images" },
              { key: "video", label: "Videos" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filter === key
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-all ${
              viewMode === "grid" ? "bg-background shadow-sm" : ""
            }`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-all ${
              viewMode === "list" ? "bg-background shadow-sm" : ""
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Media Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group bg-card rounded-xl overflow-hidden shadow-soft border border-border/50"
            >
              <div className="aspect-square bg-muted relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
                      <Video className="w-5 h-5 text-primary-foreground" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-white/20 hover:bg-destructive/80 text-white"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute top-2 right-2">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                      item.type === "video"
                        ? "bg-destructive/80"
                        : "bg-accent/80"
                    } text-white`}
                  >
                    {item.type === "video" ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium truncate">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-soft border border-border/50 divide-y divide-border">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
            >
              <div className="w-16 h-16 rounded-lg bg-muted relative overflow-hidden shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="w-6 h-6 text-primary/50" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.title}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {item.type}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(item.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* YouTube Links */}
      <div className="bg-card rounded-xl shadow-soft border border-border/50">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">
              YouTube Videos
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage embedded YouTube videos
            </p>
          </div>
          <Button variant="outline">
            <Plus className="w-4 h-4" />
            Add YouTube URL
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {galleryItems
            .filter((item) => item.type === "video")
            .map((video) => (
              <div key={video.id} className="group">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                  <iframe
                    src={video.url}
                    className="w-full h-full"
                    allowFullScreen
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm font-medium truncate">{video.title}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(video.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
