#!/bin/bash
# SPDX-License-Identifier: AGPL-3.0-or-later

# Test batch runner with summary
# Usage: ./run-test-batches.sh [desktop|mobile]

set -e

PLATFORM="${1:-all}"
START_TIME=$(date +%s)

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
TOTAL_BATCHES=0
PASSED_BATCHES=0
FAILED_BATCHES=0
BATCH_TIMES=()
BATCH_NAMES=()
BATCH_TEST_COUNTS=()
TOTAL_TESTS_RUN=0
PASSED_TESTS=()
FAILED_TESTS=()
FAILED_TEST_REASONS=()

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🧪 Playwright E2E Test Suite - Batch Execution"
echo "════════════════════════════════════════════════════════════════"
echo "Platform: ${PLATFORM}"
echo "Started: $(date '+%Y-%m-%d %H:%M:%S')"
echo "════════════════════════════════════════════════════════════════"
echo ""

run_batch() {
    local batch_name=$1
    local batch_command=$2

    TOTAL_BATCHES=$((TOTAL_BATCHES + 1))
    BATCH_NAMES+=("$batch_name")

    echo ""
    echo -e "${CYAN}┌─────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│${NC} Batch $TOTAL_BATCHES: $batch_name"
    echo -e "${CYAN}└─────────────────────────────────────────────────────────────┘${NC}"

    # Clear browser state between batches to prevent memory buildup
    # This helps with cumulative slowdown during long test runs
    # Set SKIP_CLEANUP=true to disable
    if [ "$SKIP_CLEANUP" != "true" ]; then
        echo -e "${YELLOW}⟳ Clearing browser state...${NC}"
        rm -rf test-results/chromium test-results/webkit test-results/firefox 2>/dev/null || true
    fi

    BATCH_START=$(date +%s)

    # Capture output to extract test counts
    local output_file=$(mktemp)

    if npm run "$batch_command" 2>&1 | tee "$output_file"; then
        BATCH_END=$(date +%s)
        BATCH_DURATION=$((BATCH_END - BATCH_START))
        BATCH_TIMES+=("$BATCH_DURATION")
        PASSED_BATCHES=$((PASSED_BATCHES + 1))

        # Extract test count from Playwright output
        # Look for patterns like "5 passed (12.3s)" or "Total: 5 tests in 3 files"
        local test_count=$(grep -oE "([0-9]+) passed" "$output_file" | tail -1 | grep -oE "[0-9]+" || echo "0")
        if [ "$test_count" = "0" ]; then
            # Fallback: try to find "Total: X tests"
            test_count=$(grep -oE "Total: ([0-9]+) tests" "$output_file" | tail -1 | grep -oE "[0-9]+" || echo "0")
        fi
        BATCH_TEST_COUNTS+=("$test_count")
        TOTAL_TESTS_RUN=$((TOTAL_TESTS_RUN + test_count))

        # Extract individual test results (passed tests)
        while IFS= read -r line; do
            if [[ $line =~ ✓.*›.* ]]; then
                # Extract test name from Playwright output format
                test_name=$(echo "$line" | sed -E 's/^[[:space:]]*✓[[:space:]]*[0-9]*[[:space:]]*//; s/[[:space:]]*\([0-9.]+[a-z]+\)$//')
                PASSED_TESTS+=("$test_name")
            fi
        done < "$output_file"

        echo -e "${GREEN}✓ Batch completed successfully${NC} ($test_count tests, ${BATCH_DURATION}s)"
    else
        BATCH_END=$(date +%s)
        BATCH_DURATION=$((BATCH_END - BATCH_START))
        BATCH_TIMES+=("$BATCH_DURATION")
        FAILED_BATCHES=$((FAILED_BATCHES + 1))

        # Extract test count even on failure
        local test_count=$(grep -oE "([0-9]+) passed" "$output_file" | tail -1 | grep -oE "[0-9]+" || echo "0")
        if [ "$test_count" = "0" ]; then
            test_count=$(grep -oE "Total: ([0-9]+) tests" "$output_file" | tail -1 | grep -oE "[0-9]+" || echo "0")
        fi
        BATCH_TEST_COUNTS+=("$test_count")
        TOTAL_TESTS_RUN=$((TOTAL_TESTS_RUN + test_count))

        # Extract individual test results (both passed and failed)
        while IFS= read -r line; do
            if [[ $line =~ ✓.*›.* ]]; then
                test_name=$(echo "$line" | sed -E 's/^[[:space:]]*✓[[:space:]]*[0-9]*[[:space:]]*//; s/[[:space:]]*\([0-9.]+[a-z]+\)$//')
                PASSED_TESTS+=("$test_name")
            elif [[ $line =~ ✘.*›.* ]]; then
                test_name=$(echo "$line" | sed -E 's/^[[:space:]]*✘[[:space:]]*[0-9]*[[:space:]]*//; s/[[:space:]]*\([0-9.]+[a-z]+\)$//')
                FAILED_TESTS+=("$test_name")

                # Try to extract error reason (next few lines after failure)
                reason=""
                while IFS= read -r next_line; do
                    if [[ $next_line =~ Error:|Expected:|Received:|TimeoutError ]]; then
                        reason="$next_line"
                        break
                    fi
                done < <(grep -A 10 "$test_name" "$output_file" | tail -n +2)

                if [ -z "$reason" ]; then
                    reason="See test output for details"
                fi
                FAILED_TEST_REASONS+=("$reason")
            fi
        done < "$output_file"

        echo -e "${RED}✗ Batch failed${NC} ($test_count tests, ${BATCH_DURATION}s)"

        # Continue to next batch even if this one failed
        # Remove 'set -e' behavior for individual batches
    fi

    rm -f "$output_file"
}

