/**
 * Seed Data Script
 * Tạo dữ liệu mẫu cho Categories và Products
 * Chạy: node seed.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

// Models
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    image: { type: String },
  },
  { timestamps: true, versionKey: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    description: { type: String },
    price: { type: mongoose.Decimal128, required: true },
    stock: { type: Number, required: true, default: 0 },
    image: { type: String },
  },
  { timestamps: true, versionKey: false }
);

const Category = mongoose.model("Category", categorySchema);
const Product = mongoose.model("Product", productSchema);

const CATEGORIES = [
  {
    name: "Laptops",
    description: "Máy tính xách tay cao cấp cho công việc và giải trí",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
  },
  {
    name: "Keyboards",
    description: "Bàn phím cơ học và membrane chất lượng cao",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
  },
  {
    name: "Monitors",
    description: "Màn hình máy tính 4K, 144Hz cho gaming và thiết kế",
    image: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=400",
  },
  {
    name: "Mice",
    description: "Chuột gaming và làm việc văn phòng",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
  },
  {
    name: "Headphones",
    description: "Tai nghe không dây và có dây chất lượng studio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  },
  {
    name: "Storage",
    description: "SSD, HDD và thiết bị lưu trữ ngoài",
    image: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=400",
  },
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing categories and products");

    // Insert categories
    const insertedCategories = await Category.insertMany(CATEGORIES);
    console.log(`📂 Inserted ${insertedCategories.length} categories`);

    const catMap = {};
    insertedCategories.forEach((c) => {
      catMap[c.name] = c._id;
    });

    // Products
    const PRODUCTS = [
      {
        name: 'ZenBook Pro 16" OLED - M2 Max',
        category_id: catMap["Laptops"],
        description:
          "Laptop cao cấp với màn hình OLED 16 inch, chip M2 Max mạnh mẽ, pin 24 giờ. Thiết kế siêu mỏng 15.9mm, trọng lượng chỉ 1.8kg.",
        price: 2499.0,
        stock: 15,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC8BndQVUwEM7lw2g_MB_TA-6D3M8ovFMhP0KyWwJhvh0he5O2klJ4eU0004usrQG5RHrWnUfvnKsjTtNid_WuTXKasA4o232Wnerz-2YLRS0CO1wSocaCLizphgA_GDGrrBLz5CKmLJyW586CGvGYCB7J99w6lI6ZrNaljgggbqF767ycfjw7iaaEOUWwe-oJfLT0qLa1eojQxSpvaH1RWWY_1Bi7wog36lN4XuZtfZe2fhSCP0waRBl88-juoNx6eN5vjhLxbKNLE",
      },
      {
        name: "ProBook Elite 14 Business Laptop",
        category_id: catMap["Laptops"],
        description:
          "Laptop doanh nghiệp với bảo mật vân tay, card đồ họa rời RTX 3050, RAM 16GB DDR5.",
        price: 1299.0,
        stock: 22,
        image:
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600",
      },
      {
        name: "UltraSlim 13 Touch",
        category_id: catMap["Laptops"],
        description:
          "Laptop mỏng nhẹ nhất thế giới, màn hình cảm ứng 2K, pin 20 giờ, Intel Core Ultra 7.",
        price: 999.0,
        stock: 8,
        image:
          "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600",
      },
      {
        name: "Tactile X Mechanical Keyboard",
        category_id: catMap["Keyboards"],
        description:
          "Bàn phím cơ học 75% với switch Blue tactile, đèn RGB per-key, kết nối wireless Bluetooth 5.0 và có dây USB-C.",
        price: 179.0,
        stock: 45,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCzM3T_sa4tZLTnFW89ByEWTCgmbaqXHYLnF5NNJiPpTmy1hQWJa--rISKIELnKjju9ayW1XwFqlrJl_IOuRS1G6OqWUaWYC5pjRhFi3hd0wBph0xUkTJ8nx0Klxmrj6A2t131sZl9KBxcssDC0dFVIL6Y8HX1f3zC-C59OIM0uwKelNXveWjVzmON5R748vYI98j2qd2k7jmo1A17tmDaSTmSBYwQewcirgjGjtCx78GqtRoPuefpOCeiF359tSZAWuY7qiIqN47OP",
      },
      {
        name: "Silent Pro Keyboard TKL",
        category_id: catMap["Keyboards"],
        description:
          "Bàn phím tenkeyless với switch im lặng, phù hợp môi trường văn phòng. Thiết kế compact tiết kiệm không gian.",
        price: 89.0,
        stock: 60,
        image:
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
      },
      {
        name: 'Vision Ultra 34" Curved Display',
        category_id: catMap["Monitors"],
        description:
          "Màn hình cong ultrawide 34 inch 3440x1440 144Hz, IPS panel, HDR400, kết nối USB-C 90W. Lý tưởng cho gaming và đa nhiệm.",
        price: 899.0,
        stock: 12,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA-9ib38Sp0WESzYmCXEjUyoKeZnAgF65rqUQHSeGyrG_KVgElgImP0VWAwViVbCqifKehBdgfpFXb74wUFntBIeSEUDkuOqbbQmAk5wUb2W_PbnV4XZ5vddj-tGvH-CsB5hpUqRUzQSENNrfNaAF3IBVjM2rFT8PG-t5pp33U6F9KjFrbyzwchl2aXmlMlWR8dDn19QdQh2q5dT05YowhoLLKVcumh4fLGH7QvtAMHXil3fkJLY4KsP1y6O3XgXoUOXwiPPSu_DMUF",
      },
      {
        name: '4K Pro Monitor 27"',
        category_id: catMap["Monitors"],
        description:
          "Màn hình 4K UHD 27 inch, Adobe RGB 99%, phù hợp thiết kế đồ họa và chỉnh sửa ảnh/video chuyên nghiệp.",
        price: 649.0,
        stock: 18,
        image:
          "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600",
      },
      {
        name: "Velocity Pro Wireless Mouse",
        category_id: catMap["Mice"],
        description:
          "Chuột gaming không dây 25600 DPI, polling rate 1000Hz, pin sạc 70 giờ, thiết kế ergonomic cho tay phải.",
        price: 129.0,
        stock: 35,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB4A0_SOhtznU4NNX-c_pgKgkENmQO8CW20eyUNASPZv76cE4CMFV3rg-9vfKYfBqrC0XBfIJFZzJP9v9EQ_BIlUHC9lUU_cKbhcLTTEg6JT0KMvHbs8JEtvnSPvLfYKtSKWryM6DZ4aOsdUd9a64ie-pJK2mNhF4svFNsyJ6oc5JsviVeYPIB6zt4FYsWzZHkHM0-tOH3ChFF46E1j_nneoINmVmfdKR2UsQi27ygLmA0-dPibggR-EhydOg5BTiaJ69bWHAA1bb8H",
      },
      {
        name: "Office Comfort Mouse M720",
        category_id: catMap["Mice"],
        description:
          "Chuột văn phòng ergonomic, kết nối đa thiết bị 3 máy, cuộn bánh xe siêu mượt MagSpeed.",
        price: 69.0,
        stock: 80,
        image:
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600",
      },
      {
        name: "Aura ANC Wireless Headphones",
        category_id: catMap["Headphones"],
        description:
          "Tai nghe không dây chống ồn chủ động ANC, driver 40mm premium, pin 40 giờ, Bluetooth 5.2 multipoint.",
        price: 349.0,
        stock: 25,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuC8nbWfwfJyem1tbvK2l7rYTEh_Zz9lchqezppQH8SCZx7iEh7NYMxGvOqAWSfh6VR9hepPrnPBauQ6T0c6giPg26HEu8REGySvGUdm_JKUVxqDKF_dekG-1rXVh-BQwe7rQrWUOSX-wzT90T5nCALAVVlGDcT6fix45c04uyxLMaNSuiXD5qP4DBz8Sd7pt6TJLszBP6eAnxfc7M0UaF1PzLahZYzUhLjnfXkee31UJ_wFvRHMegwWoZZrPDU-F-vgHS-a-e3ARp23",
      },
      {
        name: "Studio Monitor Headphones",
        category_id: catMap["Headphones"],
        description:
          "Tai nghe kiểm âm chuyên nghiệp, flat response, đệm tai memory foam, cáp thay thế được. Chuẩn phòng thu.",
        price: 199.0,
        stock: 20,
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
      },
      {
        name: "Turbo 2TB External NVMe SSD",
        category_id: catMap["Storage"],
        description:
          "SSD NVMe ngoài tốc độ 2000MB/s đọc, 1800MB/s ghi, USB 3.2 Gen 2x2, chống va đập IP55.",
        price: 199.0,
        stock: 40,
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBU45t1bEZEq7Xf2_OioqQODabxzdFdYB_ve5YeqEYh-xV_8N-MHGXLoYg3oUlsL_wWfB7rOubvcNzYETWI9Uy30mEEF03jiVYGVt5DnV5hnpOh-XluWwV8iLYul58x9NpaopKGZG3e45gGzwy8_Wv3yN6bI_yKfbMSqjjZyP0CoOAsnLYV4BpKseUM7A7sikV6DthnyOtQ--p7VlwWW1ln9v7IyLCCW78B4A7ryYfePe-tSznTBrqsQSClQvTac24wE8rmaYxgiAha",
      },
      {
        name: "ProDrive 4TB HDD Desktop",
        category_id: catMap["Storage"],
        description:
          "Ổ cứng HDD 4TB 7200RPM dành cho máy tính bàn, cache 256MB, bảo hành 5 năm.",
        price: 89.0,
        stock: 55,
        image:
          "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=600",
      },
    ];

    const insertedProducts = await Product.insertMany(PRODUCTS);
    console.log(`📦 Inserted ${insertedProducts.length} products`);

    console.log("\n✅ Seed data completed successfully!");
    console.log(`   - ${insertedCategories.length} categories`);
    console.log(`   - ${insertedProducts.length} products`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedData();
