"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import NorenCanvas from "./NorenCanvas";

function OjamaInner() {
  const params = useSearchParams();
  const hostId = params.get("hostId") ?? undefined;
  return <NorenCanvas hostId={hostId} />;
}

export default function OjamaPage() {
  return (
    <Suspense fallback={<NorenCanvas />}>
      <OjamaInner />
    </Suspense>
  );
}
