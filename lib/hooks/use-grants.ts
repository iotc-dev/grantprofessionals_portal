// lib/hooks/use-grants.ts
// Client hook that calls /api/grants with server-side filtering

"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ──

export interface GrantRow {
  id: string;
  name: string;
  provider: string;
  programName: string;
  grantType: string;
  amount: string;
  amountMax: number | null;
  openDate: string | null;
  closeDate: string | null;
  closingSoon: boolean;
  status: string;
  statusType: string;
  applicationUrl: string;
  linkDomain: string;
  states: string[];
  applicationCount: number;
  // Formatted for display
  openDateFormatted: string;
  closeDateFormatted: string;
}

export interface GrantFilters {
  search: string;
  status: string;
  grantType: string;
  sort: string;
  order: "asc" | "desc";
  page: number;
  perPage: number;
}

export interface GrantsResult {
  grants: GrantRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  filters: GrantFilters;
  setFilters: (updates: Partial<GrantFilters>) => void;
  refetch: () => void;
}

// ── Helpers ──

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function statusToType(status: string): string {
  switch (status) {
    case "open": return "active";
    case "closed": return "inactive";
    case "draft": return "pending";
    default: return "inactive";
  }
}

// ── Default filters ──

const DEFAULT_FILTERS: GrantFilters = {
  search: "",
  status: "",
  grantType: "",
  sort: "close_date",
  order: "desc",
  page: 1,
  perPage: 10,
};

// ── Hook ──

export function useGrants(initialFilters?: Partial<GrantFilters>): GrantsResult {
  const [filters, setFiltersState] = useState<GrantFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [grants, setGrants] = useState<GrantRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setFilters = useCallback((updates: Partial<GrantFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...updates,
      page: "page" in updates ? (updates.page || 1) : 1,
    }));
  }, []);

  const fetchGrants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", String(filters.page));
      params.set("per_page", String(filters.perPage));
      if (filters.search) params.set("search", filters.search);
      if (filters.status) params.set("status", filters.status);
      if (filters.grantType) params.set("grant_type", filters.grantType);
      if (filters.sort) params.set("sort", filters.sort);
      if (filters.order) params.set("order", filters.order);

      const res = await fetch(`/api/grants?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      const rows: GrantRow[] = (data.grants || []).map((grant: any) => ({
        ...grant,
        statusType: statusToType(grant.status),
        openDateFormatted: formatDate(grant.openDate),
        closeDateFormatted: formatDate(grant.closeDate),
      }));

      setGrants(rows);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err: any) {
      console.error("Failed to fetch grants:", err);
      setError(err.message || "Failed to load grants");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  return {
    grants,
    total,
    page: filters.page,
    perPage: filters.perPage,
    totalPages,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchGrants,
  };
}