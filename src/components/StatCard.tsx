import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: {
    value: string;
    positive: boolean;
  };
}

export const StatCard = ({ title, value, icon: Icon, change }: StatCardProps) => {
  return (
    <Card className="bg-card border-border shadow-elegant hover:shadow-glow transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change && (
              <p className={`text-xs ${
                change.positive ? 'text-primary' : 'text-destructive'
              }`}>
                {change.positive ? '+' : ''}{change.value}
              </p>
            )}
          </div>
          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-hero-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};