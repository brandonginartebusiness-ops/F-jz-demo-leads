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
      "permit_number",
      "folio_number",
      "property_address",
      "detail_description",
      "permit_issued_date",
      "estimated_value",
      "square_footage",
      "structure_floors",
      "owner_name",
      "contractor_name",
      "contractor_phone",
      "application_type_description",
      "lead_status",
      "notes",
    ].join(","),
    ...permits.map((permit) =>
      [
        escapeCsv(permit.permit_number),
        escapeCsv(permit.folio_number),
        escapeCsv(permit.property_address),
        escapeCsv(permit.detail_description),
        escapeCsv(permit.permit_issued_date),
        escapeCsv(permit.estimated_value),
        escapeCsv(permit.square_footage),
        escapeCsv(permit.structure_floors),
        escapeCsv(permit.owner_name),
        escapeCsv(permit.contractor_name),
        escapeCsv(permit.contractor_phone),
        escapeCsv(permit.application_type_description),
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
