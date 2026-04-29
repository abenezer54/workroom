import { AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type ErrorStateProps = {
  title?: string;
  message: string;
};

export function ErrorState({
  title = "Something went wrong",
  message,
}: ErrorStateProps) {
  return (
    <Card className="border-[#F3D5D5] bg-[#FBEAEA]">
      <CardContent className="flex gap-3 p-5">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#B94A48]" />
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-[#B94A48]">{title}</h2>
          <p className="text-sm leading-6 text-[#7F3432]">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
