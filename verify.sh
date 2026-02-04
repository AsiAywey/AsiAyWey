#!/bin/bash
# Quick verification script for MatchFlow setup

echo ""
echo "======================================"
echo "  ✅ MatchFlow Setup Verification"
echo "======================================"
echo ""

# Check files
echo "[1/5] Checking files..."

files=(
  "login.html" "login.js"
  "dashboard.html" "dashboard.js"
  "candidate.html" "candidate.js"
  "jobs.html" "jobs.js"
  "companies/index.html" "companies/company.js"
  "general/db.json" "general/api.js" "general/cache.js"
  "TEST.html" "QUICK_START.md" "README.md" "SUMMARY.md"
  "START_SERVER.bat" "START_SERVER.ps1"
)

missing=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MISSING)"
    ((missing++))
  fi
done

echo ""
if [ $missing -eq 0 ]; then
  echo "[2/5] ✅ All files present"
else
  echo "[2/5] ❌ Missing $missing files"
  exit 1
fi

# Check db.json structure
echo ""
echo "[3/5] Checking db.json structure..."
if grep -q '"candidates"' general/db.json && \
   grep -q '"companies"' general/db.json && \
   grep -q '"jobOffers"' general/db.json && \
   grep -q '"matches"' general/db.json && \
   grep -q '"reservations"' general/db.json; then
  echo "  ✅ All collections present"
else
  echo "  ❌ Missing collections in db.json"
  exit 1
fi

# Check npm
echo ""
echo "[4/5] Checking npm..."
if command -v npm &> /dev/null; then
  echo "  ✅ npm is installed"
  echo "  Version: $(npm --version)"
else
  echo "  ❌ npm not found (install Node.js)"
  exit 1
fi

# Check json-server
echo ""
echo "[5/5] Checking json-server..."
if npm list -g json-server &> /dev/null; then
  echo "  ✅ json-server is installed"
else
  echo "  ⚠️  json-server not installed"
  echo "  Run: npm install -g json-server"
fi

echo ""
echo "======================================"
echo "  ✅ All checks passed!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Run: json-server --watch general/db.json --port 3001"
echo "2. Open login.html in browser"
echo "3. Enjoy MatchFlow! 🚀"
echo ""
