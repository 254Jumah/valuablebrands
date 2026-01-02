"use client";
import React, { useState } from "react";
import { Award, Trophy, Vote, ThumbsUp, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { awardCategories } from "@/data/mockData";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Awards = () => {
  const [selectedCategory, setSelectedCategory] = useState(
    awardCategories[0].id
  );
  const [votes, setVotes] = useState({});

  const handleVote = (nominationId) => {
    setVotes((prev) => ({
      ...prev,
      [nominationId]: (prev[nominationId] || 0) + 1,
    }));
    toast.success({
      title: "Vote Recorded!",
      description: "Thank you for voting. Your voice matters!",
    });
  };

  const handleNominationSubmit = (e) => {
    e.preventDefault();
    toast.success({
      title: "Nomination Submitted!",
      description: "We'll review your nomination and get back to you soon.",
    });
  };

  const currentCategory = awardCategories.find(
    (c) => c.id === selectedCategory
  );

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-16 lg:py-24">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mb-4 border-accent/50 bg-accent/10 text-accent"
            >
              <Trophy className="mr-1 h-3 w-3" />
              Awards 2024
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold text-primary-foreground sm:text-5xl">
              Celebrate <span className="text-gradient-gold">Excellence</span>
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Nominate outstanding brands, vote for your favorites, and join us
              in recognizing Kenyas best businesses.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="vote" className="space-y-12">
            <TabsList className="mx-auto grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="vote" className="flex items-center gap-2">
                <Vote className="h-4 w-4" />
                Vote
              </TabsTrigger>
              <TabsTrigger value="nominate" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Nominate
              </TabsTrigger>
            </TabsList>

            {/* Voting Tab */}
            <TabsContent value="vote" className="space-y-8">
              <div className="text-center">
                <h2 className="mb-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
                  Vote for Your{" "}
                  <span className="text-primary">Favorite Brands</span>
                </h2>
                <p className="mx-auto max-w-2xl text-muted-foreground">
                  Browse the categories below and cast your vote for the brands
                  you believe deserve recognition.
                </p>
              </div>

              {/* Category Selection */}
              <div className="flex flex-wrap justify-center gap-2">
                {awardCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? "default" : "outline"
                    }
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* Nominations Grid */}
              {currentCategory && (
                <div>
                  <div className="mb-6 text-center">
                    <h3 className="font-display text-xl font-semibold text-foreground">
                      {currentCategory.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentCategory.description}
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {currentCategory.nominations.map((nomination) => (
                      <NominationCard
                        key={nomination.id}
                        nomination={nomination}
                        additionalVotes={votes[nomination.id] || 0}
                        onVote={() => handleVote(nomination.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Nomination Tab */}
            <TabsContent value="nominate">
              <div className="mx-auto max-w-2xl">
                <div className="mb-8 text-center">
                  <h2 className="mb-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
                    Submit a <span className="text-primary">Nomination</span>
                  </h2>
                  <p className="text-muted-foreground">
                    Know a brand that deserves recognition? Fill out the form
                    below to nominate them for our awards.
                  </p>
                </div>

                <Card className="border-border/50">
                  <CardContent className="p-6 lg:p-8">
                    <form
                      onSubmit={handleNominationSubmit}
                      className="space-y-6"
                    >
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="brandName">Brand Name *</Label>
                          <Input
                            id="brandName"
                            placeholder="Enter brand name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category">Award Category *</Label>
                          <select
                            id="category"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            required
                          >
                            <option value="">Select a category</option>
                            {awardCategories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="contactName">Your Name *</Label>
                          <Input
                            id="contactName"
                            placeholder="Your full name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactEmail">Your Email *</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            placeholder="you@example.com"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reason">
                          Why should this brand win? *
                        </Label>
                        <Textarea
                          id="reason"
                          placeholder="Tell us why this brand deserves recognition..."
                          rows={5}
                          required
                        />
                      </div>
                      <Button type="submit" variant="gold" className="w-full">
                        <Send className="h-4 w-4" />
                        Submit Nomination
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </>
  );
};

const NominationCard = ({ nomination, additionalVotes, onVote }) => {
  const totalVotes = nomination.votes + additionalVotes;

  return (
    <Card className="group overflow-hidden border-border/50 transition-all duration-300 hover:border-accent/50 hover:shadow-elevated">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={nomination.image}
            alt={nomination.brandName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <h4 className="mb-2 font-display text-lg font-semibold text-foreground">
          {nomination.brandName}
        </h4>
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {nomination.description}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ThumbsUp className="h-4 w-4 text-accent" />
          <span className="font-medium">{totalVotes} votes</span>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button
          onClick={onVote}
          className="btn w-full bg-yellow-500 border-yellow-500 text-white hover:bg-yellow-600 flex gap-2"
        >
          <Vote className="h-4 w-4" />
          Vote for this Brand
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Awards;
