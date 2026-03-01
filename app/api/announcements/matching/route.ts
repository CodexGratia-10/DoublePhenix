import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_LIMIT = 4;
const MAX_LIMIT = 20;

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const url = new URL(request.url);
    const rawLimit = Number(url.searchParams.get("limit") || DEFAULT_LIMIT);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_LIMIT)
      : DEFAULT_LIMIT;

    const { data: profile } = await supabase
      .from("profiles")
      .select("school")
      .eq("id", user.id)
      .single();

    const school = profile?.school || null;

    let query = supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (school) {
      query = query.in("target_school", [school, "All"]);
    } else {
      query = query.eq("target_school", "All");
    }

    const { data, error } = await query;

    if (error) {
      console.error("[API] matching announcements error:", error.message);
      return NextResponse.json({ error: "Impossible de charger les annonces" }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error) {
    console.error("[API] matching announcements unexpected error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
