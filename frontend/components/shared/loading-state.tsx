import { Card, CardContent } from "@/components/ui/card";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        {label}
      </CardContent>
    </Card>
  );
}
