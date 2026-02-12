// app/api/clubs/[id]/applications/[appId]/route.ts
// PATCH: Update a grant application (status, sub-statuses, interest)

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_STATUSES = [
  "open_match", "proceeding", "new", "preparation", "drafting", "attachments",
  "review", "lodgment", "outcome", "acquittal", "won", "lost", "dnl",
];

// Sub-status columns and their valid values
const SUB_STATUS_FIELDS: Record<string, string[]> = {
  preparationStatus:  ["pending", "complete"],
  draftingStatus:     ["pending", "wip", "loaded", "complete"],
  attachmentStatus:   ["pending", "loaded"],
  reviewStatus:       ["pending", "approved"],
  lodgmentStatus:     ["pending", "lodged"],
  outcomeStatus:      ["pending", "lodged", "pending outcome"],
  acquittalStatus:    ["pending", "pending outcome"],
  invoiceStatus:      ["pending", "invoiced", "paid"],
};

// Map camelCase to snake_case
const FIELD_MAP: Record<string, string> = {
  applicationStatus:  "application_status",
  interestStatus:     "interest_status",
  preparationStatus:  "preparation_status",
  draftingStatus:     "drafting_status",
  attachmentStatus:   "attachment_status",
  reviewStatus:       "review_status",
  lodgmentStatus:     "lodgment_status",
  outcomeStatus:      "outcome_status",
  acquittalStatus:    "acquittal_status",
  invoiceStatus:      "invoice_status",
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  try {
    const { id, appId } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const updates: Record<string, any> = {};

    // Validate application_status
    if (body.applicationStatus !== undefined) {
      if (!VALID_STATUSES.includes(body.applicationStatus)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      updates.application_status = body.applicationStatus;
    }

    // Validate interest_status
    if (body.interestStatus !== undefined) {
      const validInterest = ["interested", "not_interested", "need_info", null];
      if (!validInterest.includes(body.interestStatus)) {
        return NextResponse.json({ error: "Invalid interest status" }, { status: 400 });
      }
      updates.interest_status = body.interestStatus;
      updates.interest_submitted_at = body.interestStatus ? new Date().toISOString() : null;
    }

    // Validate sub-status fields
    for (const [camelKey, validValues] of Object.entries(SUB_STATUS_FIELDS)) {
      if (body[camelKey] !== undefined) {
        if (!validValues.includes(body[camelKey])) {
          return NextResponse.json(
            { error: `Invalid ${camelKey}. Must be one of: ${validValues.join(", ")}` },
            { status: 400 }
          );
        }
        const snakeKey = FIELD_MAP[camelKey];
        if (snakeKey) updates[snakeKey] = body[camelKey];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    // Verify the application belongs to this club and update
    const { data, error } = await supabase
      .from("grant_applications")
      .update(updates)
      .eq("id", appId)
      .eq("club_id", id)
      .select("id, application_status, interest_status, preparation_status, drafting_status, attachment_status, review_status, lodgment_status, outcome_status, acquittal_status, invoice_status")
      .single();

    if (error || !data) {
      console.error("Update application error:", error);
      return NextResponse.json({ error: "Application not found or update failed" }, { status: 404 });
    }

    return NextResponse.json({ success: true, application: data });
  } catch (err: any) {
    console.error("PATCH application error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}