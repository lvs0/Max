#!/bin/bash

# ═══════════════════════════════════════════════════════════════
#  MAX One-Command Installer
#  Run AI. Own it. No cloud. No cost.
# ═══════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${CYAN}[MAX]${NC} $1"; }
success() { echo -e "${GREEN}[MAX]${NC} ✓ $1"; }
warn() { echo -e "${YELLOW}[MAX]${NC} ⚠ $1"; }
error() { echo -e "${RED}[MAX]${NC} ✗ $1"; }

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}   ${YELLOW}███╗   ███╗ █████╗ ██╗  ██╗${NC}                    ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}   ${YELLOW}████╗ ████║██╔══██╗╚██╗██╔╝${NC}                    ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}   ${YELLOW}██╔████╔██║███████║ ╚███╔╝ ${NC}                     ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}   ${YELLOW}██║╚██╔╝██║██╔══██║ ██╔██╗ ${NC}                     ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}   ${YELLOW}██║ ╚═╝ ██║██║  ██║██╔╝ ██╗${NC}                    ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}   ${YELLOW}╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝${NC}                    ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}          ${YELLOW}Multi-Agent eXecutor${NC}                      ${CYAN}║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# Check requirements
command -v python3 &>/dev/null || { error "Python 3 required. Install: sudo apt install python3 python3-venv"; exit 1; }
command -v curl &>/dev/null || { error "curl required. Install: sudo apt install curl"; exit 1; }

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
VENV_DIR="$SCRIPT_DIR/.venv"

log "Installing MAX in $SCRIPT_DIR"
echo ""

# Install Ollama (optional)
if ! command -v ollama &>/dev/null; then
    log "Installing Ollama (local LLM runtime)..."
    curl -fsSL https://ollama.ai/install.sh | sh 2>/dev/null || warn "Could not auto-install Ollama. Get it at https://ollama.ai"
fi

# Setup backend
log "Setting up Python environment..."
cd "$BACKEND_DIR"
python3 -m venv "$VENV_DIR"
source "$VENV_DIR/bin/activate"
pip install --upgrade pip -q
pip install -r requirements.txt -q
success "Backend ready"

# Setup frontend
if command -v node &>/dev/null; then
    log "Setting up frontend..."
    cd "$FRONTEND_DIR"
    npm install --silent 2>/dev/null || npm install
    success "Frontend ready"
else
    warn "Node.js not found. Frontend will use pre-built files."
fi

# Create .env
cd "$BACKEND_DIR"
if [ ! -f .env ]; then
    cat > .env << 'EOF'
# Groq API Key (optional - free at https://console.groq.com)
# GROQ_API_KEY=gsk_...

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
MAX_MODEL=llama3
MAX_DB=max_memory.db
EOF
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}                   ${GREEN}Installation Complete!${NC}                   ${GREEN}║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${YELLOW}Next steps:${NC}"
echo ""
echo -e "  1. ${CYAN}Pull a model:${NC}"
echo -e "     ${GREEN}ollama pull llama3${NC}"
echo ""
echo -e "  2. ${CYAN}Start MAX:${NC}"
echo -e "     ${GREEN}./start.sh${NC}"
echo ""
echo -e "  3. ${CYAN}Open in browser:${NC}"
echo -e "     ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "  ${YELLOW}For Groq (faster):${NC} Get a free key at https://console.groq.com"
echo "              Then edit backend/.env and add your key"
echo ""
