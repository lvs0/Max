#!/bin/bash

# MAX Integrations Hub
# Connect MAX with the SOE ecosystem

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}   ${GREEN}MAX Integrations Hub${NC}                                ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}   Connect with the SOE ecosystem                   ${CYAN}║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

echo "Available integrations:"
echo ""
echo "  1. ${GREEN}Loop${NC}     - Fine-tuning data preparation"
echo "     Export MAX conversations to Loop binary format"
echo ""
echo "  2. ${GREEN}Polygone${NC}  - Privacy-preserving network"
echo "     Run MAX over post-quantum encrypted network"
echo ""
echo "  3. ${GREEN}Petals${NC}    - Distributed inference (future)"
echo "     Use Polygone-Petals for distributed LLM inference"
echo ""
echo "  4. ${GREEN}All${NC}       - Show all integration information"
echo ""

read -p "Select integration (1-4): " choice

case $choice in
    1)
        bash "$SCRIPT_DIR/loop.sh"
        ;;
    2)
        bash "$SCRIPT_DIR/polygone.sh"
        ;;
    3)
        echo ""
        echo -e "${YELLOW}Polygone-Petals integration is planned for future releases.${NC}"
        echo "This will allow MAX to use distributed inference networks."
        echo ""
        echo "See: https://github.com/lvs0/Polygone-Petals"
        ;;
    4)
        bash "$SCRIPT_DIR/loop.sh"
        echo ""
        bash "$SCRIPT_DIR/polygone.sh"
        ;;
    *)
        echo "Invalid option"
        ;;
esac
