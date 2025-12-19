# Edge Functions Server for Self-Hosted Supabase
FROM denoland/deno:1.42.0

# Set working directory
WORKDIR /app

# Copy functions directory
COPY supabase/functions ./functions
COPY supabase/config.toml ./config.toml

# Create main server file
COPY edge-functions-server.ts ./server.ts

# Cache dependencies
RUN deno cache server.ts

# Expose port
EXPOSE 8000

# Healthcheck using Deno's fetch
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD deno eval "fetch('http://localhost:8000/health').then(r => r.ok ? Deno.exit(0) : Deno.exit(1))" || exit 1

# Run the server
CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "server.ts"]

