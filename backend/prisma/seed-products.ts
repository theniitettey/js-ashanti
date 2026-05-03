
import { prisma } from '../src/lib/prisma';
import dotenv from 'dotenv';

dotenv.config();

const categories = [
    "KITCHEN APPLIANCES",
    "COOKING WARES & SETS",
    "STORAGE & INSULATIONS",
    "HOME ESSENTIALS"
];

const mockProducts = [
    {
        title: "Complete Tableware Set",
        slug: "complete-tableware-set",
        description: "Includes plates, bowls, and jugs for 6 people. Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
        rating: 5.0,
        price: 2899,
        images: ["/products/tableSets.jpg", "/optimized/blender.webp"],
        colors: ["red", "green"],
        stock: 15,
        sku: "TAB-SET-001"
    },
    {
        title: "8L Silver Crest Air Fryer",
        slug: "8l-air-fryer",
        description: "Healthy frying with no oil and digital display",
        rating: 4.8,
        price: 4599,
        images: ["/a.jpg"], // Placeholder
        colors: ["red", "green", "blue", "gold"],
        stock: 8,
        sku: "AIR-FRY-8L"
    },
    {
        title: "5L Rice Cooker - 3 Pins",
        slug: "5l-rice-cooker",
        description: "Efficient rice cooker for medium-sized families",
        rating: 4.6,
        price: 2399,
        images: ["/a.jpg"],
        colors: ["blue", "gold"],
        stock: 20,
        sku: "RICE-COOK-5L"
    },
    {
        title: "Silver Crest 3-in-1 Blender",
        slug: "sc5532-blender",
        description: "Powerful 5500W motor with multi-speed settings",
        rating: 4.9,
        price: 3299,
        images: ["/a.jpg"],
        colors: ["sliver", "gold"],
        stock: 12,
        sku: "BLEND-3IN1"
    },
    {
        title: "13PCS Non-Stick Fry Pan Set",
        slug: "13pcs-frypan-set",
        description: "Cook like a pro with this complete fry pan set",
        rating: 4.7,
        price: 4999,
        images: ["/a.jpg"],
        colors: ["red", "green", "blue", "gold"],
        stock: 5,
        sku: "FRY-PAN-13"
    },
    {
        title: "LS 2010 - 10PCS Pot Set",
        slug: "ls2010-pot-set",
        description: "Durable and elegant stainless steel pots",
        rating: 4.5,
        price: 6199,
        images: ["/a.jpg"],
        colors: [],
        stock: 7,
        sku: "POT-SET-10"
    },
    {
        title: "4L Electric Kettle",
        slug: "4l-electric-kettle",
        description: "Fast-boiling and energy-saving electric kettle",
        rating: 4.3,
        price: 1599,
        images: ["/a.jpg"],
        colors: [],
        stock: 25,
        sku: "KETTLE-4L"
    },
    {
        title: "3PCS Insulation Barrel Set",
        slug: "insulation-barrel-3pcs",
        description: "Keeps food hot for hours – perfect for travel",
        rating: 4.6,
        price: 3999,
        images: ["/a.jpg"],
        colors: [],
        stock: 18,
        sku: "INSUL-BAR-3"
    },
    {
        title: "Vmigo Cast Iron Dutch Oven",
        slug: "vmigo-dutch-oven",
        description: "Heavy-duty cast iron, perfect for stews & baking",
        rating: 4.9,
        price: 7499,
        images: ["/a.jpg"],
        colors: [],
        stock: 4,
        sku: "DUTCH-OVEN"
    },
    {
        title: "Fufu Pounding Machine",
        slug: "fufu-maker",
        description: "Pound fufu and banku effortlessly at home",
        rating: 4.4,
        price: 4699,
        images: ["/a.jpg"],
        colors: [],
        stock: 9,
        sku: "FUFU-MAKER"
    },
    {
        title: "Juicer Extractor",
        slug: "juicer-extractor",
        description: "Extract fresh juices with powerful blade motor",
        rating: 4.2,
        price: 3199,
        images: ["/a.jpg"],
        colors: [],
        stock: 14,
        sku: "JUICER-EX"
    },
    {
        title: "Slow Juicer – Big Mouth",
        slug: "slow-juicer",
        description: "Retains more nutrients with slow-press tech",
        rating: 4.7,
        price: 5899,
        images: ["/a.jpg"],
        colors: [],
        stock: 6,
        sku: "JUICER-SLOW"
    },
    {
        title: "6-Slot Lunch Box",
        slug: "lunch-box",
        description: "Perfect for school, work, or travel meals",
        rating: 4.5,
        price: 899,
        images: ["/a.jpg"],
        colors: [],
        stock: 50,
        sku: "LUNCH-BOX-6"
    },
    {
        title: "10L Round Cooking Pot",
        slug: "round-cooking-pot",
        description: "Even heat distribution with 3-pin plug",
        rating: 4.6,
        price: 4699,
        images: ["/a.jpg"],
        colors: [],
        stock: 11,
        sku: "POT-ROUND-10L"
    },
    {
        title: "5-Layer Kitchen Storage Rack",
        slug: "kitchen-storage-rack",
        description: "Organize your kitchenware with ease",
        rating: 4.1,
        price: 2899,
        imageUrl: "/products/storage-rack.jpg",
        images: ["/a.jpg"],
        colors: [],
        stock: 22,
        sku: "RACK-KITCHEN"
    },
    {
        title: "Double Rod Cloth Rack",
        slug: "cloths-rack",
        description: "Sturdy steel rack for daily clothing needs",
        rating: 4.0,
        price: 3299,
        imageUrl: "/products/clothes-rack.jpg",
        images: ["/a.jpg"],
        colors: [],
        stock: 16,
        sku: "RACK-CLOTH"
    },
    {
        title: "Bosch 12PCS Pot Set – BO-2023",
        slug: "bosch-pot-set",
        description: "German precision with stainless finish",
        rating: 4.9,
        price: 7999,
        imageUrl: "/products/pot-set-bosch.jpg",
        images: ["/a.jpg"],
        colors: [],
        stock: 3,
        sku: "POT-BOSCH-12"
    },
    {
        title: "2L Commercial Blender",
        slug: "commercial-blender",
        description: "Built for heavy use – cafes and homes",
        rating: 4.6,
        price: 4199,
        imageUrl: "/products/commercial-blender.jpg",
        images: ["/a.jpg"],
        colors: [],
        stock: 8,
        sku: "BLEND-COM-2L"
    },
    {
        title: "8L Square Cooking Pot",
        slug: "square-pot",
        description: "Large family-size pot with quick heating",
        rating: 4.3,
        price: 4799,
        imageUrl: "/products/square-pot.jpg",
        images: ["/a.jpg"],
        colors: [],
        stock: 13,
        sku: "POT-SQUARE-8L"
    },
    {
        title: "24PCS Gold Tableware Set",
        slug: "gold-tableware",
        description: "Elegant dining set for classy meals",
        rating: 5.0,
        price: 6999,
        imageUrl: "/products/tableware-gold.jpg",
        images: ["/a.jpg"],
        colors: [],
        stock: 5,
        sku: "TABLE-GOLD-24"
    }
];

async function main() {
    console.log('Seeding products...');

    for (let i = 0; i < mockProducts.length; i++) {
        const product = mockProducts[i];
        // Round-robin category assignment
        const category = categories[i % categories.length];

        // Normalize images: if imageUrl exists, prepend it to images array
        let images = [...product.images];
        // @ts-ignore
        if (product.imageUrl) {
            // @ts-ignore
            images = [product.imageUrl, ...images];
        }

        try {
            await prisma.product.upsert({
                where: { slug: product.slug },
                update: {},
                create: {
                    name: product.title,
                    slug: product.slug,
                    description: product.description,
                    category: category,
                    subcategories: [], // Empty for now
                    colors: product.colors,
                    price: product.price,
                    discount: 0,
                    ratingFromManufacturer: product.rating,
                    customerRating: null, // Let users verify
                    images: images,
                    stock: product.stock,
                    sku: product.sku
                }
            });
            console.log(`Created product: ${product.title} (${category})`);
        } catch (e) {
            console.error(`Error creating product ${product.title}:`, e);
        }
    }

    console.log('Product seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
