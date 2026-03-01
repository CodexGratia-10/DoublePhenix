#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════
#
#   ██████╗ ██╗  ██╗███████╗███╗   ██╗██╗██╗  ██╗
#   ██╔══██╗██║  ██║██╔════╝████╗  ██║██║╚██╗██╔╝
#   ██████╔╝███████║█████╗  ██╔██╗ ██║██║ ╚███╔╝
#   ██╔═══╝ ██╔══██║██╔══╝  ██║╚██╗██║██║ ██╔██╗
#   ██║     ██║  ██║███████╗██║ ╚████║██║██╔╝ ██╗
#   ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝
#
#   Script de Setup Automatique — PHENIX · Hack4IFRI 2026
#   Compatible : Linux · macOS · Windows (Git Bash / WSL)
#
#   UTILISATION :
#     Linux/Mac  →  chmod +x setup.sh && ./setup.sh
#     Windows    →  bash setup.sh  (dans Git Bash)
#
# ══════════════════════════════════════════════════════════════════════

# ── Couleurs ──────────────────────────────────────────────────────────
if [ -t 1 ]; then
  RED='\033[0;31m';GREEN='\033[0;32m';YELLOW='\033[1;33m'
  BLUE='\033[0;34m';TEAL='\033[0;36m';BOLD='\033[1m'
  DIM='\033[2m';RESET='\033[0m'
else
  RED='';GREEN='';YELLOW='';BLUE='';TEAL='';BOLD='';DIM='';RESET=''
fi

# ── Fonctions ─────────────────────────────────────────────────────────
print_header()  { echo ""; echo -e "${TEAL}${BOLD}══════════════════════════════════════════════${RESET}"; echo -e "${TEAL}${BOLD}  $1${RESET}"; echo -e "${TEAL}${BOLD}══════════════════════════════════════════════${RESET}"; echo ""; }
print_step()    { echo -e "${BLUE}${BOLD}    $1${RESET}"; }
print_success() { echo -e "${GREEN}    $1${RESET}"; }
print_warning() { echo -e "${YELLOW}     $1${RESET}"; }
print_error()   { echo -e "${RED}    $1${RESET}"; }
print_info()    { echo -e "${DIM}      $1${RESET}"; }
print_divider() { echo -e "${DIM}  ──────────────────────────────────────────────${RESET}"; }
command_exists(){ command -v "$1" >/dev/null 2>&1; }

# ── Détecter l'OS ─────────────────────────────────────────────────────
case "$(uname -s 2>/dev/null || echo 'Windows')" in
  Linux*)             OS="Linux" ;;
  Darwin*)            OS="Mac" ;;
  CYGWIN*|MINGW*|MSYS*) OS="Windows (Git Bash)" ;;
  *)                  OS="Unknown" ;;
esac

# ══════════════════════════════════════════════════════════════════════
clear 2>/dev/null || true
echo ""
echo -e "${TEAL}${BOLD}"
echo "   ██████╗ ██╗  ██╗███████╗███╗   ██╗██╗██╗  ██╗"
echo "   ██╔══██╗██║  ██║██╔════╝████╗  ██║██║╚██╗██╔╝"
echo "   ██████╔╝███████║█████╗  ██╔██╗ ██║██║ ╚███╔╝ "
echo "   ██╔═══╝ ██╔══██║██╔══╝  ██║╚██╗██║██║ ██╔██╗ "
echo "   ██║     ██║  ██║███████╗██║ ╚████║██║██╔╝ ██╗"
echo "   ╚═╝     ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝"
echo -e "${RESET}"
echo -e "${BOLD}        Setup Automatique · Hack4IFRI 2026${RESET}"
echo ""
print_info "Système détecté : $OS"
echo ""

# ══════════════════════════════════════════════════════════════════════
#   ÉTAPE 1 : PRÉREQUIS
# ══════════════════════════════════════════════════════════════════════
print_header "ÉTAPE 1 — Vérification des prérequis"
ERRORS=0

print_step "Vérification de Node.js..."
if command_exists node; then
  NODE_VERSION=$(node --version 2>/dev/null)
  NODE_MAJOR=$(echo "$NODE_VERSION" | sed 's/v//' | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge 18 ] 2>/dev/null; then
    print_success "Node.js $NODE_VERSION — OK"
  else
    print_error "Node.js $NODE_VERSION — version 18+ requise"
    print_info "Télécharge la version LTS sur : https://nodejs.org"
    ERRORS=$((ERRORS + 1))
  fi
else
  print_error "Node.js non trouvé"
  print_info "Installe-le depuis : https://nodejs.org (bouton LTS)"
  ERRORS=$((ERRORS + 1))
fi

print_step "Vérification de npm..."
if command_exists npm; then
  print_success "npm v$(npm --version 2>/dev/null) — OK"
else
  print_error "npm non trouvé"
  ERRORS=$((ERRORS + 1))
fi

print_step "Vérification de Git..."
if command_exists git; then
  print_success "$(git --version 2>/dev/null) — OK"
else
  print_warning "Git non trouvé — installe-le depuis https://git-scm.com"
fi

if [ "$ERRORS" -gt 0 ]; then
  echo ""
  print_error "Installe les outils manquants ci-dessus, puis relance ce script."
  echo ""; exit 1
fi
echo ""

# ══════════════════════════════════════════════════════════════════════
#   ÉTAPE 2 : VÉRIFICATION DU DOSSIER
# ══════════════════════════════════════════════════════════════════════
print_header "ÉTAPE 2 — Vérification du projet"

print_step "Vérification du dossier courant..."
if [ ! -f "package.json" ]; then
  print_error "package.json non trouvé"
  print_info "Lance ce script depuis la RACINE du projet : cd phenix && bash setup.sh"
  echo ""; exit 1
