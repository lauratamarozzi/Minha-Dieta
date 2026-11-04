import { getWeekDiet } from "@/lib/api/diet";
import DietViewLoader from "@/components/diet/DietViewLoader";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const meals = await getWeekDiet();
  return <DietViewLoader initialMeals={meals} />;
}
