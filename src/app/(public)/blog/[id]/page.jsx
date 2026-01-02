"use client";
import React from "react";

import { Calendar, ArrowLeft, Facebook, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { blogPosts } from "@/data/mockData";
import Link from "next/link";
import { useParams } from "next/navigation";

const BlogPost = () => {
  const { id } = useParams();
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="mb-4 font-display text-3xl font-bold">Post Not Found</h1>
        <Link href="/blog">
          <Button>Back to Blog</Button>
        </Link>
      </div>
    );
  }

  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 2);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-hero py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-primary-foreground/80 hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
          <div className="mx-auto max-w-3xl">
            <Badge className="mb-4 bg-accent text-accent-foreground">
              {post.category}
            </Badge>
            <h1 className="mb-6 font-display text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-display font-bold text-accent-foreground">
                  {post.author.charAt(0)}
                </div>
                <span>{post.author}</span>
              </div>
              <span className="hidden sm:block">•</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
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
              <div className="mb-8 aspect-video overflow-hidden rounded-2xl bg-muted">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="lead text-xl text-muted-foreground">
                  {post.excerpt}
                </p>
                <p>
                  In the dynamic landscape of Kenyas business ecosystem, small
                  and medium enterprises continue to demonstrate remarkable
                  resilience and innovation. This article explores the key
                  factors driving success in this sector and highlights the
                  strategies that award-winning brands have employed to stand
                  out in competitive markets.
                </p>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  The Power of Brand Recognition
                </h2>
                <p>
                  Brand recognition goes beyond mere visibility—its about
                  creating lasting impressions that resonate with your target
                  audience. Our research shows that businesses that invest in
                  brand building consistently outperform their peers in customer
                  loyalty and revenue growth.
                </p>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Key Success Factors
                </h2>
                <ul>
                  <li>Consistent brand messaging across all touchpoints</li>
                  <li>
                    Customer-centric approach to product and service development
                  </li>
                  <li>Active engagement in community and industry events</li>
                  <li>
                    Leveraging digital platforms for visibility and engagement
                  </li>
                  <li>Building strategic partnerships and networks</li>
                </ul>
                <p>
                  As we continue to celebrate and recognize outstanding brands
                  through our awards programs, we remain committed to providing
                  platforms that amplify the stories of Kenyas most innovative
                  businesses.
                </p>
              </div>

              {/* Share Section */}
              <div className="mt-12 border-t border-border pt-8">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    Share this article
                  </span>
                  <div className="flex gap-2">
                    {[Facebook, Twitter, Linkedin].map((Icon, index) => (
                      <Button key={index} variant="outline" size="icon">
                        <Icon className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardContent className="p-6">
                  <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
                    About the Author
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {post.author}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Contributing Writer
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {relatedPosts.length > 0 && (
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
                      Related Articles
                    </h3>
                    <div className="space-y-4">
                      {relatedPosts.map((related) => (
                        <Link
                          key={related.id}
                          to={`/blog/${related.id}`}
                          className="block rounded-lg border border-border/50 p-3 transition-colors hover:border-accent/50 hover:bg-muted"
                        >
                          <h4 className="font-medium text-foreground line-clamp-2">
                            {related.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(related.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
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

export default BlogPost;
