# CashDash

### Setting Up The Project

For local development, you need to create two .env files. This is because there are separate API keys/environment variables that are needed for the client and server. Within the /server folder, add the SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY env variables that can be found in the group text. Within /client, add the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY variables. Without adding these files the application will not be able to access supabase and subsequently you won't be able to access anything more than the signin page.

### Running the Project

Run the following command in cashdash_code/server to start the server
```
npm run start
```

Run the following command in cashdash_code/client to start the client.
```
npm run start
```
