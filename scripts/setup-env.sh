#!/bin/bash

# Environment Setup Script
# Usage: ./scripts/setup-env.sh [dev|stg|prod]

ENV=${1:-dev}

if [ "$ENV" != "dev" ] && [ "$ENV" != "stg" ] && [ "$ENV" != "prod" ]; then
  echo "Error: Invalid environment. Use 'dev', 'stg', or 'prod'"
  exit 1
fi

ENV_FILE="env.${ENV}.example"
TARGET_FILE=".env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: Environment file $ENV_FILE not found"
  exit 1
fi

cp "$ENV_FILE" "$TARGET_FILE"
echo "✓ Created .env file from $ENV_FILE for $ENV environment"
echo "⚠ Please review and update the .env file with your actual values"
