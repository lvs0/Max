#!/bin/bash

# ═══════════════════════════════════════════════════════════════
#  MAX - Multi-Agent eXecutor
#  Run AI. Own it. No cloud. No cost.
# ═══════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
VENV_DIR="$SCRIPT_DIR/.venv"

# Functions
log() { echo -e "${CYAN}[MAX]${NC} $1"; }
success() { echo -e "${GREEN}[MAX]${NC} ✓ $1"; }
warn() { echo -e "${YELLOW}[MAX]${NC} ⚠ $1"; }
error() { echo -e "${RED}[MAX]${NC} ✗ $1"; }

header() {
    echo ""
    echo -e "${PURPLE}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${NC}   ${CYAN}███╗   ███╗ █████╗ ██╗  ██╗${NC}                    ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${NC}   ${CYAN}████╗ ████║██╔══██╗╚██╗██╔╝${NC}                    ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${NC}   ${CYAN}██╔████╔██║███████║ ╚███╔╝ ${NC}                     ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${NC}   ${CYAN}██║╚██╔╝██║██╔══██║ ██╔██╗ ${NC}                     ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${NC}   ${CYAN}██║ ╚═╝ ██║██║  ██║██╔╝ ██╗${NC}                    ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${NC}   ${CYAN}╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝${NC}                    ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${NC}          ${CYAN}Multi-Agent eXecutor${NC}                      ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${NC}          ${YELLOW}Run AI. Own it. No cloud. No cost.${NC}         ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
}

check_python() {
    if ! command -v python3 &> /dev/null; then
        error "Python 3 not found. Please install Python 3.11+"
        exit 1
    fi
    log "Python $(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))') detected"
}

check_node() {
    if command -v node &> /dev/null; then
        log "Node.js $(node -v) detected"
    else
        warn "Node.js not found. Frontend won't be available."
    fi
}

check_ollama() {
    if command -v ollama &> /dev/null; then
        if curl -s http://localhost:11434/api/tags &> /dev/null; then
            success "Ollama is running"
            OLLAMA_AVAILABLE=true
        else
            warn "Ollama installed but not running. Starting..."
            nohup ollama serve &>/dev/null &
            sleep 3
            if curl -s http://localhost:11434/api/tags &> /dev/null; then
                success "Ollama started"
                OLLAMA_AVAILABLE=true
            fi
        fi
    else
        warn "Ollama not found. Install from https://ollama.ai"
        OLLAMA_AVAILABLE=false
    fi
}

setup_backend() {
    log "Setting up backend..."
    cd "$BACKEND_DIR"
    
    if [ ! -d "$VENV_DIR" ]; then
        log "Creating virtual environment..."
        python3 -m venv "$VENV_DIR"
    fi
    
    source "$VENV_DIR/bin/activate"
    pip install --upgrade pip -q
    pip install -r requirements.txt -q
    success "Backend ready"
}

setup_frontend() {
    if ! command -v node &> /dev/null; then return; fi
    
    log "Setting up frontend..."
    cd "$FRONTEND_DIR"
    
    if [ ! -d "node_modules" ]; then
        npm install --silent 2>/dev/null || npm install
    fi
    success "Frontend ready"
}

start_backend() {
    log "Starting backend..."
    
    source "$VENV_DIR/bin/activate"
    cd "$BACKEND_DIR"
    
    if [ ! -f .env ]; then
        cat > .env << 'EOF'
# Groq API Key (optional - free at https://console.groq.com)
# GROQ_API_KEY=your_key_here

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
MAX_MODEL=llama3
MAX_DB=max_memory.db
EOF
        warn "Created .env - edit to add Groq API key for faster inference"
    fi
    
    nohup python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload > "$SCRIPT_DIR/.max_backend.log" 2>&1 &
    echo $! > "$SCRIPT_DIR/.max_backend.pid"
    sleep 3
    
    if curl -s http://localhost:8000/health &> /dev/null; then
        success "Backend running at http://localhost:8000"
    else
        error "Backend failed. Check $SCRIPT_DIR/.max_backend.log"
    fi
}

start_frontend() {
    if ! command -v node &> /dev/null; then return; fi
    
    log "Starting frontend..."
    cd "$FRONTEND_DIR"
    
    nohup npm run dev > "$SCRIPT_DIR/.max_frontend.log" 2>&1 &
    echo $! > "$SCRIPT_DIR/.max_frontend.pid"
    sleep 5
    
    if curl -s http://localhost:3000 &> /dev/null; then
        success "Frontend running at http://localhost:3000"
    fi
}

stop() {
    log "Stopping MAX..."
    [ -f "$SCRIPT_DIR/.max_backend.pid" ] && kill $(cat "$SCRIPT_DIR/.max_backend.pid") 2>/dev/null || true
    [ -f "$SCRIPT_DIR/.max_frontend.pid" ] && kill $(cat "$SCRIPT_DIR/.max_frontend.pid") 2>/dev/null || true
    rm -f "$SCRIPT_DIR/.max_"*.{pid,log}
    pkill -f "ollama serve" 2>/dev/null || true
    success "MAX stopped"
}

status() {
    echo ""
    curl -s http://localhost:8000/health &> /dev/null && success "Backend: Running" || error "Backend: Stopped"
    curl -s http://localhost:3000 &> /dev/null && success "Frontend: Running" || error "Frontend: Stopped"
    curl -s http://localhost:11434/api/tags &> /dev/null && success "Ollama: Running" || warn "Ollama: Stopped"
    echo ""
}

logs() {
    [ -f "$SCRIPT_DIR/.max_backend.log" ] && tail -30 "$SCRIPT_DIR/.max_backend.log"
}

open_ui() {
    if command -v xdg-open &> /dev/null; then xdg-open http://localhost:3000
    elif command -v open &> /dev/null; then open http://localhost:3000
    else log "Open http://localhost:3000 in browser"; fi
}

install() {
    header
    log "Installing MAX..."
    check_python && check_node && check_ollama
    setup_backend && setup_frontend
    success "Installation complete! Run './start.sh' to start MAX"
}

main() {
    header
    
    case "${1:-start}" in
        start)
            check_python && check_node && check_ollama
            setup_backend && setup_frontend
            start_backend && start_frontend
            echo ""
            success "MAX is running!"
            echo ""
            echo -e "  ${CYAN}→ UI:    ${GREEN}http://localhost:3000${NC}"
            echo -e "  ${CYAN}→ API:   ${GREEN}http://localhost:8000${NC}"
            echo -e "  ${CYAN}→ Docs:  ${GREEN}http://localhost:8000/docs${NC}"
            echo ""
            trap 'stop' INT TERM
            wait
            ;;
        stop) stop ;;
        restart) stop; sleep 2; main start ;;
        status) status ;;
        logs) logs ;;
        open) open_ui ;;
        install) install ;;
        help|--help|-h)
            echo "MAX - Multi-Agent eXecutor"
            echo ""
            echo "Commands:"
            echo "  start     Start MAX (default)"
            echo "  stop      Stop MAX"
            echo "  restart   Restart MAX"
            echo "  status    Show status"
            echo "  logs      Show backend logs"
            echo "  open      Open UI in browser"
            echo "  install   Install dependencies"
            echo "  help      Show this help"
            ;;
        *) error "Unknown: $1" ;;
    esac
}

main "$@"