# Run batches based on platform
if [ "$PLATFORM" = "desktop" ]; then
    run_batch "Unauthenticated (Desktop)" "test:batch:unauth:desktop"
    run_batch "Accessibility (Desktop)" "test:batch:a11y:auth:desktop"
    run_batch "Organizations (Desktop)" "test:batch:orgs:desktop"
    run_batch "CRUD Operations (Desktop)" "test:batch:crud:desktop"
    run_batch "Group Pages (Desktop)" "test:batch:groups:desktop"
    run_batch "Drag & Drop (Desktop)" "test:batch:dragdrop:desktop"
elif [ "$PLATFORM" = "mobile" ]; then
    run_batch "Unauthenticated (Mobile)" "test:batch:unauth:mobile"
    run_batch "Accessibility (Mobile)" "test:batch:a11y:auth:mobile"
    run_batch "Organizations (Mobile)" "test:batch:orgs:mobile"
    run_batch "CRUD Operations (Mobile)" "test:batch:crud:mobile"
    run_batch "Group Pages (Mobile)" "test:batch:groups:mobile"
    run_batch "Drag & Drop (Mobile)" "test:batch:dragdrop:mobile"
else
    run_batch "Unauthenticated" "test:batch:unauth"
    run_batch "Accessibility (Auth)" "test:batch:a11y:auth"
    run_batch "Organizations" "test:batch:orgs"
    run_batch "CRUD Operations" "test:batch:crud"
    run_batch "Group Pages" "test:batch:groups"
    run_batch "Drag & Drop" "test:batch:dragdrop"
fi

END_TIME=$(date +%s)
TOTAL_DURATION=$((END_TIME - START_TIME))

# Calculate stats
SLOWEST_BATCH=0
SLOWEST_BATCH_NAME=""
FASTEST_BATCH=999999
FASTEST_BATCH_NAME=""

for i in "${!BATCH_TIMES[@]}"; do
    if [ "${BATCH_TIMES[$i]}" -gt "$SLOWEST_BATCH" ]; then
        SLOWEST_BATCH="${BATCH_TIMES[$i]}"
        SLOWEST_BATCH_NAME="${BATCH_NAMES[$i]}"
    fi
    if [ "${BATCH_TIMES[$i]}" -lt "$FASTEST_BATCH" ]; then
        FASTEST_BATCH="${BATCH_TIMES[$i]}"
        FASTEST_BATCH_NAME="${BATCH_NAMES[$i]}"
    fi
done

# Print summary
echo ""
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📊 TEST SUITE EXECUTION SUMMARY"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo -e "${BLUE}Platform:${NC}         $PLATFORM"
echo -e "${BLUE}Total Duration:${NC}   ${TOTAL_DURATION}s ($(printf '%dm %ds' $((TOTAL_DURATION/60)) $((TOTAL_DURATION%60))))"
echo -e "${BLUE}Total Tests:${NC}      ${TOTAL_TESTS_RUN}"
echo ""
echo -e "${BLUE}Batches:${NC}"
echo "  Total:    $TOTAL_BATCHES"
echo -e "  Passed:   ${GREEN}$PASSED_BATCHES${NC}"
if [ $FAILED_BATCHES -gt 0 ]; then
    echo -e "  Failed:   ${RED}$FAILED_BATCHES${NC}"
else
    echo -e "  Failed:   $FAILED_BATCHES"
fi
echo ""

# Batch timing details
echo -e "${BLUE}Batch Details:${NC}"
for i in "${!BATCH_NAMES[@]}"; do
    duration="${BATCH_TIMES[$i]}"
    name="${BATCH_NAMES[$i]}"
    tests="${BATCH_TEST_COUNTS[$i]}"
    printf "  %-35s %3d tests  %4ds\n" "$name" "$tests" "$duration"
done
echo ""

echo -e "${BLUE}Performance:${NC}"
echo "  Slowest:  $SLOWEST_BATCH_NAME (${SLOWEST_BATCH}s)"
echo "  Fastest:  $FASTEST_BATCH_NAME (${FASTEST_BATCH}s)"
echo ""

# Test results section
echo "════════════════════════════════════════════════════════════════"
echo ""

# Passed tests
if [ ${#PASSED_TESTS[@]} -gt 0 ]; then
    echo -e "${GREEN}✓ PASSED TESTS (${#PASSED_TESTS[@]}):${NC}"
    echo ""
    for test in "${PASSED_TESTS[@]}"; do
        echo -e "  ${GREEN}✓${NC} $test"
    done
    echo ""
fi

# Failed tests
if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
    echo -e "${RED}✗ FAILED TESTS (${#FAILED_TESTS[@]}):${NC}"
    echo ""
    for i in "${!FAILED_TESTS[@]}"; do
        test="${FAILED_TESTS[$i]}"
        reason="${FAILED_TEST_REASONS[$i]}"
        echo -e "  ${RED}✗${NC} $test"
        echo -e "    ${YELLOW}→${NC} $reason"
        echo ""
    done
fi

echo "════════════════════════════════════════════════════════════════"
echo ""

# Final result
echo "════════════════════════════════════════════════════════════════"
if [ $FAILED_BATCHES -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL BATCHES PASSED!${NC}"
else
    echo -e "${RED}❌ $FAILED_BATCHES BATCH(ES) FAILED${NC}"
fi
echo "════════════════════════════════════════════════════════════════"
echo ""

# Exit with error code if any batches failed
if [ $FAILED_BATCHES -gt 0 ]; then
    exit 1
fi
