# SHOJUEN WORKBOARD backend setup

The current UI is a prototype using browser localStorage. The shared version should use Supabase for database, authentication and private file storage.

## Security model

- The Workboard page is not intended to be public.
- A person must authenticate through Supabase Auth.
- Being authenticated is not enough: the user's auth UUID must also exist in `public.app_users`.
- All business tables have Row Level Security enabled.
- Certificates/spec sheets live in the private `workboard-private` storage bucket.
- Commercial terms are authoritative only from `customer_prices`; AI must not infer or alter price, MOQ, freight or payment terms from email history.

## Intended identities

- owner: 松下さん
- member: employees such as あかねさん
- ai: future controlled integration identities for ChatGPT / Claude, ideally via server-side API routes rather than exposing service-role credentials

## Data model

- Wxxx: `work_items`
- Cxxx: `customers`
- Mxxx: `products`
- `customer_prices`: customer-specific approved commercial terms
- `work_item_products`: links work to products
- `work_events`: immutable-ish activity history such as outbound email, reply, sample shipment and decision
- `product_documents`: metadata pointing to files in private storage

## Setup sequence

1. Create a private Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Enable the desired Auth provider. Email magic-link or email/password is sufficient initially.
4. Add the approved users to `public.app_users` using their Supabase auth UUIDs.
5. Add the environment variables from `.env.example` to Vercel Preview and Production.
6. Replace localStorage reads/writes in `/sales-kanban` with authenticated Supabase queries.
7. Add a login gate before rendering any Workboard data.
8. Upload certificates through signed/private storage operations, never to the public GitHub repo.

## Important

Do not put a real Supabase service-role key into GitHub, client-side code or NEXT_PUBLIC_* variables.
