import { NextRequest, NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";
import { enrichSinglePermit } from "@/lib/agents/lead-intelligence-orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
    const body = (await request.json()) as { permitId?: string };
    if (!body.permitId) {
      return NextResponse.json({ error: "permitId is required" }, { status: 400 });
    }

    const result = await enrichSinglePermit(body.permitId);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Enrichment failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
