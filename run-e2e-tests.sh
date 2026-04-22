# Run this script to run the activist e2e test suite.
# macOS: sh run-e2e-tests.sh
# Linux: bash run-e2e-tests.sh
# Windows: Please download WSL and run the Linux command above.
#
# Run from the repository root. Options:
#   -f <path>   Run a single Playwright spec. Path may be relative to frontend/
#               (e.g. test-e2e/specs/...) or include the frontend/ prefix from repo root.
#   -d          Desktop only (Playwright project "Desktop Chrome").
#   -m          Mobile only (Playwright project "Mobile Chrome").
#   -h, --help  Show usage.
#
# With no -d/-m, both desktop and mobile run (default). -d and -m together is the same
# as neither (both projects).
#
# Examples:
#   sh run-e2e-tests.sh
#   sh run-e2e-tests.sh -d
#   sh run-e2e-tests.sh -f test-e2e/specs/all/organizations/organization-about/organization-about-qr-code.spec.ts
#   sh run-e2e-tests.sh -f frontend/test-e2e/specs/all/foo.spec.ts -m

E2E_FILE=""
E2E_PLATFORM_DESKTOP=0
E2E_PLATFORM_MOBILE=0

usage() {
  cat <<'EOF'
Usage: sh run-e2e-tests.sh [options]

  -f <path>   Run a single Playwright spec file instead of the full suite.
              After cd frontend, path may be:
                - relative to frontend/ (e.g. test-e2e/specs/all/.../foo.spec.ts), or
                - prefixed with frontend/ when given from the repository root, or
                - an absolute path to the spec file.
  -d          Run desktop tests only (Desktop Chrome).
  -m          Run mobile tests only (Mobile Chrome).
  -h, --help  Print this message and exit (does not start Docker or run tests).

If neither -d nor -m is passed, both desktop and mobile run.

Examples:
  sh run-e2e-tests.sh
  sh run-e2e-tests.sh -d
  sh run-e2e-tests.sh -m
  sh run-e2e-tests.sh -f test-e2e/specs/all/foo.spec.ts
  sh run-e2e-tests.sh -f frontend/test-e2e/specs/all/foo.spec.ts -d
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    -f)
      if [ -z "${2:-}" ]; then
        echo "run-e2e-tests.sh: -f requires a file path" >&2
        exit 1
      fi
      E2E_FILE="$2"
      shift 2
      ;;
    -d)
      E2E_PLATFORM_DESKTOP=1
      shift
      ;;
    -m)
      E2E_PLATFORM_MOBILE=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "run-e2e-tests.sh: unknown option: $1" >&2
      echo "Try '-h' for usage." >&2
      exit 1
      ;;
  esac
done

if [ "$E2E_PLATFORM_DESKTOP" -eq 0 ] && [ "$E2E_PLATFORM_MOBILE" -eq 0 ]; then
  E2E_PLATFORM_DESKTOP=1
  E2E_PLATFORM_MOBILE=1
fi

# Start the backend and database (USE_PREVIEW skips full build inside Docker):
USE_PREVIEW=true docker compose --env-file .env.dev up backend db -d

# Set the environment variables and run the frontend:
cd frontend
set -a && . ../.env.dev && set +a

# Resolve optional spec path (fail before long build/install).
PLAYWRIGHT_SPEC=""
if [ -n "$E2E_FILE" ]; then
  ef="$E2E_FILE"
  case "$ef" in
    ./*) ef="${ef#./}" ;;
  esac

  case "$ef" in
    /*)
      if [ -f "$ef" ]; then
        PLAYWRIGHT_SPEC="$ef"
      fi
      ;;
    *)
      if [ -f "$ef" ]; then
        PLAYWRIGHT_SPEC="$ef"
      else
        stripped="${ef#frontend/}"
        if [ "$stripped" != "$ef" ] && [ -f "$stripped" ]; then
          PLAYWRIGHT_SPEC="$stripped"
        fi
      fi
      ;;
  esac

  if [ -z "$PLAYWRIGHT_SPEC" ]; then
    echo "run-e2e-tests.sh: spec file not found: $E2E_FILE" >&2
    echo "Hint: paths are resolved from frontend/ (e.g. test-e2e/specs/...) or use frontend/... from repo root." >&2
    cd ..
    docker compose --env-file .env.dev down
    exit 1
  fi
fi

# USE_PREVIEW=true switches the Nitro preset to node-server (outputs to .output/)
# so that `yarn preview` (nuxi preview) can serve it. Without this, the build
# uses the netlify-static preset (outputs to dist/) and yarn preview fails.
export USE_PREVIEW=true

# Install dependencies and build + serve the frontend in preview mode:
corepack enable
yarn install
# Remove any previous static build so nuxi preview uses .output/ (node-server) not dist/ (netlify-static).
rm -rf dist
echo "Building frontend (this takes ~2 minutes)..."
yarn build:local
echo "Starting frontend server..."
# Kill any leftover server from a previous run using lsof directly (yarn kill-port can block).
lsof -ti tcp:3000 | xargs kill -9 2>/dev/null || true
# Start the node server directly with explicit env vars.
# nohup yarn preview strips env vars in some shells; node directly is reliable.
nohup env NUXT_SESSION_PASSWORD="$NUXT_SESSION_PASSWORD" NUXT_API_SECRET="" node .output/server/index.mjs > /dev/null 2>&1 &

# Wait for the preview server to be ready before running tests.
# Spin a background progress indicator so it's clear the script is not hung.
(
  chars="/-\|"
  i=0
  while true; do
    i=$(( (i + 1) % 4 ))
    printf "\rWaiting for frontend... %s" "${chars:$i:1}"
    sleep 0.5
  done
) &
SPINNER_PID=$!

for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/ > /dev/null 2>&1; then
    kill $SPINNER_PID 2>/dev/null
    wait $SPINNER_PID 2>/dev/null
    printf "\rFrontend ready.          \n"
    break
  fi
  sleep 2
done

# Run the e2e test suite (SKIP_WEBSERVER tells Playwright to reuse the running server):
export SKIP_WEBSERVER=true
export TEST_ENV=local

if [ -n "$PLAYWRIGHT_SPEC" ]; then
  if [ "$E2E_PLATFORM_DESKTOP" -eq 1 ] && [ "$E2E_PLATFORM_MOBILE" -eq 1 ]; then
    npx playwright test --project='Desktop Chrome' --project='Mobile Chrome' "$PLAYWRIGHT_SPEC"
  elif [ "$E2E_PLATFORM_DESKTOP" -eq 1 ]; then
    npx playwright test --project='Desktop Chrome' "$PLAYWRIGHT_SPEC"
  else
    npx playwright test --project='Mobile Chrome' "$PLAYWRIGHT_SPEC"
  fi
elif [ "$E2E_PLATFORM_DESKTOP" -eq 1 ] && [ "$E2E_PLATFORM_MOBILE" -eq 1 ]; then
  yarn test:local
elif [ "$E2E_PLATFORM_DESKTOP" -eq 1 ]; then
  rm -rf blob-report
  yarn test:local:desktop || true
  yarn test:local:merge || true
else
  rm -rf blob-report
  yarn test:local:mobile || true
  yarn test:local:merge || true
fi

# Stop the frontend and Docker processes:
lsof -ti tcp:3000 | xargs kill -9 2>/dev/null || true

cd ..
docker compose --env-file .env.dev down
