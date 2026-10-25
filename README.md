# Cartes cadeaux — Cartes cadeaux (Next.js 14 · React · Tailwind · Supabase · Bitcoin)

## Installation

1. `npm install`
2. **Supabase** : créez un projet, puis exécutez `supabase/schema.sql` dans *SQL Editor*.
   Récupérez l'URL du projet et la clé `service_role` (Settings → API).
3. **Bitcoin** : renseignez `BITCOIN_ADDRESS` avec votre adresse de dépôt Binance BTC sur le réseau Bitcoin natif.
4. **E-mail (Resend)** : créez une clé API et vérifiez votre domaine d'envoi.
5. `cp .env.example .env.local` puis renseignez toutes les valeurs.
6. Mot de passe admin : `npm run hash-password -- "VotreMotDePasseLong"` → collez la ligne `ADMIN_PASSWORD_HASH=...`.
   Secret de session : `openssl rand -base64 32` → `ADMIN_SESSION_SECRET`.
7. `npm run dev` → http://localhost:3000 — admin : http://localhost:3000/admin

## Paiement Bitcoin

Appliquer `supabase/migrations/20261017_bitcoin_payment.sql` sur une base existante, en plus des migrations précédentes. Les anciennes colonnes de paiement sont conservées pour l’historique mais ne sont plus utilisées.

1. Dans Binance : Dépôt → Dépôt crypto → BTC → réseau Bitcoin (BTC). Copier l’adresse dans `BITCOIN_ADDRESS`. Aucun identifiant Binance ni clé API n’est nécessaire.
2. Le serveur obtient le cours BTC/EUR de Coinbase, calcule le montant en satoshis arrondi au supérieur et enregistre l’adresse, le cours et une échéance de 30 minutes avec la commande.
3. La page de commande affiche le montant exact, l’adresse et un lien vers le portefeuille. En cas d’expiration, elle masque les instructions d’envoi ; un dépôt déjà effectué reste vérifiable.
4. Dans `/admin`, vérifier réellement le dépôt confirmé sur Binance : réseau, adresse, montant net, heure et correspondance avec la commande. Renseigner le TXID puis confirmer. Un TXID ne peut servir qu’une fois. Les codes ne sont jamais envoyés à partir d’une déclaration du client.
5. La confirmation admin déclenche l’émission et l’e-mail. La page de commande relance l’envoi en cas d’échec. Il n’y a pas de détection automatique des dépôts Binance.

Ne pas configurer une adresse BEP20, ERC20 ou Lightning. Vérifier aussi le minimum de dépôt annoncé par Binance. Le paiement renvoie 503 tant que l’adresse manque et 502 si le cours est indisponible, sans créer de commande.

## Sécurité
- Clés secrètes uniquement dans `process.env` côté serveur (`server-only`) ; aucune variable `NEXT_PUBLIC_`.
- RLS Supabase activée sans politique : le navigateur n'a aucun accès direct aux tables.
- Admin : cookie JWT httpOnly/SameSite=Strict, middleware + contrôle dans chaque route, bcrypt, limitation des tentatives.
- Débits/crédits atomiques via la fonction SQL `adjust_card` (solde jamais négatif).
- Limiteur de débit en mémoire : en production multi-instances, utilisez Redis/Upstash.

## Déploiement (Netlify)

Reliez le dépôt Git au site Netlify. Le fichier `netlify.toml` définit la commande
`npm run build`, le dossier publié `.next` et Node.js 22. Le répertoire de base
doit être la racine de ce projet, où se trouve `package.json`.
Netlify détecte Next.js et installe automatiquement son adaptateur pour les pages,
les routes API et le middleware. Un dépôt manuel des sources ou du dossier `.next`
par glisser-déposer ne remplace pas cette compilation.

Ajoutez les variables de `.env.example` dans les variables d'environnement du site
Netlify, accessibles à la compilation et aux fonctions, avec
`SITE_URL=https://cartescadeaux.netlify.app`. Le fichier `.env` local n'est pas
transmis par Git.

Après avoir poussé cette configuration, relancez un déploiement de production
depuis Netlify. Si la page d'accueil affiche encore « Page not found », vérifiez
dans le journal du déploiement que la compilation Next.js et son adaptateur ont
bien été exécutés et que le dépôt et la branche publiés sont les bons.

Pour Vercel, ajoutez les mêmes variables dans les réglages du projet, avec
`SITE_URL=https://votre-domaine`.

## Catalogue des enseignes

Le catalogue contient 28 enseignes et propose les montants 20, 25, 50, 100, 150, 200,
250 et 500 €. Le formulaire permet aussi un montant entier personnalisé
entre 20 et 500 €. L'enseigne est validée côté serveur et enregistrée dans
`orders.brand`, puis affichée dans les dernières commandes de l'administration.
Pour une base déjà créée, appliquer `supabase/migrations/20261015_add_order_brand.sql`
avant le déploiement. Une nouvelle base utilise directement `supabase/schema.sql`.

Le mécanisme existant émet des codes internes P2P. Il ne fournit pas de codes
redeemables auprès des enseignes du catalogue : une intégration avec un fournisseur
est nécessaire pour commercialiser et livrer ces cartes de marque.

### Quantité de cartes cadeaux

Chaque commande accepte de 1 à 20 cartes du même montant. Le total correspond au montant unitaire multiplié par la quantité ; chaque carte reçoit son propre code.
Pour une base existante, appliquer `supabase/migrations/20261015_add_order_quantity.sql` avant de déployer cette version. Les commandes existantes conservent une quantité de 1. Le paiement nécessite une adresse Bitcoin configurée.

### Langues du site

Le bouton globe de l’en-tête propose le français, l’anglais, l’allemand, l’espagnol, l’italien et le néerlandais. Le choix est conservé dans le stockage local du navigateur. Les traductions de l’interface publique sont intégrées dans `src/lib/i18n/translations.json`, sans service de traduction externe à l’exécution. Pour ajouter un texte, utiliser `T` ou `t` depuis `LanguageProvider` et ajouter sa traduction dans les cinq dictionnaires (le français est le texte source). Conserver les paramètres entre accolades, les marques, les codes et les valeurs envoyées aux API. L’administration, les e-mails et les instructions Bitcoin suivent leur propre langue.

Pour autoriser les montants de 20 € et 25 € dans une base existante, appliquer `supabase/migrations/20261015_add_20_25_amounts.sql` après la migration des quantités.

Le plafond d’achat est de 500 € par carte, contrôlé par le formulaire et l’API de commande. Les contraintes de base existantes restent compatibles avec les anciennes commandes supérieures à 500 €.

## Paiements BTC, ETH et USDT

Appliquer `supabase/migrations/20261025_crypto_payments.sql` avant de déployer. Les trois adresses et leurs réseaux sont définis dans `src/lib/crypto-links.js` : BTC sur Bitcoin, ETH sur Ethereum et USDT sur TON. Ce sont des adresses, pas des URL HTTPS. Vérifier auprès du portefeuille destinataire que le dépôt USDT sur TON est pris en charge et si un mémo est requis avant d'accepter des paiements.

Le client choisit sa devise ; le serveur calcule le montant au cours Coinbase EUR et enregistre la devise, le réseau et l'adresse avec la commande. La page de paiement affiche les instructions et l'administration permet de confirmer le dépôt par son hash de transaction hexadécimal (préfixe `0x` accepté pour Ethereum). Les anciennes commandes Bitcoin restent prises en charge.
