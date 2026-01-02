import React from "react";
import { Calendar, Trophy, FileText, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    title: "Total Events",
    value: "24",
    change: "+3 this month",
    icon: Calendar,
    color: "bg-primary",
  },
  {
    title: "Nominations",
    value: "156",
    change: "+12 this week",
    icon: Trophy,
    color: "bg-accent",
  },
  {
    title: "Total Votes",
    value: "2,847",
    change: "+234 today",
    icon: Users,
    color: "bg-primary",
  },
  {
    title: "Blog Posts",
    value: "48",
    change: "+2 this week",
    icon: FileText,
    color: "bg-accent",
  },
];

const recentActivities = [
  {
    action: "New nomination received",
    category: "Best Emerging Brand",
    time: "5 mins ago",
  },
  {
    action: "Event published",
    category: "SME Excellence Awards 2024",
    time: "1 hour ago",
  },
  {
    action: "Blog post updated",
    category: "Digital Economy Trends",
    time: "3 hours ago",
  },
  {
    action: "50 new votes recorded",
    category: "Innovation Award",
    time: "6 hours ago",
  },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back! Heres whats happening.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-primary-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-display text-2xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-lg">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {activity.action}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.category}
                  </p>
                </div>
                <Badge variant="secondary">{activity.time}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