fi
print_success "package.json trouvé — OK"

if grep -q '"next"' package.json 2>/dev/null; then
  print_success "Projet Next.js confirmé — OK"
else
  print_error "Ceci ne semble pas être le projet PHENIX"
  exit 1
fi
echo ""

# ══════════════════════════════════════════════════════════════════════
#   ÉTAPE 3 : NPM INSTALL
# ══════════════════════════════════════════════════════════════════════
print_header "ÉTAPE 3 — Installation des dépendances npm"

print_step "Lancement de npm install..."
print_info "Cela peut prendre 1 à 3 minutes selon ta connexion..."
echo ""

if npm install; then
  echo ""
  print_success "Toutes les dépendances installées"
else
  echo ""
  print_error "npm install a échoué — vérifie ta connexion et relance"
  exit 1
fi
echo ""

# ══════════════════════════════════════════════════════════════════════
#   ÉTAPE 4 : .env.local
# ══════════════════════════════════════════════════════════════════════
print_header "ÉTAPE 4 — Variables d'environnement"

if [ -f ".env.local" ]; then
  print_success ".env.local existe déjà — non écrasé"
  print_info "Supprime-le et relance si tu veux le recréer"
else
  if [ -f ".env.example" ]; then
    cp .env.example .env.local
    print_success ".env.local créé depuis .env.example"
  else
    cat > .env.local << 'ENVEOF'
# Remplir ces valeurs avec les bonnes clées API. 
NEXT_PUBLIC_SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=VOTRE_CLE_ANON_ICI
SUPABASE_SERVICE_ROLE_KEY=VOTRE_CLE_SERVICE_ROLE_ICI
GROQ_API_KEY=gsk_VOTRE_CLE_GROQ_ICI
GOOGLE_AI_API_KEY=AIzaSy_VOTRE_CLE_GOOGLE_AI_ICI
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENVEOF
    print_success ".env.local créé (vide)"
  fi
  echo ""
  print_warning "ACTION REQUISE — Remplis .env.local avec tes vraies clés !"
  print_divider
  echo -e "  ${YELLOW}NEXT_PUBLIC_SUPABASE_URL${RESET}      → supabase.com → Settings → API"
  echo -e "  ${YELLOW}NEXT_PUBLIC_SUPABASE_ANON_KEY${RESET} → supabase.com → Settings → API"
  echo -e "  ${YELLOW}SUPABASE_SERVICE_ROLE_KEY${RESET}     → supabase.com → Settings → API"
  echo -e "  ${YELLOW}GROQ_API_KEY${RESET}                  → console.groq.com → API Keys"
  echo -e "  ${YELLOW}GOOGLE_AI_API_KEY${RESET}             → aistudio.google.com"
  print_divider
fi
echo ""

# ══════════════════════════════════════════════════════════════════════
#   ÉTAPE 5 : FICHIERS LIB/SUPABASE
# ══════════════════════════════════════════════════════════════════════
print_header "ÉTAPE 5 — Vérification lib/supabase/"

[ ! -d "lib/supabase" ] && mkdir -p lib/supabase && print_success "Dossier lib/supabase/ créé"

MISSING=0
for FILE in "client.ts" "server.ts" "admin.ts"; do
  if [ -f "lib/supabase/$FILE" ]; then
    print_success "lib/supabase/$FILE — OK"
  else
    print_warning "lib/supabase/$FILE — MANQUANT → contacte le chef de projet"
    MISSING=$((MISSING + 1))
  fi
done

[ "$MISSING" -gt 0 ] && echo "" && print_info "Récupère les fichiers manquants dans le repo GitHub"
echo ""

# ══════════════════════════════════════════════════════════════════════
#   ÉTAPE 6 : SÉCURITÉ
# ══════════════════════════════════════════════════════════════════════
print_header "ÉTAPE 6 — Vérification sécurité"

print_step "Vérification .gitignore..."
if [ -f ".gitignore" ] && grep -q "\.env" .gitignore 2>/dev/null; then
  print_success ".env.local ignoré par Git — tes clés sont protégées"
else
  print_error ".env.local N'EST PAS dans .gitignore — DANGER !"
  print_info "Ajoute '.env*' dans ton .gitignore immédiatement"
fi
echo ""

# ══════════════════════════════════════════════════════════════════════
#   RAPPORT FINAL
# ══════════════════════════════════════════════════════════════════════
print_header "SETUP TERMINÉ"

echo -e "${GREEN}${BOLD}  Ce qui a été fait :${RESET}"
echo ""
print_success "Node.js et npm vérifiés"
print_success "Dépendances npm installées (node_modules/)"
print_success ".env.local créé (à remplir avec tes clés)"
print_success "Structure lib/supabase/ vérifiée"
print_success "Sécurité .gitignore vérifiée"

echo ""
print_divider
echo ""
echo -e "${BOLD}  PROCHAINES ÉTAPES :${RESET}"
echo ""
echo -e "  ${YELLOW}1.${RESET} Ouvre ${BOLD}.env.local${RESET} → remplace les valeurs fictives par tes vraies clés"
echo -e "  ${YELLOW}2.${RESET} Lance le serveur :"
echo ""
echo -e "     ${GREEN}${BOLD}npm run dev${RESET}"
echo ""
echo -e "  ${YELLOW}3.${RESET} Ouvre ${BOLD}http://localhost:3000${RESET} → si tu vois la page → tu es prêt ! 🎉"
echo ""
print_divider
echo ""
echo -e "  ${DIM}Problème ? Lisez le README.md ou écrivez moi !${RESET}"
echo ""
echo -e "${TEAL}${BOLD}  PHENIX  · Hack4IFRI 2026${RESET}"
echo ""
