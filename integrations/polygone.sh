#!/bin/bash

# MAX + Polygone Integration Script
# Run MAX with privacy-preserving network capabilities

set -e

CYAN='\033[0;36m'
PURPLE='\033[0;35m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   MAX + Polygone Integration                        ║"
echo "║   Privacy-preserving AI Agent                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Polygone is installed
if command -v polygone &> /dev/null; then
    echo -e "${GREEN}✓ Polygone CLI found${NC}"
    polygone --version 2>/dev/null || true
else
    echo "Installing Polygone..."
    if [ -d "/tmp/minimax/lvs0-repos/Polygone" ]; then
        cd /tmp/minimax/lvs0-repos/Polygone && cargo build --release 2>/dev/null || \
        curl -fsSL https://raw.githubusercontent.com/lvs0/Polygone/main/install.sh | bash
    else
        curl -fsSL https://raw.githubusercontent.com/lvs0/Polygone/main/install.sh | bash
    fi
fi

echo ""
echo "Architecture:"
echo ""
echo "  ┌─────────────────────────────────────────────────┐"
echo "  │                    MAX AGENT                     │"
echo "  │  ┌─────────┐  ┌──────────┐  ┌───────────────┐ │"
echo "  │  │  Tasks  │  │  Chat    │  │  Sub-Agents   │ │"
echo "  │  └────┬────┘  └────┬─────┘  └───────┬───────┘ │"
echo "  │       │             │                │          │"
echo "  │       └─────────────┼────────────────┘          │"
echo "  │                     │                           │"
echo "  └─────────────────────┼───────────────────────────┘"
echo "                        │"
echo "                        ▼"
echo "  ┌─────────────────────────────────────────────────┐"
echo "  │               Polygone Network                   │"
echo "  │  ┌─────────────────────────────────────────┐   │"
echo "  │  │  ML-KEM-1024 (post-quantum key exchange)│   │"
echo "  │  │  ML-DSA-87  (signatures)                │   │"
echo "  │  │  AES-256-GCM (encryption)               │   │"
echo "  │  │  Shamir Secret Sharing                  │   │"
echo "  │  └─────────────────────────────────────────┘   │"
echo "  │                                                 │"
echo "  │  • No metadata leakage                         │"
echo "  │  • Ephemeral sessions                          │"
echo "  │  • Post-quantum secure                         │"
echo "  └─────────────────────────────────────────────────┘"
echo ""
echo "Benefits of MAX + Polygone:"
echo "  • Your prompts never leave without encryption"
echo "  • Post-quantum security (NIST Level 5)"
echo "  • No metadata correlation"
echo "  • Distributed inference (future: Petals)"
echo ""
echo "See: https://github.com/lvs0/Polygone"
