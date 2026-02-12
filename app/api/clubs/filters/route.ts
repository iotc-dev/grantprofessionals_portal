// app/api/clubs/filters/route.ts
// Returns dynamic filter options (AEs with assigned clubs)

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get distinct AEs who have at least one club assigned
    const { data: aeData } = await supabase
      .from("gp_team")
      .select("id, full_name")
      .order("full_name");

    const aes = (aeData || []).map((ae: any) => ({
      value: ae.id,
      label: ae.full_name,
    }));

    return NextResponse.json({ aes });
  } catch (err: any) {
    console.error("Club filters error:", err);
    return NextResponse.json({ error: "Failed to load filters" }, { status: 500 });
  }
}