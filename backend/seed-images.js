/**
 * Seed gallery images cho tất cả sản phẩm
 * Chạy: node seed-images.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const productImageSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    image_url: { type: String, required: true },
    alt_text: { type: String, default: "" },
    display_order: { type: Number, default: 0 },
    is_primary: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);
const productSchema = new mongoose.Schema(
  { name: String, image: String },
  { timestamps: true, versionKey: false }
);

const ProductImage = mongoose.model("ProductImage", productImageSchema);
const Product = mongoose.model("Product", productSchema);

// ============================================================
// GALLERY DATA - tất cả 13 sản phẩm
// ============================================================
const galleryMap = {

  // ───────────────── LAPTOPS ─────────────────
  'ZenBook Pro 16" OLED - M2 Max': [
    {
      image_url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800",
      alt_text: "ZenBook Pro - Tổng thể",
      display_order: 0,
      is_primary: true,
    },
    {
      image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
      alt_text: "ZenBook Pro - Màn hình OLED",
      display_order: 1,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
      alt_text: "ZenBook Pro - Bàn phím và touchpad",
      display_order: 2,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800",
      alt_text: "ZenBook Pro - Góc nghiêng siêu mỏng",
      display_order: 3,
      is_primary: false,
    },
  ],

  "ProBook Elite 14 Business Laptop": [
    {
      image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
      alt_text: "ProBook Elite - Màn hình mở",
      display_order: 0,
      is_primary: true,
    },
    {
      image_url: "https://images.unsplash.com/photo-1542393545-10f5cde2c810?w=800",
      alt_text: "ProBook Elite - Bàn phím business",
      display_order: 1,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800",
      alt_text: "ProBook Elite - Thiết kế mỏng nhẹ",
      display_order: 2,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800",
      alt_text: "ProBook Elite - Góc cạnh",
      display_order: 3,
      is_primary: false,
    },
  ],

  "UltraSlim 13 Touch": [
    {
      image_url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800",
      alt_text: "UltraSlim 13 - Siêu mỏng",
      display_order: 0,
      is_primary: true,
    },
    {
      image_url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800",
      alt_text: "UltraSlim 13 - Màn hình cảm ứng",
      display_order: 1,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800",
      alt_text: "UltraSlim 13 - Góc cạnh mỏng",
      display_order: 2,
      is_primary: false,
    },
  ],

  // ───────────────── KEYBOARDS ─────────────────
  "Tactile X Mechanical Keyboard": [
    {
      image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCzM3T_sa4tZLTnFW89ByEWTCgmbaqXHYLnF5NNJiPpTmy1hQWJa--rISKIELnKjju9ayW1XwFqlrJl_IOuRS1G6OqWUaWYC5pjRhFi3hd0wBph0xUkTJ8nx0Klxmrj6A2t131sZl9KBxcssDC0dFVIL6Y8HX1f3zC-C59OIM0uwKelNXveWjVzmON5R748vYI98j2qd2k7jmo1A17tmDaSTmSBYwQewcirgjGjtCx78GqtRoPuefpOCeiF359tSZAWuY7qiIqN47OP",
      alt_text: "Tactile X - Tổng thể",
      display_order: 0,
      is_primary: true,
    },
    {
      image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
      alt_text: "Tactile X - Chi tiết phím",
      display_order: 1,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800",
      alt_text: "Tactile X - Đèn RGB",
      display_order: 2,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1574012716378-0ca6f4c18c08?w=800",
      alt_text: "Tactile X - Góc nghiêng",
      display_order: 3,
      is_primary: false,
    },
  ],

  "Silent Pro Keyboard TKL": [
    {
      image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
      alt_text: "Silent Pro TKL - Tổng thể",
      display_order: 0,
      is_primary: true,
    },
    {
      image_url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800",
      alt_text: "Silent Pro TKL - Chi tiết phím im lặng",
      display_order: 1,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1563191911-e65a8f38d8fc?w=800",
      alt_text: "Silent Pro TKL - Layout compact TKL",
      display_order: 2,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1574012716378-0ca6f4c18c08?w=800",
      alt_text: "Silent Pro TKL - Góc chụp trên",
      display_order: 3,
      is_primary: false,
    },
  ],

  // ───────────────── MONITORS ─────────────────
  'Vision Ultra 34" Curved Display': [
    {
      image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA-9ib38Sp0WESzYmCXEjUyoKeZnAgF65rqUQHSeGyrG_KVgElgImP0VWAwViVbCqifKehBdgfpFXb74wUFntBIeSEUDkuOqbbQmAk5wUb2W_PbnV4XZ5vddj-tGvH-CsB5hpUqRUzQSENNrfNaAF3IBVjM2rFT8PG-t5pp33U6F9KjFrbyzwchl2aXmlMlWR8dDn19QdQh2q5dT05YowhoLLKVcumh4fLGH7QvtAMHXil3fkJLY4KsP1y6O3XgXoUOXwiPPSu_DMUF",
      alt_text: "Vision Ultra 34 - Toàn cảnh",
      display_order: 0,
      is_primary: true,
    },
    {
      image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
      alt_text: "Vision Ultra 34 - Trên bàn làm việc",
      display_order: 1,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1593640408182-31c228484986?w=800",
      alt_text: "Vision Ultra 34 - Cận cảnh màn hình cong",
      display_order: 2,
      is_primary: false,
    },
  ],

  '4K Pro Monitor 27"': [
    {
      image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
      alt_text: "4K Pro Monitor - Chính diện",
      display_order: 0,
      is_primary: true,
    },
    {
      image_url: "https://images.unsplash.com/photo-1593640408182-31c228484986?w=800",
      alt_text: "4K Pro Monitor - Cận màn hình 4K",
      display_order: 1,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1616763355548-1b606f439f86?w=800",
      alt_text: "4K Pro Monitor - Thiết lập bàn làm việc",
      display_order: 2,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=800",
      alt_text: "4K Pro Monitor - Góc nghiêng",
      display_order: 3,
      is_primary: false,
    },
  ],

  // ───────────────── MICE ─────────────────
  "Velocity Pro Wireless Mouse": [
    {
      image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4A0_SOhtznU4NNX-c_pgKgkENmQO8CW20eyUNASPZv76cE4CMFV3rg-9vfKYfBqrC0XBfIJFZzJP9v9EQ_BIlUHC9lUU_cKbhcLTTEg6JT0KMvHbs8JEtvnSPvLfYKtSKWryM6DZ4aOsdUd9a64ie-pJK2mNhF4svFNsyJ6oc5JsviVeYPIB6zt4FYsWzZHkHM0-tOH3ChFF46E1j_nneoINmVmfdKR2UsQi27ygLmA0-dPibggR-EhydOg5BTiaJ69bWHAA1bb8H",
      alt_text: "Velocity Pro - Nhìn từ trên",
      display_order: 0,
      is_primary: true,
    },
    {
      image_url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800",
      alt_text: "Velocity Pro - Tổng thể",
      display_order: 1,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800",
      alt_text: "Velocity Pro - Chi tiết bên hông",
      display_order: 2,
      is_primary: false,
    },
  ],

  "Office Comfort Mouse M720": [
    {
      image_url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800",
      alt_text: "Office Mouse M720 - Tổng thể",
      display_order: 0,
      is_primary: true,
    },
    {
      image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800",
      alt_text: "Office Mouse M720 - Thiết kế ergonomic",
      display_order: 1,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1586349906319-47f4b5ec3348?w=800",
      alt_text: "Office Mouse M720 - Nút chuyển thiết bị",
      display_order: 2,
      is_primary: false,
    },
  ],

  // ───────────────── HEADPHONES ─────────────────
  "Aura ANC Wireless Headphones": [
    {
      image_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8nbWfwfJyem1tbvK2l7rYTEh_Zz9lchqezppQH8SCZx7iEh7NYMxGvOqAWSfh6VR9hepPrnPBauQ6T0c6giPg26HEu8REGySvGUdm_JKUVxqDKF_dekG-1rXVh-BQwe7rQrWUOSX-wzT90T5nCALAVVlGDcT6fix45c04uyxLMaNSuiXD5qP4DBz8Sd7pt6TJLszBP6eAnxfc7M0UaF1PzLahZYzUhLjnfXkee31UJ_wFvRHMegwWoZZrPDU-F-vgHS-a-e3ARp23",
      alt_text: "Aura ANC - Chính diện",
      display_order: 0,
      is_primary: true,
    },
    {
      image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      alt_text: "Aura ANC - Góc nghiêng",
      display_order: 1,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800",
      alt_text: "Aura ANC - Chi tiết đệm tai",
      display_order: 2,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
      alt_text: "Aura ANC - Phong cách sử dụng",
      display_order: 3,
      is_primary: false,
    },
  ],

  "Studio Monitor Headphones": [
    {
      image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      alt_text: "Studio Monitor - Chính diện",
      display_order: 0,
      is_primary: true,
    },
    {
      image_url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800",
      alt_text: "Studio Monitor - Đệm tai memory foam",
      display_order: 1,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800",
      alt_text: "Studio Monitor - Chi tiết headband",
      display_order: 2,
      is_primary: false,
    },
  ],

  // ───────────────── STORAGE ─────────────────
  "Turbo 2TB External NVMe SSD": [
    {
      image_url: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800",
      alt_text: "Turbo SSD - Tổng thể",
      display_order: 0,
      is_primary: true,
    },
    {
      image_url: "https://images.unsplash.com/photo-1531492153519-3257620a7c97?w=800",
      alt_text: "Turbo SSD - Cổng USB-C tốc độ cao",
      display_order: 1,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800",
      alt_text: "Turbo SSD - Thiết kế compact",
      display_order: 2,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1617791160536-598cf32026fb?w=800",
      alt_text: "Turbo SSD - Kết nối với laptop",
      display_order: 3,
      is_primary: false,
    },
  ],

  "ProDrive 4TB HDD Desktop": [
    {
      image_url: "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=800",
      alt_text: "ProDrive HDD - Tổng thể",
      display_order: 0,
      is_primary: true,
    },
    {
      image_url: "https://images.unsplash.com/photo-1531492153519-3257620a7c97?w=800",
      alt_text: "ProDrive HDD - Cổng kết nối",
      display_order: 1,
      is_primary: false,
    },
    {
      image_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800",
      alt_text: "ProDrive HDD - Thiết kế desktop",
      display_order: 2,
      is_primary: false,
    },
  ],
};

// ============================================================
async function seedImages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products`);

    // Xóa gallery cũ
    await ProductImage.deleteMany({});
    console.log("🗑️  Cleared existing product images");

    let totalInserted = 0;

    for (const product of products) {
      const images = galleryMap[product.name];
      if (images && images.length > 0) {
        const toInsert = images.map((img) => ({
          ...img,
          product_id: product._id,
        }));
        await ProductImage.insertMany(toInsert);
        console.log(`  🖼️  ${product.name}: ${toInsert.length} ảnh`);
        totalInserted += toInsert.length;
      } else {
        console.log(`  ⚠️  ${product.name}: chưa có gallery`);
      }
    }

    console.log(`\n✅ Seed images hoàn thành!`);
    console.log(`   - ${totalInserted} gallery images cho ${Object.keys(galleryMap).length} sản phẩm`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedImages();
