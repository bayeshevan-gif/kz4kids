// Временная заглушка вместо реальной Prisma для успешного деплоя фротенда
export const prisma = new Proxy({} as any, {
  get: () => {
    // Возвращает пустую функцию на любой вызов вроде prisma.user.findMany()
    return () => Promise.resolve([]);
  }
});
