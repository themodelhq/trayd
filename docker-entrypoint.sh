#!/bin/sh
# ============================================================
# Tray'd - Docker Entrypoint
# @description Generates the .z-ai-config file that the
#              z-ai-web-dev-sdk package requires (it only reads
#              config from a JSON file on disk - it has no
#              environment-variable support of its own), so that
#              the ZAI_SDK_API_KEY / ZAI_SDK_BASE_URL env vars set
#              in Render/Netlify's dashboard actually take effect.
#              Runs on every container start, before the server.
# ============================================================
set -e

if [ -n "$ZAI_SDK_API_KEY" ] && [ -n "$ZAI_SDK_BASE_URL" ]; then
  cat > /app/.z-ai-config <<EOF
{
  "baseUrl": "${ZAI_SDK_BASE_URL}",
  "apiKey": "${ZAI_SDK_API_KEY}"${ZAI_SDK_CHAT_ID:+,
  "chatId": "${ZAI_SDK_CHAT_ID}"}${ZAI_SDK_USER_ID:+,
  "userId": "${ZAI_SDK_USER_ID}"}
}
EOF
  echo "[entrypoint] Wrote .z-ai-config for AI features."
elif [ -n "$ZAI_SDK_API_KEY" ]; then
  echo "[entrypoint] WARNING: ZAI_SDK_API_KEY is set but ZAI_SDK_BASE_URL is not - skipping .z-ai-config (the SDK requires both). AI chat/analysis endpoints will be unavailable."
else
  echo "[entrypoint] ZAI_SDK_API_KEY not set - AI chat/analysis endpoints will be unavailable."
fi

exec "$@"
