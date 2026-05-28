import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo data...');

  const demoUser = await prisma.user.upsert({
    where: { firebaseUid: 'demo-uid' },
    update: {},
    create: {
      firebaseUid: 'demo-uid',
      email: 'demo@fixmypayments.com',
      name: 'Demo User',
      budget: {
        create: {
          total: 150000,
          food: 15000,
          transport: 8000,
          shopping: 50000,
          utilities: 12000,
          medical: 10000,
          entertainment: 10000,
          health: 5000,
          groceries: 15000,
        },
      },
    },
  });

  console.log(`✅ Demo user: ${demoUser.id}`);

  const existingCount = await prisma.transaction.count({ where: { userId: demoUser.id } });
  if (existingCount === 0) {
    const mockTransactions = [
      { merchant: 'Starbucks', amount: 450, category: 'Food', rawText: 'Starbucks coffee 450' },
      { merchant: 'Uniswap (zkSync)', amount: 12500, category: 'Shopping', rawText: 'Uniswap zkSync swap 12500' },
      { merchant: 'Zomato', amount: 890, category: 'Food', rawText: 'Zomato order 890' },
      { merchant: 'Apple Store', amount: 89000, category: 'Shopping', rawText: 'Apple Store purchase 89000' },
      { merchant: 'Lenskart', amount: 2500, category: 'Medical', rawText: 'Lenskart glasses 2500' },
    ];

    for (const tx of mockTransactions) {
      await prisma.transaction.create({
        data: {
          userId: demoUser.id,
          ...tx,
          date: new Date(Date.now() - Math.random() * 7 * 86400000),
        },
      });
    }

    console.log(`✅ ${mockTransactions.length} demo transactions created`);
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
