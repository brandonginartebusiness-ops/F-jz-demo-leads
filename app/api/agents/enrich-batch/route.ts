import { NextRequest, NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";
import { enrichPermitBatch } from "@/lib/agents/lead-intelligence-orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

function isAuthorized(request: NextRequest) {
  const serverEnv = getServerEnv();
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${serverEnv.CRON_SECRET}`;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { permitIds?: string[]; batchSize?: number };
    const batchSize = Math.min(body.batchSize ?? 10, 10);

    const result = await enrichPermitBatch(body.permitIds, batchSize);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Batch enrichment failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
