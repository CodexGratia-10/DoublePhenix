"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FileText,
  Users,
  Check,
  X,
  Eye,
  Trash2,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Document, Profile } from "@/lib/types/database";

// ═══════════════════════════════════════════
// Toggle Switch for Badges
// ═══════════════════════════════════════════
function BadgeToggle({
  label,
  checked,
  onChange,
  color = "sage",
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  color?: "sage" | "secondary";
}) {
  const bg = color === "secondary"
    ? checked ? "bg-secondary" : "bg-gray-200"
    : checked ? "bg-accent" : "bg-gray-200";
  return (
    <div className="flex-1 flex items-center justify-between bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm">
      <span className="text-xs font-bold text-primary/70 font-body">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${bg}`}
      >
        <span
          className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════
// Admin Page
// ═══════════════════════════════════════════
export default function AdminPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [authorized, setAuthorized] = useState(false);

  // Data
  const [pendingDocs, setPendingDocs] = useState<Document[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchUsers, setSearchUsers] = useState("");
  const [processingDoc, setProcessingDoc] = useState<string | null>(null);

  // ─── Role check ───
  useEffect(() => {
    async function checkRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/connexion"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin") {
        toast.error("Accès réservé aux administrateurs.");
        router.replace("/dashboard");
        return;
      }
      setAuthorized(true);
    }
    checkRole();
  }, [supabase, router]);

  // ─── Fetch pending documents ───
  const fetchPendingDocs = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("status", "PENDING")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Supabase documents error:", error.message, error.code);
        // Table may not exist yet — show empty state instead of error toast
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          setPendingDocs([]);
          return;
        }
        toast.error(`Erreur documents: ${error.message}`);
        return;
      }
      setPendingDocs((data as Document[]) || []);
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  }, [supabase]);

  // ─── Fetch users ───
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) {
        console.error("Supabase profiles error:", error.message, error.code);
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          setUsers([]);
          return;
        }
        toast.error(`Erreur utilisateurs: ${error.message}`);
        return;
      }
      setUsers((data as Profile[]) || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchPendingDocs();
    fetchUsers();
  }, [fetchPendingDocs, fetchUsers]);

  // ─── Validate document ───
  const handleValidateDoc = async (docId: string) => {
    setProcessingDoc(docId);
    try {
      const { error } = await supabase
        .from("documents")
        .update({ status: "APPROVED" as const, approved_at: new Date().toISOString() })
        .eq("id", docId);
      if (error) throw error;
      setPendingDocs((prev) => prev.filter((d) => d.id !== docId));
      toast.success("Document validé !");
    } catch {
      toast.error("Erreur lors de la validation.");
    } finally {
      setProcessingDoc(null);
    }
  };

  // ─── Reject document ───
  const handleRejectDoc = async (docId: string) => {
    setProcessingDoc(docId);
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", docId);
      if (error) throw error;
      setPendingDocs((prev) => prev.filter((d) => d.id !== docId));
      toast.success("Document rejeté et supprimé.");
    } catch {
      toast.error("Erreur lors du rejet.");
    } finally {
      setProcessingDoc(null);
    }
  };

  // ─── Toggle badge on user ───
  const handleToggleBadge = async (userId: string, badgeType: "mentor" | "talent", add: boolean) => {
    const field = badgeType === "mentor" ? "is_mentor" : "is_talent";

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ [field]: add })
        .eq("id", userId);
      if (error) throw error;
      setUsers((prev) =>
        prev.map((u): Profile => (u.id === userId ? { ...u, [field]: add } : u))
      );
      toast.success(`Badge ${badgeType} ${add ? "activé" : "retiré"}.`);
    } catch {
      toast.error("Erreur lors de la mise à jour du badge.");
    }
  };

  // ─── Delete user ───
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Supprimer cet utilisateur ? Cette action est irréversible.")) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
      if (error) throw error;
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("Utilisateur supprimé.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  // ─── Filter users ───
  const filteredUsers = users.filter((u) => {
    if (!searchUsers.trim()) return true;
    const q = searchUsers.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.school?.toLowerCase().includes(q)
    );
  });

  const hasBadge = (user: Profile, label: string) =>
    label === "Mentor" ? user.is_mentor : user.is_talent;

  if (!authorized) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#F9F9F7]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-[#F9F9F7] overflow-x-hidden pb-10">

      {/* ─── HEADER ─── */}
      <header className="bg-transparent px-6 pt-8 pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/5 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <div className="flex flex-col items-center justify-center gap-3 mb-2">
          <Image
            src="/logo.jpeg"
            alt="PHENIX Logo"
            width={96}
            height={96}
            className="w-24 h-24 object-contain drop-shadow-sm rounded-full bg-white p-1"
          />
          <h1 className="text-xl font-bold text-primary tracking-tight font-display">Administration PHENIX</h1>
        </div>
      </header>

      {/* ─── MAIN ─── */}
      <main className="flex-1 flex flex-col px-4 space-y-8">

        {/* ═══ VALIDATION DOCUMENTS ═══ */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2 font-display">
              <FileText className="w-5 h-5" />
              Validation Documents
            </h2>
            <span className="bg-secondary/10 text-secondary text-xs font-bold px-2.5 py-1 rounded-full font-body">
              {pendingDocs.length} en attente
            </span>
          </div>

          {loadingDocs ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          ) : pendingDocs.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <Check className="w-10 h-10 text-accent/30 mx-auto mb-3" />
              <p className="text-sm text-primary/50 font-body">Aucun document en attente de validation</p>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-4 pb-4 px-1 -mx-1 snap-x">
              {pendingDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="snap-center shrink-0 w-[280px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3"
                >
                  {/* Preview */}
                  <div className="relative h-32 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center group">
                    <FileText className="w-10 h-10 text-slate-300" />
                    {doc.file_path && (
                      <a
                        href={doc.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]"
                      >
                        <div className="bg-white/90 text-primary px-3 py-1.5 rounded-full shadow-lg font-bold text-xs flex items-center gap-1 font-body">
                          <Eye className="w-4 h-4" /> Voir
                        </div>
                      </a>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 shadow-sm font-body">
                      {doc.file_path?.endsWith(".pdf") ? "PDF" : "DOC"}
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-bold text-primary text-sm leading-tight truncate font-display">{doc.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-body">
                      Par <span className="font-semibold text-slate-700">{doc.author_name || "Anonyme"}</span>
                    </p>
                    {doc.school && (
                      <p className="text-[10px] text-slate-400 font-body mt-0.5">{doc.school} • {doc.promo_year}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto pt-2">
                    <button
                      onClick={() => handleRejectDoc(doc.id)}
                      disabled={processingDoc === doc.id}
                      className="flex-1 py-2 rounded-xl border border-red-100 text-red-600 text-xs font-bold bg-red-50 hover:bg-red-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-50 font-body"
                    >
                      <X className="w-4 h-4" /> Rejeter
                    </button>
                    <button
                      onClick={() => handleValidateDoc(doc.id)}
                      disabled={processingDoc === doc.id}
                      className="flex-1 py-2 rounded-xl bg-secondary text-white text-xs font-bold shadow-md shadow-secondary/20 hover:brightness-110 transition-all flex items-center justify-center gap-1 disabled:opacity-50 font-body"
                    >
                      {processingDoc === doc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Valider
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ═══ GESTION UTILISATEURS ═══ */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-lg font-bold text-primary flex items-center gap-2 font-display">
              <Users className="w-5 h-5" />
              Gestion Utilisateurs
            </h2>
            <span className="text-xs font-bold text-accent font-body">{users.length} total</span>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
            <input
              type="text"
              value={searchUsers}
              onChange={(e) => setSearchUsers(e.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="w-full bg-white border border-primary/10 rounded-xl pl-11 pr-4 py-3 text-sm text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-body placeholder-primary/30"
            />
          </div>

          {loadingUsers ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <AlertTriangle className="w-8 h-8 text-secondary/30 mx-auto mb-3" />
              <p className="text-sm text-primary/50 font-body">
                {searchUsers ? "Aucun utilisateur trouvé" : "Aucun utilisateur inscrit"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4"
                >
                  {/* User info + actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Image
                        src={user.avatar_url || "/male.png"}
                        alt={user.full_name || "Utilisateur"}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover border border-gray-100"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-primary text-base truncate font-display">
                          {user.full_name || "Utilisateur"}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium font-body truncate">
                          {user.school || "—"} {user.expertise && user.expertise.length > 0 ? `• ${user.expertise[0]}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => router.push(`/u/${user.id}`)}
                        className="p-2 rounded-full text-slate-400 hover:bg-gray-100 hover:text-primary transition-colors"
                        title="Voir le profil"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Badge toggles */}
                  <div className="bg-gray-50 rounded-xl p-3 flex gap-3">
                    <BadgeToggle
                      label="Mentor"
                      checked={hasBadge(user, "Mentor")}
                      onChange={(val) => handleToggleBadge(user.id, "mentor", val)}
                      color="secondary"
                    />
                    <BadgeToggle
                      label="Talent"
                      checked={hasBadge(user, "Talent")}
                      onChange={(val) => handleToggleBadge(user.id, "talent", val)}
                      color="sage"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
