#!/bin/bash

# Script to download and prepare Storybook artifacts from GitHub Actions
# Usage: ./scripts/storybook-download.sh [run-id] [artifact-name]

set -e

RUN_ID="${1:-}"
ARTIFACT_NAME="${2:-storybook-ci}"
OUTPUT_DIR="storybook-downloaded"

echo "📥 Storybook Download Script"
echo "============================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    echo "Please run this script from the repository root"
    exit 1
fi

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed"
    echo "Please install it first: https://cli.github.com/"
    exit 1
fi

# If no run ID provided, get the latest successful run
if [ -z "$RUN_ID" ]; then
    echo "🔍 Finding latest successful CI run..."
    RUN_ID=$(gh run list --workflow="CI.yml" --status="success" --limit=1 --json "databaseId" --jq '.[0].databaseId')
    
    if [ -z "$RUN_ID" ]; then
        echo "❌ No successful CI runs found"
        echo "You can specify a run ID manually:"
        echo "  $0 <run-id>"
        exit 1
    fi
    
    echo "✅ Found run: $RUN_ID"
else
    echo "🎯 Using specified run: $RUN_ID"
fi

# Clean up previous downloads
if [ -d "$OUTPUT_DIR" ]; then
    echo "🧹 Cleaning up previous download..."
    rm -rf "$OUTPUT_DIR"
fi

# Download artifact
echo "📥 Downloading Storybook artifact..."
if ! gh run download "$RUN_ID" --name "$ARTIFACT_NAME" --dir "$OUTPUT_DIR"; then
    echo "❌ Error: Failed to download artifact"
    echo "Available artifacts for run $RUN_ID:"
    gh run view "$RUN_ID" --json "jobs" --jq '.jobs[] | select(.name | contains("storybook")) | "\(.name): \(.databaseId)"'
    exit 1
fi

# Check if Storybook files exist
if [ ! -d "$OUTPUT_DIR/storybook-static" ]; then
    echo "❌ Error: Storybook files not found in downloaded artifact"
    echo "Contents of $OUTPUT_DIR:"
    ls -la "$OUTPUT_DIR"
    exit 1
fi

echo "✅ Storybook downloaded successfully!"
echo ""
echo "📁 Location: $OUTPUT_DIR/storybook-static/"
echo ""
echo "🚀 To view Storybook locally:"
echo "  cd $OUTPUT_DIR/storybook-static"
echo "  npx http-server . -p 6006"
echo "  # Then open http://localhost:6006"
echo ""
echo "🌐 Or use the serve script:"
echo "  ./scripts/storybook-serve.sh $OUTPUT_DIR"