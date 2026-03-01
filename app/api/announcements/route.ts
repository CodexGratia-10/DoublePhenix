import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function normalizeTags(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const rawTag of input) {
    if (typeof rawTag !== "string") continue;
    const value = rawTag.trim().replace(/^#/, "");
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(value);
  }

  return normalized;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : "";
    const targetSchool =
      typeof body?.target_school === "string" && body.target_school.trim().length > 0
        ? body.target_school.trim()
        : "";
    const collabType =
      typeof body?.collab_type === "string" && body.collab_type.trim().length > 0
        ? body.collab_type.trim()
        : "projet";

    if (!title || !description || !targetSchool) {
      return NextResponse.json(
        { error: "Champs requis: title, description, target_school" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("announcements")
      .insert({
        user_id: user.id,
        title,
        description,
        target_school: targetSchool,
        collab_type: collabType,
        tags: normalizeTags(body?.tags),
        contact_whatsapp: Boolean(body?.contact_whatsapp),
        contact_linkedin: Boolean(body?.contact_linkedin),
      })
      .select("*")
      .single();

    if (error) {
      console.error("[API] create announcement error:", error.message);
      return NextResponse.json({ error: "Impossible de créer l'annonce" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[API] create announcement unexpected error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
