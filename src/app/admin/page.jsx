"use client";
import {
  Calendar,
  Award,
  Vote,
  BookOpen,
  Users,
  TrendingUp,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  dashboardStats,
  events,
  blogPosts,
  awardCategories,
} from "@/data/mockData";
import Link from "next/link";

export default function AdminDashboard() {
  const stats = [
    {
      label: "Total Events",
      value: dashboardStats.totalEvents,
      change: "+3 this month",
      trend: "up",
      icon: Calendar,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "Nominations",
      value: dashboardStats.totalNominations,
      change: "+24 this week",
      trend: "up",
      icon: Award,
      color: "bg-secondary/10 text-secondary",
    },
    {
      label: "Total Votes",
      value: dashboardStats.totalVotes.toLocaleString(),
      change: "+892 today",
      trend: "up",
      icon: Vote,
      color: "bg-accent/10 text-accent",
    },
    {
      label: "Blog Posts",
      value: dashboardStats.totalBlogs,
      change: "+2 this week",
      trend: "up",
      icon: BookOpen,
      color: "bg-destructive/10 text-destructive",
    },
  ];

  const recentVotes = awardCategories
    .flatMap((cat) =>
      cat.nominations.map((nom) => ({ ...nom, category: cat.name }))
    )
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Heres an overview of your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-card rounded-xl p-6 shadow-soft border border-border/50"
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
              <span
                className={`flex items-center gap-1 text-sm ${
                  stat.trend === "up" ? "text-accent" : "text-destructive"
                }`}
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {stat.change}
              </span>
            </div>
            <div className="font-display text-3xl font-bold mb-1">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Events */}
        <div className="lg:col-span-2 bg-card rounded-xl shadow-soft border border-border/50">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">
              Upcoming Events
            </h2>
            <Link href="/admin/events">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {events.slice(0, 4).map((event) => (
              <div
                key={event.id}
                className="p-6 flex items-center gap-4 hover:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString("en-KE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    event.featured
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {event.category}
                </span>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Top Voted */}
        <div className="bg-card rounded-xl shadow-soft border border-border/50">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Top Voted</h2>
            <Link href="/admin/votes">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentVotes.map((nom, i) => (
              <div key={nom.id} className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full gradient-gold flex items-center justify-center text-sm font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">
                    {nom.brandName}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {nom.category}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {nom.votes}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Blog Posts */}
      <div className="bg-card rounded-xl shadow-soft border border-border/50">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            Recent Blog Posts
          </h2>
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {blogPosts.slice(0, 3).map((post) => (
            <div key={post.id} className="group">
              <div className="aspect-video bg-muted rounded-lg mb-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                {new Date(post.date).toLocaleDateString("en-KE", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
              <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 text-primary-foreground">
          <Users className="w-8 h-8 mb-4 opacity-80" />
          <div className="font-display text-3xl font-bold">
            {dashboardStats.registeredUsers.toLocaleString()}
          </div>
          <div className="text-sm opacity-80">Registered Users</div>
        </div>
        <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-xl p-6 text-secondary-foreground">
          <Eye className="w-8 h-8 mb-4 opacity-80" />
          <div className="font-display text-3xl font-bold">
            {dashboardStats.monthlyVisitors.toLocaleString()}
          </div>
          <div className="text-sm opacity-80">Monthly Visitors</div>
        </div>
        <div className="bg-gradient-to-br from-accent to-accent/80 rounded-xl p-6 text-accent-foreground">
          <Award className="w-8 h-8 mb-4 opacity-80" />
          <div className="font-display text-3xl font-bold">
            {dashboardStats.activeCategories}
          </div>
          <div className="text-sm opacity-80">Active Categories</div>
        </div>
        <div className="bg-gradient-to-br from-foreground to-foreground/80 rounded-xl p-6 text-background">
          <TrendingUp className="w-8 h-8 mb-4 opacity-80" />
          <div className="font-display text-3xl font-bold">
            {dashboardStats.upcomingEvents}
          </div>
          <div className="text-sm opacity-80">Upcoming Events</div>
        </div>
      </div>
    </div>
  );
}
