import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // 1. Create Categories
    console.log('📁 Creating categories...');

    // Delete existing categories first
    await prisma.category.deleteMany({});

    const categories = await Promise.all([
        prisma.category.create({
            data: {
                name: 'Dụng cụ cầm tay',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Máy móc điện',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Dụng cụ đo lường',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Phụ kiện & Mũi khoan',
            },
        }),
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // 2. Create Products
    console.log('🛠️  Creating products...');

    // Delete existing products first
    await prisma.product.deleteMany({});

    const products = [
        // Dụng cụ cầm tay
        {
            name: 'Búa tạ 2kg',
            description: 'Búa tạ chất lượng cao, cán gỗ chắc chắn, đầu thép rèn. Phù hợp cho công việc xây dựng và sửa chữa.',
            price: 150000,
            categoryId: categories[0].id,
            stockQuantity: 50,
            images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'],
            specifications: { weight: '2kg', material: 'Thép rèn + Gỗ' },
        },
        {
            name: 'Kìm điện 8 inch',
            description: 'Kìm điện cách điện, tay cầm cao su chống trượt. An toàn khi làm việc với điện.',
            price: 85000,
            categoryId: categories[0].id,
            stockQuantity: 100,
            images: ['https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400'],
            specifications: { size: '8 inch', insulation: 'Cách điện 1000V' },
        },
        {
            name: 'Bộ tuốc nơ vít đa năng 6 món',
            description: 'Bộ tuốc nơ vít gồm 6 món các loại đầu khác nhau. Cán cao su chống trượt, đầu từ tính.',
            price: 120000,
            categoryId: categories[0].id,
            stockQuantity: 75,
            images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400'],
            specifications: { pieces: 6, magnetic: 'Có' },
        },
        {
            name: 'Bộ cờ lê 8 món',
            description: 'Bộ cờ lê miệng phẳng từ 8mm đến 24mm. Thép chrome vanadium chất lượng cao.',
            price: 220000,
            categoryId: categories[0].id,
            stockQuantity: 40,
            images: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'],
            specifications: { pieces: 8, material: 'Chrome Vanadium', sizes: '8-24mm' },
        },

        // Máy móc điện
        {
            name: 'Máy khoan cầm tay Bosch 550W',
            description: 'Máy khoan động lực Bosch công suất 550W. Khoan được bê tông, gỗ, kim loại. Có chức năng búa.',
            price: 1450000,
            categoryId: categories[1].id,
            stockQuantity: 25,
            images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'],
            specifications: { power: '550W', brand: 'Bosch', functions: 'Khoan + Búa' },
        },
        {
            name: 'Máy mài góc 100mm Makita',
            description: 'Máy mài góc Makita 100mm, công suất 720W. Cắt và mài kim loại, đá, gạch.',
            price: 980000,
            categoryId: categories[1].id,
            stockQuantity: 30,
            images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400'],
            specifications: { power: '720W', brand: 'Makita', disc_size: '100mm' },
        },
        {
            name: 'Máy bắn vít pin Dewalt 18V',
            description: 'Máy bắn vít dùng pin Dewalt 18V, mô-men xoắn 60Nm. Kèm 2 pin và sạc nhanh.',
            price: 2850000,
            categoryId: categories[1].id,
            stockQuantity: 15,
            images: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'],
            specifications: { voltage: '18V', torque: '60Nm', brand: 'Dewalt', battery: '2 pin' },
        },
        {
            name: 'Máy cưa lọng 400W',
            description: 'Máy cưa lọng cầm tay 400W, cưa gỗ, nhựa, kim loại mỏng. Điều chỉnh tốc độ.',
            price: 650000,
            categoryId: categories[1].id,
            stockQuantity: 35,
            images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'],
            specifications: { power: '400W', speed_control: 'Có' },
        },

        // Dụng cụ đo lường
        {
            name: 'Thước kẹp điện tử 150mm',
            description: 'Thước kẹp điện tử chính xác 0.01mm, màn hình LCD. Đo ngoài, trong, sâu.',
            price: 250000,
            categoryId: categories[2].id,
            stockQuantity: 60,
            images: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'],
            specifications: { accuracy: '0.01mm', display: 'LCD', range: '0-150mm' },
        },
        {
            name: 'Thước thủy 60cm',
            description: 'Thước thủy nhôm 60cm, 3 bọt nước. Độ chính xác cao, chống va đập.',
            price: 180000,
            categoryId: categories[2].id,
            stockQuantity: 45,
            images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400'],
            specifications: { length: '60cm', vials: 3, material: 'Nhôm' },
        },
        {
            name: 'Thước cuộn 5m Stanley',
            description: 'Thước cuộn Stanley 5m, băng thép phủ nylon. Móc từ tính, khóa tự động.',
            price: 95000,
            categoryId: categories[2].id,
            stockQuantity: 80,
            images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'],
            specifications: { length: '5m', brand: 'Stanley', magnetic: 'Có' },
        },

        // Phụ kiện & Mũi khoan
        {
            name: 'Bộ mũi khoan 13 món',
            description: 'Bộ 13 mũi khoan từ 1.5mm đến 13mm. Thép HSS, khoan được kim loại và gỗ.',
            price: 180000,
            categoryId: categories[3].id,
            stockQuantity: 90,
            images: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'],
            specifications: { pieces: 13, material: 'HSS', sizes: '1.5-13mm' },
        },
        {
            name: 'Bộ đầu vít 32 món',
            description: 'Bộ 32 đầu vít các loại: dẹt, Phillips, Torx, hex. Kèm đầu nối và hộp đựng.',
            price: 145000,
            categoryId: categories[3].id,
            stockQuantity: 100,
            images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400'],
            specifications: { pieces: 32, types: 'Dẹt, Phillips, Torx, Hex' },
        },
        {
            name: 'Đá mài 100mm (5 cái)',
            description: 'Bộ 5 đá mài 100mm cho máy mài góc. Cắt kim loại, inox, thép.',
            price: 75000,
            categoryId: categories[3].id,
            stockQuantity: 120,
            images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'],
            specifications: { pieces: 5, size: '100mm', use: 'Cắt kim loại' },
        },
    ];

    let createdCount = 0;
    for (const product of products) {
        await prisma.product.create({
            data: product,
        });
        createdCount++;
    }

    console.log(`✅ Created ${createdCount} products`);

    // 3. Create a test user
    console.log('👤 Creating test user...');
    const bcrypt = require('bcrypt');

    // Delete existing test user
    await prisma.user.deleteMany({
        where: { email: 'test@example.com' }
    });

    const testUser = await prisma.user.create({
        data: {
            email: 'test@example.com',
            passwordHash: await bcrypt.hash('123456', 10),
            fullName: 'Nguyễn Văn Test',
            phone: '0123456789',
            role: 'customer',
        },
    });

    console.log(`✅ Created test user: ${testUser.email}`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Products: ${createdCount}`);
    console.log(`   Test User: 1`);
    console.log('\n📝 Test credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: 123456');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
