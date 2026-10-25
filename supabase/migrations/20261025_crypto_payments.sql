alter table public.orders
  add column if not exists crypto_currency text check (crypto_currency in ('BTC', 'ETH', 'USDT')),
  add column if not exists crypto_address text,
  add column if not exists crypto_network text,
  add column if not exists crypto_amount numeric check (crypto_amount > 0),
  add column if not exists crypto_rate_eur numeric check (crypto_rate_eur > 0),
  add column if not exists crypto_expires_at timestamptz,
  add column if not exists crypto_txid text unique;
