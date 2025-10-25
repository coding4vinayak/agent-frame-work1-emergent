import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, User, Activity, Flame, ThumbsUp, Snowflake } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface LeadScoringDisplayProps {
  data: {
    leadScore: number;
    scoreBreakdown?: {
      demographic?: number;
      behavioral?: number;
      engagement?: number;
    };
    recommendation?: "hot" | "warm" | "cold" | "nurture";
    historicalScores?: Array<{
      date: string;
      score: number;
    }>;
    factors?: Array<{
      name: string;
      impact: "positive" | "negative" | "neutral";
      value: string;
    }>;
  };
}

export function LeadScoringDisplay({ data }: LeadScoringDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 75) return "bg-green-100";
    if (score >= 50) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getRecommendationVariant = (rec: string) => {
    switch (rec) {
      case "hot":
        return "default";
      case "warm":
        return "secondary";
      case "cold":
        return "outline";
      case "nurture":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <CardTitle>Lead Score</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-5xl font-bold ${getScoreColor(data.leadScore)}`} data-testid="text-lead-score">
                {data.leadScore}
              </div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
            <div className={`w-24 h-24 rounded-full ${getScoreBgColor(data.leadScore)} flex items-center justify-center`}>
              {data.leadScore >= 75 ? (
                <Flame className={`w-12 h-12 ${getScoreColor(data.leadScore)}`} />
              ) : data.leadScore >= 50 ? (
                <ThumbsUp className={`w-12 h-12 ${getScoreColor(data.leadScore)}`} />
              ) : (
                <Snowflake className={`w-12 h-12 ${getScoreColor(data.leadScore)}`} />
              )}
            </div>
          </div>
          {data.recommendation && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Recommendation:</span>
              <Badge variant={getRecommendationVariant(data.recommendation)} data-testid="badge-recommendation">
                {data.recommendation.toUpperCase()}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {data.scoreBreakdown && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <CardTitle>Score Breakdown</CardTitle>
            </div>
            <CardDescription>Contribution by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.scoreBreakdown.demographic !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">Demographic Score</span>
                  </div>
                  <span className="text-sm font-bold">{data.scoreBreakdown.demographic}%</span>
                </div>
                <Progress value={data.scoreBreakdown.demographic} className="h-2" data-testid="progress-demographic" />
              </div>
            )}
            {data.scoreBreakdown.behavioral !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm font-medium">Behavioral Score</span>
                  </div>
                  <span className="text-sm font-bold">{data.scoreBreakdown.behavioral}%</span>
                </div>
                <Progress value={data.scoreBreakdown.behavioral} className="h-2" data-testid="progress-behavioral" />
              </div>
            )}
            {data.scoreBreakdown.engagement !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Engagement Score</span>
                  </div>
                  <span className="text-sm font-bold">{data.scoreBreakdown.engagement}%</span>
                </div>
                <Progress value={data.scoreBreakdown.engagement} className="h-2" data-testid="progress-engagement" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {data.factors && data.factors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Contributing Factors</CardTitle>
            <CardDescription>{data.factors.length} factors analyzed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.factors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md" data-testid={`factor-${index}`}>
                  <span className="text-sm font-medium">{factor.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{factor.value}</span>
                    <Badge
                      variant={
                        factor.impact === "positive"
                          ? "default"
                          : factor.impact === "negative"
                            ? "destructive"
                            : "secondary"
                      }
                      className="text-xs"
                    >
                      {factor.impact === "positive" ? "+" : factor.impact === "negative" ? "-" : "="}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
