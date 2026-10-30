import { Suspense } from "react";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { WorkTrackingView } from "@/components/admin/WorkTrackingView";
import { loadAdminData } from "../data";
import { loadPeople } from "../staff";

async function WorkTracking() {
  const [data, { nameOf, assignments }] = await Promise.all([loadAdminData(), loadPeople()]);
  if (!data) return null;
  return <WorkTrackingView data={data} assignees={Object.fromEntries(Object.entries(assignments).map(([id, staff]) => [id, nameOf.get(staff) ?? "Personel"]))} />;
}

export default function WorkTrackingPage() {
  return (
    <Suspense fallback={<PageSkeleton label="İş takibi yükleniyor" stats={4} variant="list" />}>
      <WorkTracking />
    </Suspense>
  );
}
