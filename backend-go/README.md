# Ble-dor Go API (Option 1)

Backend Go minimal pour migrer progressivement les routes Next.js API vers un service dédié.

## Endpoints initiaux

- `GET /healthz`
- `GET /v1/products`

## Variables d'environnement

- `PORT` (default: `8080`)
- `CORS_ORIGIN` (default: `http://localhost:3000`)
- `DATABASE_URL` (required)

## Lancer en local

```bash
cd backend-go
cp .env.example .env
# adapte DATABASE_URL selon Neon ou Docker local
set -a; source .env; set +a

go run ./cmd/api
```

Windows PowerShell:

```powershell
cd backend-go
$env:PORT="8080"
$env:CORS_ORIGIN="http://localhost:3000"
$env:DATABASE_URL="postgresql://bledor:bledor_password@localhost:5432/bledor_db?sslmode=disable"
go run .\cmd\api
```

## Build Docker

```bash
cd backend-go
docker build -t ble-dor-go-api .
docker run --rm -p 8080:8080 -e DATABASE_URL="postgresql://..." -e CORS_ORIGIN="http://localhost:3000" ble-dor-go-api
```

## Plan de migration conseillé

1. Migrer `products` et pointer le front vers `NEXT_PUBLIC_API_URL`.
2. Migrer `favorites`.
3. Migrer `orders`.
4. Migrer auth vers JWT côté Go.
5. Retirer progressivement les anciennes routes `src/app/api/*`.
