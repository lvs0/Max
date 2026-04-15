#!/bin/bash

# MAX Loop Integration Script
# Demonstrates how MAX can prepare data for Loop fine-tuning format

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   MAX + Loop Integration                           ║"
echo "║   Prepare conversations for LLM fine-tuning        ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Loop Python module is available
if python3 -c "import loop" 2>/dev/null; then
    echo -e "${GREEN}✓ Loop module found${NC}"
else
    echo "Installing Loop..."
    if [ -d "/tmp/minimax/lvs0-repos/Loop" ]; then
        pip install /tmp/minimax/lvs0-repos/Loop -q 2>/dev/null || true
    fi
fi

# MAX can help prepare conversation data for Loop format
echo ""
echo "MAX can help you:"
echo "  1. Extract conversation data from MAX sessions"
echo "  2. Format data for Loop binary format"
echo "  3. Prepare fine-tuning datasets"
echo ""
echo "Example MAX prompt:"
echo '  "Export my conversation history and convert to Loop format for fine-tuning"'
echo ""
echo "The Loop format uses binary .loop files optimized for:"
echo "  • Streaming with random access (seek to block N)"
echo "  • Minimal RAM (max 512 records per block)"
echo "  • Zstd compression (level 9)"
echo "  • CRC64 integrity checks"
echo ""
echo "See: https://github.com/lvs0/Loop"
