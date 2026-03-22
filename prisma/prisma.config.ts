import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

// Load .env files for CLI commands (migrate, seed, etc.)
config({ path: path.join(__dirname, '..', '.env.local') })
config({ path: path.join(__dirname, '..', '.env') })

export default defineConfig({
  schema: path.join(__dirname, 'schema.prisma'),
  migrations: {
    seed: 'ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
})
