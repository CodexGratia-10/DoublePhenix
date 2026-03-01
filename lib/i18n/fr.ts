// ═══════════════════════════════════════════
// PHENIX — Traductions Françaises
// ═══════════════════════════════════════════
const fr = {
  // Common
  back: "Retour",
  save: "Enregistrer",
  cancel: "Annuler",
  loading: "Chargement...",
  seeAll: "Voir tout",
  open: "OUVERT",
  active: "Actif",
  inactive: "Inactif",
  visible: "Visible",
  hidden: "Masqué",

  // Profile
  profile_dashboard: "Tableau de Bord",
  profile_member: "Membre",
  profile_badges: "Statut Badges",
  profile_mentor: "Badge MENTOR",
  profile_talent: "Badge TALENT",
  profile_talent_cta: "Remplir le formulaire",
  profile_gender: "Genre",
  profile_male: "Masculin",
  profile_female: "Féminin",
  profile_gender_set: "Genre défini",
  profile_docs: "Mes Mémoires Partagés",
  profile_no_docs: "Aucun document partagé",
  profile_add_doc: "Ajouter un document",
  profile_nexus_visible: "Mode Visible sur Nexus",
  profile_nexus_desc: "Être visible par la communauté",
  profile_contacts: "Contacts sur le profil public",
  profile_contacts_desc: "Choisissez quels contacts sont visibles par les autres.",
  profile_whatsapp: "Numéro WhatsApp",
  profile_linkedin: "Lien LinkedIn",
  profile_announcements: "Mes Annonces",
  profile_no_announcements: "Aucune annonce publiée",
  profile_create_announcement: "Créer une annonce",
  profile_mark_filled: "Marquer comme POURVU",
  profile_archive: "Archiver",
  profile_security: "Sécurité du compte",
  profile_change_password: "Changer le mot de passe",
  profile_general_settings: "Paramètres généraux",
  profile_language: "Langue de l'app",
  profile_terms: "Conditions d'utilisation",
  profile_support: "Contacter l'assistance",
  profile_logout: "Se déconnecter",
  profile_delete: "Supprimer mon compte",
  profile_delete_title: "Supprimer votre compte ?",
  profile_delete_desc: "Cette action est irréversible. Toutes vos données, mémoires et annonces seront définitivement supprimés.",
  profile_delete_confirm: "Confirmation de sécurité",
  profile_delete_placeholder: "Entrez votre mot de passe",
  profile_delete_button: "Supprimer définitivement",
  profile_photo_updated: "Photo de profil mise à jour !",
  profile_photo_too_large: "L'image ne doit pas dépasser 2 Mo.",
  profile_photo_invalid: "Fichier non supporté. Utilisez une image.",

  // Public profile
  public_profile: "Profil PHENIX",
  public_share: "Partager le profil",
  public_report: "Signaler",
  public_online: "En ligne",
  public_not_found: "Profil introuvable",
  public_not_found_desc: "Cet utilisateur n'existe pas ou a supprimé son profil.",
  public_whatsapp: "Contacter via WhatsApp",
  public_linkedin: "Profil LinkedIn",
  public_stats: "Statistiques Mentor",
  public_docs_published: "Mémoires publiés",
  public_collabs: "Collaborations",
  public_works: "Travaux publiés",
  public_expertise: "Expertise & Bio",
  public_announcements: "Annonces de collaboration",

  // Terms
  terms_title: "Conditions d'utilisation",
  terms_last_updated: "Dernière mise à jour",
  terms_welcome: "Bienvenue sur PHENIX",

  // Nexus
  nexus_title: "Nexus",
  nexus_create: "Créer une annonce",
  nexus_search: "Rechercher une annonce...",
  nexus_no_results: "Aucune annonce trouvée",

  // Chat
  chat_title: "Assistant IA",
  chat_placeholder: "Posez votre question...",
  chat_history: "Historique",

  // Dashboard
  dashboard_title: "Dashboard",
  dashboard_welcome: "Bienvenue",

  // Nav
  nav_home: "Accueil",
  nav_library: "Bibliothèque",
  nav_chat: "Chat",
  nav_nexus: "Nexus",
  nav_profile: "Profil",

  // Languages
  lang_fr: "Français",
  lang_en: "English",
} as const;

export default fr;
export type TranslationKeys = keyof typeof fr;
