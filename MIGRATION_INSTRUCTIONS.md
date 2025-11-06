# 🔧 Instrucciones de Migración - Módulo de Suscripciones

## ⚠️ IMPORTANTE: Tu tabla users usa TEXT para id

La primera migración falló porque asumí UUID pero tu sistema usa TEXT. He creado una versión corregida.

## 📋 Pasos para Ejecutar la Migración

### Opción 1: Desde psql (línea de comandos)

```bash
# Conectar a tu base de datos Neon
psql "postgresql://neondb_owner:PASSWORD@HOST.neon.tech/DATABASE?sslmode=require"

# Ejecutar la migración corregida
\i src/infrastructure/database/migrations/001_create_subscriptions_tables_FIXED.sql

# Ejecutar el seed de datos
\i src/infrastructure/database/migrations/002_seed_subscriptions_data.sql

# Verificar que se crearon las tablas
\dt

# Verificar que hay datos en subscription_plans
SELECT * FROM subscription_plans;
```

### Opción 2: Desde Neon SQL Editor (más fácil)

1. Ve a https://console.neon.tech
2. Selecciona tu proyecto
3. Click en "SQL Editor"
4. **Paso 1**: Copia y pega TODO el contenido de `001_create_subscriptions_tables_FIXED.sql` y ejecuta
5. **Paso 2**: Copia y pega TODO el contenido de `002_seed_subscriptions_data.sql` y ejecuta
6. Verifica ejecutando: `SELECT * FROM subscription_plans;`

## ✅ Qué debe mostrar después de ejecutar

Deberías tener **13 tablas** en total:

```sql
\dt

-- Output esperado:
 public | accounts                 | table | neondb_owner
 public | invitation_codes         | table | neondb_owner  ← NUEVA
 public | linked_users             | table | neondb_owner  ← NUEVA
 public | payment_products         | table | neondb_owner  ← NUEVA
 public | plan_capabilities        | table | neondb_owner  ← NUEVA
 public | plan_limits              | table | neondb_owner  ← NUEVA
 public | sessions                 | table | neondb_owner
 public | subscription_history     | table | neondb_owner  ← NUEVA
 public | subscription_plans       | table | neondb_owner  ← NUEVA
 public | user_subscriptions       | table | neondb_owner  ← NUEVA
 public | users                    | table | neondb_owner
 public | verification_codes       | table | neondb_owner
 public | verification_tokens      | table | neondb_owner
```

Y deberías tener **3 planes** con datos:

```sql
SELECT slug, name, trial_days, max_linked_users FROM subscription_plans;

-- Output esperado:
   slug   |   name   | trial_days | max_linked_users
----------+----------+------------+------------------
 free     | Free     |          0 |                0
 premium  | Premium  |          7 |                1
 familiar | Familiar |          7 |                3
```

## 🐛 Si Tienes Errores

### Error: "relation already exists"
```sql
-- Limpiar todo y empezar de nuevo
DROP TABLE IF EXISTS payment_products CASCADE;
DROP TABLE IF EXISTS subscription_history CASCADE;
DROP TABLE IF EXISTS invitation_codes CASCADE;
DROP TABLE IF EXISTS linked_users CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS plan_limits CASCADE;
DROP TABLE IF EXISTS plan_capabilities CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

DROP TYPE IF EXISTS subscription_event_type;
DROP TYPE IF EXISTS invitation_status;
DROP TYPE IF EXISTS subscription_period;
DROP TYPE IF EXISTS subscription_platform;
DROP TYPE IF EXISTS subscription_status;

-- Luego ejecuta las migraciones de nuevo
```

### Error: "function already exists"
```sql
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

## 📝 Después de la Migración

Una vez que las tablas estén creadas, puedes probar la API:

```bash
# Iniciar el servidor
npm run dev

# Probar endpoint de status (requiere estar autenticado)
curl http://localhost:3000/api/subscriptions/status \
  -H "Cookie: authjs.session-token=YOUR_SESSION_TOKEN"
```

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:
1. Copia el error completo
2. Ejecuta `\dt` y muéstrame qué tablas existen
3. Ejecuta `SELECT id FROM users LIMIT 1;` para confirmar el tipo de dato
