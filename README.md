# To run the dev server

1. get node js from https://nodejs.org/en/download
2. then use `npm install -g pnpm@latest-10`
3. then `pnpm i`
4. generate a secret for your webtokens `openssl rand -base64 32`
5. put that in root/.env like so:
NEXT_PRIVATE_JWT_SECRET="your_generated_secret_key"
HOST_URL="your-hostname.example.com"
6. insert your postgres database token into .env
7. and finally `pnpm run dev`

# To build and run the production server
1. `pnpm run build`
2. `pnpm start`

For Docker deployments, set `HOST_URL` in the container environment. The host page
reads this value at runtime, so the same image can be deployed with different
hostnames:

```yaml
services:
  towertech:
    environment:
      HOST_URL: tt.jake-purton.uk
      NEXT_PRIVATE_JWT_SECRET: your_generated_secret_key
```

Set `HOST_URL` to the hostname only, without `https://`. If it is not set, the
application falls back to the server's local IP address and port 3000.

## On Windows
You may need to use `cross-env` to set NODE_ENV to production