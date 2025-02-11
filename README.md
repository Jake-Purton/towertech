# TO RUN THE SERVER

1. get node js from https://nodejs.org/en/download
2. then use `npm install -g pnpm@latest-10`
3. then `pnpm i`
4. and finally `pnpm run dev`

# If you need to set environment variables (secrets)
this is likely to be for the database key, and for the jwt key for user authentication
1. generate a secret key with `openssl rand -base64 32`
2. put that in root/.env.local like so:
NEXT_PRIVATE_JWT_SECRET="your_generated_secret_key"
