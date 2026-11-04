"use client";

import dynamic from "next/dynamic";
import type { RoutineItem } from "@/lib/types";

const RoutineView = dynamic(() => import("./RoutineView"), { ssr: false });

export default function RoutineViewLoader({ initialItems }: { initialItems: RoutineItem[] }) {
  return <RoutineView initialItems={initialItems} />;
}
