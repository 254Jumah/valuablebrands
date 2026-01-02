"use client";
import { useState } from "react";
import {
  Award,
  Vote,
  Trophy,
  ChevronRight,
  CheckCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { awardCategories } from "@/data/mockData";
import { toast } from "sonner";

export default function AwardsPage() {
  const [activeTab, setActiveTab] = useState("vote");
  const [selectedCategory, setSelectedCategory] = useState(
    awardCategories[0].id
  );
  const [votes, setVotes] = useState({});

  const handleVote = (categoryId, nominationId) => {
    setVotes((prev) => ({ ...prev, [categoryId]: nominationId }));
    toast.success({
      title: "Vote Recorded!",
      description: "Thank you for voting. Your vote has been submitted.",
    });
  };

  const currentCategory = awardCategories.find(
    (c) => c.id === selectedCategory
  );

  return (
    <div>
      {/* Hero */}
      <section className="py-24 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Trophy className="w-4 h-4" />
              <span>Kenya Brand Awards 2024</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-gradient-gold">Awards</span> & Nominations
            </h1>
            <p className="text-xl text-muted-foreground">
              Recognize excellence and celebrate the brands shaping Kenyas
              business landscape
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="border-b border-border sticky top-20 bg-background z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("vote")}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-all ${
                activeTab === "vote"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Vote className="w-4 h-4 inline-block mr-2" />
              Vote for Nominees
            </button>
            <button
              onClick={() => setActiveTab("nominate")}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-all ${
                activeTab === "nominate"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award className="w-4 h-4 inline-block mr-2" />
              Submit Nomination
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      {activeTab === "vote" ? (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Category Sidebar */}
              <div className="lg:col-span-1">
                <h3 className="font-display text-lg font-semibold mb-4">
                  Categories
                </h3>
                <div className="space-y-2">
                  {awardCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                        selectedCategory === category.id
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "bg-muted/50 hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {category.name}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nominees Grid */}
              <div className="lg:col-span-3">
                {currentCategory && (
                  <>
                    <div className="mb-8">
                      <h2 className="font-display text-2xl font-bold mb-2">
                        {currentCategory.name}
                      </h2>
                      <p className="text-muted-foreground">
                        {currentCategory.description}
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentCategory.nominations.map((nomination) => (
                        <div
                          key={nomination.id}
                          className={`bg-card rounded-2xl p-6 border-2 transition-all duration-300 ${
                            votes[currentCategory.id] === nomination.id
                              ? "border-primary shadow-glow"
                              : "border-border/50 hover:border-primary/50 shadow-soft hover:shadow-elevated"
                          }`}
                        >
                          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mb-4">
                            <Award className="w-8 h-8 text-primary/50" />
                          </div>
                          <h3 className="font-display text-lg font-semibold mb-2">
                            {nomination.brandName}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4">
                            {nomination.description}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                            <Users className="w-4 h-4" />
                            <span>{nomination.votes} votes</span>
                          </div>
                          <Button
                            variant={
                              votes[currentCategory.id] === nomination.id
                                ? "hero"
                                : "outline"
                            }
                            className="w-full"
                            onClick={() =>
                              handleVote(currentCategory.id, nomination.id)
                            }
                          >
                            {votes[currentCategory.id] === nomination.id ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                Voted
                              </>
                            ) : (
                              "Vote"
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50">
                <h2 className="font-display text-2xl font-bold mb-2">
                  Submit a Nomination
                </h2>
                <p className="text-muted-foreground mb-8">
                  Know a brand that deserves recognition? Submit your nomination
                  below.
                </p>

                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Your Name *
                      </label>
                      <Input placeholder="John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Your Email *
                      </label>
                      <Input type="email" placeholder="john@example.com" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Award Category *
                    </label>
                    <select className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select a category</option>
                      {awardCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Brand/Company Name *
                    </label>
                    <Input placeholder="Company Ltd" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Brand Website
                    </label>
                    <Input placeholder="https://company.co.ke" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Why should this brand win? *
                    </label>
                    <Textarea
                      placeholder="Tell us about the brand's achievements, impact, and why they deserve this award..."
                      rows={5}
                    />
                  </div>

                  <Button variant="hero" size="lg" className="w-full">
                    Submit Nomination
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Process */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our transparent and fair awards process
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Nominate",
                desc: "Submit nominations for deserving brands",
              },
              {
                step: "02",
                title: "Review",
                desc: "Our panel reviews and shortlists nominees",
              },
              {
                step: "03",
                title: "Vote",
                desc: "Public voting opens for all categories",
              },
              {
                step: "04",
                title: "Celebrate",
                desc: "Winners announced at the Awards Gala",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full gradient-gold flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
