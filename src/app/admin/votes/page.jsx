import { Award, Users, TrendingUp, BarChart3 } from "lucide-react";
import { awardCategories } from "@/data/mockData";

export default function AdminVotes() {
  const allNominations = awardCategories
    .flatMap((cat) =>
      cat.nominations.map((nom) => ({ ...nom, category: cat.name }))
    )
    .sort((a, b) => b.votes - a.votes);

  const totalVotes = allNominations.reduce((acc, nom) => acc + nom.votes, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">
          Voting Analytics
        </h1>
        <p className="text-muted-foreground">
          View voting statistics and trends
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div className="font-display text-3xl font-bold">
            {totalVotes.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Votes</div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
            <Award className="w-6 h-6 text-secondary" />
          </div>
          <div className="font-display text-3xl font-bold">
            {awardCategories.length}
          </div>
          <div className="text-sm text-muted-foreground">Categories</div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-accent" />
          </div>
          <div className="font-display text-3xl font-bold">
            {allNominations.length}
          </div>
          <div className="text-sm text-muted-foreground">Total Nominees</div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-soft border border-border/50">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-destructive" />
          </div>
          <div className="font-display text-3xl font-bold">
            {Math.round(totalVotes / allNominations.length)}
          </div>
          <div className="text-sm text-muted-foreground">
            Avg. Votes/Nominee
          </div>
        </div>
      </div>

      {/* Votes by Category */}
      <div className="grid lg:grid-cols-2 gap-8">
        {awardCategories.map((category) => {
          const categoryVotes = category.nominations.reduce(
            (acc, n) => acc + n.votes,
            0
          );
          const maxVotes = Math.max(
            ...category.nominations.map((n) => n.votes)
          );

          return (
            <div
              key={category.id}
              className="bg-card rounded-xl shadow-soft border border-border/50"
            >
              <div className="p-6 border-b border-border">
                <h2 className="font-display text-lg font-semibold">
                  {category.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {categoryVotes.toLocaleString()} total votes
                </p>
              </div>
              <div className="p-6 space-y-4">
                {category.nominations.map((nom) => (
                  <div key={nom.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">
                        {nom.brandName}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {nom.votes} votes
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-gold rounded-full transition-all duration-500"
                        style={{ width: `${(nom.votes / maxVotes) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard */}
      <div className="bg-card rounded-xl shadow-soft border border-border/50">
        <div className="p-6 border-b border-border">
          <h2 className="font-display text-lg font-semibold">
            Overall Leaderboard
          </h2>
          <p className="text-sm text-muted-foreground">
            Top voted brands across all categories
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-sm">Rank</th>
                <th className="text-left p-4 font-medium text-sm">Brand</th>
                <th className="text-left p-4 font-medium text-sm">Category</th>
                <th className="text-right p-4 font-medium text-sm">Votes</th>
                <th className="text-right p-4 font-medium text-sm">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allNominations.slice(0, 10).map((nom, i) => (
                <tr
                  key={nom.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="p-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        i < 3
                          ? "gradient-gold text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </div>
                  </td>
                  <td className="p-4 font-medium">{nom.brandName}</td>
                  <td className="p-4 text-muted-foreground">{nom.category}</td>
                  <td className="p-4 text-right font-semibold text-primary">
                    {nom.votes.toLocaleString()}
                  </td>
                  <td className="p-4 text-right  text-yellow-400">
                    {((nom.votes / totalVotes) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
