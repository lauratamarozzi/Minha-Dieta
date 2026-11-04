import { getAllRoutineItems } from "@/lib/api/routine";
import RoutineViewLoader from "@/components/routine/RoutineViewLoader";

export const dynamic = "force-dynamic";

export default async function RotinaPage() {
  const items = await getAllRoutineItems();
  return <RoutineViewLoader initialItems={items} />;
}
