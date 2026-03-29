import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function ProjectCardSkeleton() {
    return (
        <Card className="overflow-hidden border-border/40 bg-card/40 backdrop-blur-sm">
            <div className="relative h-48 w-full">
                <Skeleton className="h-full w-full rounded-none" />
            </div>

            <CardHeader className="p-5 pb-0">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-1" />
            </CardHeader>

            <CardContent className="p-5 pt-4">
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between p-5 pt-0 mt-auto border-t border-border/40">
                <div className="flex gap-3">
                    <Skeleton className="h-3 w-8" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-12" />
            </CardFooter>
        </Card>
    );
}
