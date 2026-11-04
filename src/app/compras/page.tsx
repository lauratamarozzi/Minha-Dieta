import { getShoppingList } from "@/lib/api/shopping";
import ShoppingView from "@/components/shopping/ShoppingView";

export const dynamic = "force-dynamic";

export default async function ComprasPage() {
  const items = await getShoppingList();
  return <ShoppingView initialItems={items} />;
}
