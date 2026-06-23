import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { id: "admin-seed" },
    update: {},
    create: { id: "admin-seed", name: "admin", passwordHash, role: "ADMIN" },
  });

  const sectionsData = [
    { id: "s1", name: "Цифры", nameKz: "Сандар", emoji: "🔢", order: 1,
      cards: [["один","бір","1️⃣"],["два","екі","2️⃣"],["три","үш","3️⃣"],["четыре","төрт","4️⃣"],["пять","бес","5️⃣"]] },
    { id: "s2", name: "Семья", nameKz: "Отбасы", emoji: "👪", order: 2,
      cards: [["мама","ана","👩"],["папа","әке","👨"],["бабушка","әже","👵"],["дедушка","ата","👴"],["брат","аға","🧑"]] },
    { id: "s3", name: "Животные", nameKz: "Жануарлар", emoji: "🐾", order: 3,
      cards: [["кошка","мысық","🐱"],["собака","ит","🐶"],["лошадь","жылқы","🐴"],["верблюд","түйе","🐫"],["овца","қой","🐑"]] },
    { id: "s4", name: "Цвета", nameKz: "Түстер", emoji: "🎨", order: 4,
      cards: [["красный","қызыл","🔴"],["синий","көк","🔵"],["желтый","сары","🟡"],["зеленый","жасыл","🟢"],["белый","ақ","⚪"]] },
  ];

  for (const sec of sectionsData) {
    await prisma.section.upsert({
      where: { id: sec.id }, update: {},
      create: { id: sec.id, name: sec.name, nameKz: sec.nameKz, emoji: sec.emoji, order: sec.order },
    });
    for (let i = 0; i < sec.cards.length; i++) {
      const [ru, kz, emoji] = sec.cards[i];
      const cardId = `${sec.id}-c${i+1}`;
      await prisma.card.upsert({
        where: { id: cardId }, update: {},
        create: { id: cardId, sectionId: sec.id, ru, kz, emoji, order: i+1 },
      });
    }
  }

  console.log("Сид выполнен. Логин админа: admin / пароль:", adminPassword);
}

main().finally(() => prisma.$disconnect());
