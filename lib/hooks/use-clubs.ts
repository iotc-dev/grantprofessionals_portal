// lib/hooks/use-clubs.ts
// Client hook that calls /api/clubs with server-side filtering
// All heavy lifting happens on the server — client just manages state

"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ──

export interface ClubRow {
  id: string;
  initials: string;
  name: string;
  sport: string;
  lga: string;
  plan: string;
  ae: { id: string | null; name: string; initials: string; color: string };
  state: string;
  status: { type: string; text: string };
  apps: number;
  lastActive: string;
  lastActiveRecent: boolean;
}

export interface ClubFilters {
  search: string;
  state: string;
  plan: string;
  status: string;
  ae: string;
  sort: string;
  order: "asc" | "desc";
  page: number;
  perPage: number;
}

export interface ClubsResult {
  clubs: ClubRow[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  filters: ClubFilters;
  setFilters: (updates: Partial<ClubFilters>) => void;
  refetch: () => void;
}

// ── Helpers ──

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function stringToColor(str: string): string {
  const colors = ["#1E88E5", "#8E24AA", "#F57C00", "#43A047", "#EC407A", "#00ACC1", "#5E35B1", "#FB8C00"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function timeAgo(dateStr: string | null): { text: string; recent: boolean } {
  if (!dateStr) return { text: "Never", recent: false };
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 60) return { text: `${mins} min ago`, recent: true };
  if (hours < 24) return { text: `${hours} hours ago`, recent: true };
  if (days === 1) return { text: "Yesterday", recent: false };
  if (days < 7) return { text: `${days} days ago`, recent: false };
  return { text: `${Math.floor(days / 7)} weeks ago`, recent: false };
}

// ── Default filters ──

const DEFAULT_FILTERS: ClubFilters = {
  search: "",
  state: "",
  plan: "",
  status: "",
  ae: "",
  sort: "name",
  order: "asc",
  page: 1,
  perPage: 10,
};

// ── Hook ──

export function useClubs(initialFilters?: Partial<ClubFilters>): ClubsResult {
  const [filters, setFiltersState] = useState<ClubFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [clubs, setClubs] = useState<ClubRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update filters — resets to page 1 unless page is explicitly set
  const setFilters = useCallback((updates: Partial<ClubFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...updates,
      page: "page" in updates ? (updates.page || 1) : 1,
    }));
  }, []);

  // Fetch clubs from API
  const fetchClubs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", String(filters.page));
      params.set("per_page", String(filters.perPage));
      if (filters.search) params.set("search", filters.search);
      if (filters.state) params.set("state", filters.state);
      if (filters.plan) params.set("plan", filters.plan);
      if (filters.status) params.set("status", filters.status);
      if (filters.ae) params.set("ae", filters.ae);
      if (filters.sort) params.set("sort", filters.sort);
      if (filters.order) params.set("order", filters.order);

      const res = await fetch(`/api/clubs?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      // Transform API response to ClubRow[]
      const rows: ClubRow[] = (data.clubs || []).map((club: any) => {
        const { text: lastActiveText, recent: lastActiveRecent } = timeAgo(club.updatedAt);

        let statusObj: { type: string; text: string };
        if (club.subscriptionActive) {
          statusObj = { type: "active", text: "Active" };
        } else {
          statusObj = { type: "inactive", text: "Inactive" };
        }

        return {
          id: club.id,
          initials: getInitials(club.name),
          name: club.name,
          sport: club.sport,
          lga: club.lga,
          plan: club.plan,
          ae: {
            id: club.ae.id,
            name: club.ae.name,
            initials: getInitials(club.ae.name),
            color: stringToColor(club.ae.name),
          },
          state: club.state,
          status: statusObj,
          apps: club.apps,
          lastActive: lastActiveText,
          lastActiveRecent,
        };
      });

      setClubs(rows);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err: any) {
      console.error("Failed to fetch clubs:", err);
      setError(err.message || "Failed to load clubs");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchClubs();
  }, [fetchClubs]);

  return {
    clubs,
    total,
    page: filters.page,
    perPage: filters.perPage,
    totalPages,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchClubs,
  };
}