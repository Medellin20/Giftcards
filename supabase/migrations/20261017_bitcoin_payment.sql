alter table public.orders
  add column if not exists payment_method text,
  add column if not exists bitcoin_address text,
  add column if not exists bitcoin_sats bigint check (bitcoin_sats > 0),
  add column if not exists bitcoin_rate_eur numeric check (bitcoin_rate_eur > 0),
  add column if not exists bitcoin_expires_at timestamptz,
  add column if not exists bitcoin_txid text unique;
