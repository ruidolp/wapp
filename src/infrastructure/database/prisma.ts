/**
 * Cliente de Prisma con singleton pattern
 *
 * En desarrollo, el hot reload de Next.js puede crear múltiples instancias
 * del cliente Prisma, lo que consume conexiones innecesarias.
 * Este patrón asegura una sola instancia global.
 */

import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

export { prisma }

/**
 * Helper para desconectar Prisma (útil en tests)
 */
export async function disconnectPrisma() {
  await prisma.$disconnect()
}
