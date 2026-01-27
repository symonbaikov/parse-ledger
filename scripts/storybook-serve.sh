#!/bin/bash

# Script to serve Storybook from CI artifacts
# Usage: ./scripts/storybook-serve.sh [artifact-name] [port]

set -e

ARTIFACT_NAME="${1:-storybook-ci}"
PORT="${2:-6006}"
TEMP_DIR=".storybook-temp"

echo "📚 Storybook Serve Script"
echo "=========================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    echo "Please run this script from the repository root"
    exit 1
fi

# Create temporary directory
mkdir -p "$TEMP_DIR"

# Function to cleanup
cleanup() {
    echo "🧹 Cleaning up temporary files..."
    rm -rf "$TEMP_DIR"
}

trap cleanup EXIT

# Download artifact if it doesn't exist
if [ ! -d "$TEMP_DIR/storybook-static" ]; then
    echo "📥 Downloading Storybook artifact: $ARTIFACT_NAME"
    
    # Check if gh CLI is available
    if ! command -v gh &> /dev/null; then
        echo "❌ Error: GitHub CLI (gh) is not installed"
        echo "Please install it first: https://cli.github.com/"
        exit 1
   
    
...
    
    # Download the latest artifact
    if ! gh run download --name "$ARTIFACT_NAME" --dir "$TEMP_DIR" 2>/dev/null; then
        echo "❌ Error: Failed to download artifact '$ARTIFACT_NAME'"
        echo "Available artifacts:"
        gh run list --limit 5 --json "databaseId,headBranch,status,conclusion" --jq '.[] | "\(.databaseId) - \(.headBranch) (\(.status)/\(.conclusion))"'
        exit 1
    fi
    
    echo "✅ Artifact downloaded successfully"
else
    echo "📁 Using existing Storybook files"
fi

# Check if Storybook files exist
if [ ! -d "$TEMP_DIR/storybook-static" ]; then
    echo "❌ Error: Storybook files not found in artifact"
    echo "Expected directory: $TEMP_DIR/storybook-static"
    exit 1
fi

# Check if http-server is available
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx is not available"
    echo "Please ensure Node.js and npm are installed"
    exit 1
fi

echo "🚀 Starting Storybook server..."
echo "   Port: $PORT"
echo "   Directory: $TEMP_DIR/storybook-static"
echo ""
echo "🌐 Storybook will be available at: http://localhost:$PORT"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
cd "$TEMP_DIR/storybook-static"
npx http-server . -p "$PORT" -c-1 --cors