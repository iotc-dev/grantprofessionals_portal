// app/api/clubs/[id]/applications/route.ts
// Fetch all grant applications for a specific club

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // ── Fetch applications with grant details ──
    const { data: apps, error } = await supabase
      .from("grant_applications")
      .select(`
        id,
        application_status,
        interest_status,
        interest_submitted_at,
        amount_requested,
        amount_won,
        success_fee_percentage,
        success_fee_amount,
        outcome_date,
        submitted_at,
        created_at,
        updated_at,
        drafting_status,
        attachment_status,
        review_status,
        lodgment_status,
        invoice_status,
        outcome_status,
        acquittal_status,
        preparation_status,
        project_description,
        forecasted_success_fee,
        probability_of_success,
        outcome_expected_date,
        outcome_informed_date,
        application_reference,
        grant:grants(
          id, name, provider, program_name, amount_min, amount_max,
          open_date, close_date, status, application_url,
          grant_type:grant_types(name)
        ),
        assigned_ae:gp_team!grant_applications_assigned_gp_team_id_fkey(full_name),
        grant_writer:gp_team!grant_applications_grant_writer_id_fkey(full_name),
        reviewer:gp_team!grant_applications_reviewer_id_fkey(full_name)
      `)
      .eq("club_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Applications query error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ── Fetch pending items for all these applications ──
    const appIds = (apps || []).map((a: any) => a.id);
    const pendingMap = new Map<string, any[]>();

    if (appIds.length > 0) {
      const { data: pendingItems } = await supabase
        .from("pending_items")
        .select(`
          id, custom_name, item_type, description, instructions, status,
          template:pending_item_templates(name, item_type, description, instructions),
          grant_application_id
        `)
        .in("grant_application_id", appIds);

      (pendingItems || []).forEach((item: any) => {
        const list = pendingMap.get(item.grant_application_id) || [];
        list.push({
          id: item.id,
          name: item.custom_name || item.template?.name || "Unnamed Item",
          type: item.item_type || item.template?.item_type || "document",
          description: item.description || item.template?.description || "",
          status: item.status,
        });
        pendingMap.set(item.grant_application_id, list);
      });
    }

    // ── Also fetch invoices for won applications ──
    const wonAppIds = (apps || []).filter((a: any) => a.application_status === "won").map((a: any) => a.id);
    const invoiceMap = new Map<string, any>();

    if (wonAppIds.length > 0) {
      const { data: invoices } = await supabase
        .from("invoices")
        .select("grant_application_id, invoice_number, amount, status, invoice_date")
        .in("grant_application_id", wonAppIds);

      (invoices || []).forEach((inv: any) => {
        invoiceMap.set(inv.grant_application_id, inv);
      });
    }

    // ── Transform ──
    const today = new Date();

    const applications = (apps || []).map((app: any) => {
      const grant = app.grant;
      const closeDate = grant?.close_date ? new Date(grant.close_date) : null;
      const closingSoon = closeDate
        ? (closeDate.getTime() - today.getTime()) / 86400000 <= 14 && closeDate > today
        : false;

      // Format amount
      let amount = "—";
      if (app.amount_requested) {
        amount = formatCurrency(app.amount_requested);
      } else if (grant?.amount_max) {
        amount = grant.amount_min && grant.amount_min !== grant.amount_max
          ? `${formatCurrency(grant.amount_min)} – ${formatCurrency(grant.amount_max)}`
          : `Up to ${formatCurrency(grant.amount_max)}`;
      }

      // Pending items for this application
      const pending = pendingMap.get(app.id) || [];
      const pendingCount = pending.filter((p: any) => p.status === "pending").length;

      // Invoice for won applications
      const invoice = invoiceMap.get(app.id);

      return {
        id: app.id,
        // Grant info
        grantId: grant?.id,
        grantName: grant?.name || "Unknown Grant",
        grantProvider: grant?.provider || "—",
        grantType: grant?.grant_type?.name || "—",
        amount,
        amountWon: app.amount_won ? formatCurrency(app.amount_won) : null,
        openDate: grant?.open_date,
        closeDate: grant?.close_date,
        closeDateFormatted: formatDate(grant?.close_date),
        closingSoon,
        applicationUrl: grant?.application_url || null,

        // Application status
        applicationStatus: app.application_status,
        interestStatus: app.interest_status,
        interestSubmittedAt: app.interest_submitted_at,
        submittedAt: app.submitted_at,

        // Sub-statuses
        draftingStatus: app.drafting_status,
        attachmentStatus: app.attachment_status,
        reviewStatus: app.review_status,
        lodgmentStatus: app.lodgment_status,
        invoiceStatus: app.invoice_status,
        outcomeStatus: app.outcome_status,
        acquittalStatus: app.acquittal_status,
        preparationStatus: app.preparation_status,

        // Details
        projectDescription: app.project_description,
        probabilityOfSuccess: app.probability_of_success,
        forecastedSuccessFee: app.forecasted_success_fee,
        successFeeAmount: app.success_fee_amount ? formatCurrency(app.success_fee_amount) : null,
        outcomeDate: app.outcome_date,
        outcomeExpectedDate: app.outcome_expected_date,
        applicationReference: app.application_reference,

        // People
        assignedAE: app.assigned_ae?.full_name || null,
        grantWriter: app.grant_writer?.full_name || null,
        reviewer: app.reviewer?.full_name || null,

        // Pending items
        pendingItems: pending,
        pendingCount,

        // Invoice (for won)
        invoice: invoice ? {
          number: invoice.invoice_number,
          amount: formatCurrency(invoice.amount),
          status: invoice.status,
          date: formatDate(invoice.invoice_date),
        } : null,
      };
    });

    // ── Status counts ──
    const statusCounts: Record<string, number> = {};
    applications.forEach((app: any) => {
      const s = app.applicationStatus;
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    return NextResponse.json({
      applications,
      total: applications.length,
      statusCounts,
    });
  } catch (err: any) {
    console.error("Club applications API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}