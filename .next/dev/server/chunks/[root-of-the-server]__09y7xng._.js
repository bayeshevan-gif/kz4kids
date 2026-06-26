module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/lib/prisma.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        "warn",
        "error"
    ] : "TURBOPACK unreachable"
});
if ("TURBOPACK compile-time truthy", 1) {
    globalForPrisma.prisma = prisma;
}
}),
"[project]/app/api/seed/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/prisma.ts [app-route] (ecmascript)");
;
;
;
async function GET(req) {
    const key = req.nextUrl.searchParams.get("key");
    const expected = process.env.SEED_SECRET || "let-me-in-2026";
    if (key !== expected) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Неверный ключ"
        }, {
            status: 403
        });
    }
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";
    const passwordHash = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].hash(adminPassword, 10);
    await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].user.upsert({
        where: {
            id: "admin-seed"
        },
        update: {},
        create: {
            id: "admin-seed",
            name: "admin",
            passwordHash,
            role: "ADMIN"
        }
    });
    const levelsData = [
        {
            id: "l1",
            name: "Уровень 1",
            nameKz: "1-деңгей",
            emoji: "1️⃣",
            number: 1,
            order: 1
        },
        {
            id: "l2",
            name: "Уровень 2",
            nameKz: "2-деңгей",
            emoji: "2️⃣",
            number: 2,
            order: 2
        }
    ];
    for (const level of levelsData){
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].learningLevel.upsert({
            where: {
                id: level.id
            },
            update: {},
            create: {
                id: level.id,
                name: level.name,
                nameKz: level.nameKz,
                emoji: level.emoji,
                number: level.number,
                order: level.order
            }
        });
    }
    const sectionsData = [
        {
            id: "s1",
            levelId: "l1",
            name: "Цифры",
            nameKz: "Сандар",
            emoji: "🔢",
            order: 1,
            cards: [
                [
                    "один",
                    "бір",
                    "1️⃣"
                ],
                [
                    "два",
                    "екі",
                    "2️⃣"
                ],
                [
                    "три",
                    "үш",
                    "3️⃣"
                ],
                [
                    "четыре",
                    "төрт",
                    "4️⃣"
                ],
                [
                    "пять",
                    "бес",
                    "5️⃣"
                ]
            ]
        },
        {
            id: "s2",
            levelId: "l1",
            name: "Семья",
            nameKz: "Отбасы",
            emoji: "👪",
            order: 2,
            cards: [
                [
                    "мама",
                    "ана",
                    "👩"
                ],
                [
                    "папа",
                    "әке",
                    "👨"
                ],
                [
                    "бабушка",
                    "әже",
                    "👵"
                ],
                [
                    "дедушка",
                    "ата",
                    "👴"
                ],
                [
                    "брат",
                    "аға",
                    "🧑"
                ]
            ]
        },
        {
            id: "s3",
            levelId: "l1",
            name: "Животные",
            nameKz: "Жануарлар",
            emoji: "🐾",
            order: 3,
            cards: [
                [
                    "кошка",
                    "мысық",
                    "🐱"
                ],
                [
                    "собака",
                    "ит",
                    "🐶"
                ],
                [
                    "лошадь",
                    "жылқы",
                    "🐴"
                ],
                [
                    "верблюд",
                    "түйе",
                    "🐫"
                ],
                [
                    "овца",
                    "қой",
                    "🐑"
                ]
            ]
        },
        {
            id: "s4",
            levelId: "l2",
            name: "Цвета",
            nameKz: "Түстер",
            emoji: "🎨",
            order: 4,
            cards: [
                [
                    "красный",
                    "қызыл",
                    "🔴"
                ],
                [
                    "синий",
                    "көк",
                    "🔵"
                ],
                [
                    "желтый",
                    "сары",
                    "🟡"
                ],
                [
                    "зеленый",
                    "жасыл",
                    "🟢"
                ],
                [
                    "белый",
                    "ақ",
                    "⚪"
                ]
            ]
        }
    ];
    for (const sec of sectionsData){
        await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].section.upsert({
            where: {
                id: sec.id
            },
            update: {},
            create: {
                id: sec.id,
                levelId: sec.levelId,
                name: sec.name,
                nameKz: sec.nameKz,
                emoji: sec.emoji,
                order: sec.order
            }
        });
        for(let i = 0; i < sec.cards.length; i++){
            const [ru, kz, emoji] = sec.cards[i];
            const cardId = `${sec.id}-c${i + 1}`;
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$prisma$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["prisma"].card.upsert({
                where: {
                    id: cardId
                },
                update: {},
                create: {
                    id: cardId,
                    sectionId: sec.id,
                    ru,
                    kz,
                    emoji,
                    order: i + 1
                }
            });
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        message: "База засеяна. Логин админа: admin / пароль: " + adminPassword
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__09y7xng._.js.map