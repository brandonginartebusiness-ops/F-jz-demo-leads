import { NextRequest, NextResponse } from "next/server";

import { listPermits } from "@/lib/permits/queries";
import { createClient } from "@/lib/supabase/server";

function escapeCsv(value: string | number | null) {
  if (value === null) return "";

  const stringValue = String(value).replace(/"/g, "\"\"");
  return `"${stringValue}"`;
}

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const permits = await listPermits({
    leadStatus: searchParams.get("leadStatus") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    minValue: searchParams.get("minValue") ?? undefined,
    maxValue: searchParams.get("maxValue") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    view: searchParams.get("view") ?? undefined,
  });

  const rows = [
    [
      "folio",
      "address",
      "description",
      "issued_date",
      "estimated_value",
      "contractor_name",
      "status",
      "lead_status",
      "notes",
    ].join(","),
    ...permits.map((permit) =>
      [
        escapeCsv(permit.folio),
        escapeCsv(permit.address),
        escapeCsv(permit.description),
        escapeCsv(permit.issued_date),
        escapeCsv(permit.estimated_value),
        escapeCsv(permit.contractor_name),
        escapeCsv(permit.status),
        escapeCsv(permit.lead_status),
        escapeCsv(permit.notes),
      ].join(","),
    ),
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="permits-export.csv"',
    },
  });
}
