
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-24" />
      </div>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
      
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}
