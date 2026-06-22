import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Очистка старых данных
  await prisma.wordProgress.deleteMany({});
  await prisma.testResult.deleteMany({});
  await prisma.wordsCard.deleteMany({});
  await prisma.category.deleteMany({});

  const categories = [
    {
      slug: 'numbers', nameRu: 'Цифры', nameKz: 'Сандар',
      cards: [
        { wordRu: 'Один', wordKz: 'Бір' }, { wordRu: 'Два', wordKz: 'Екі' },
        { wordRu: 'Три', wordKz: 'Үш' }, { wordRu: 'Четыре', wordKz: 'Төрт' },
        { wordRu: 'Пять', wordKz: 'Бес' }, { wordRu: 'Шесть', wordKz: 'Алты' },
        { wordRu: 'Семь', wordKz: 'Жеті' }, { wordRu: 'Восемь', wordKz: 'Сегіз' },
        { wordRu: 'Девять', wordKz: 'Тоғыз' }, { wordRu: 'Десять', wordKz: 'Он' }
      ]
    },
    {
      slug: 'animals', nameRu: 'Животные', nameKz: 'Жануарлар',
      cards: [
        { wordRu: 'Кошка', wordKz: 'Мысық' }, { wordRu: 'Собака', wordKz: 'Ит' },
        { wordRu: 'Лошадь', wordKz: 'Жылқы' }, { wordRu: 'Корова', wordKz: 'Сиыр' },
        { wordRu: 'Овца', wordKz: 'Қой' }, { wordRu: 'Птица', wordKz: 'Құс' }
      ]
    },
    {
      slug: 'colors', nameRu: 'Цвета', nameKz: 'Түстер',
      cards: [
        { wordRu: 'Красный', wordKz: 'Қызыл' }, { wordRu: 'Синий', wordKz: 'Көк' },
        { wordRu: 'Зеленый', wordKz: 'Жасыл' }, { wordRu: 'Белый', wordKz: 'Ақ' },
        { wordRu: 'Черный', wordKz: 'Қара' }
      ]
    },
    {
      slug: 'family', nameRu: 'Семья', nameKz: 'Отбасы',
      cards: [
        { wordRu: 'Мама', wordKz: 'Ана' }, { wordRu: 'Папа', wordKz: 'Әке' },
        { wordRu: 'Брат', wordKz: 'Аға' }, { wordRu: 'Сестра', wordKz: 'Қарындас' },
        { wordRu: 'Дедушка', wordKz: 'Ата' }, { wordRu: 'Бабушка', wordKz: 'Әже' }
      ]
    }
  ];

  for (const cat of categories) {
    await prisma.category.create({
      data: {
        slug: cat.slug,
        nameRu: cat.nameRu,
        nameKz: cat.nameKz,
        cards: {
          create: cat.cards.map(c => ({
            wordRu: c.wordRu,
            wordKz: c.wordKz,
            imageUrl: null, // Заглушка CSS
            audioRuUrl: null,
            audioKzUrl: null
          }))
        }
      }
    });
  }
  console.log('База данных успешно наполнена контентом!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });