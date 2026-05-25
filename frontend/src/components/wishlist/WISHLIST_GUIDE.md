# Wishlist Feature Documentation

## 🎁 Tổng quan

Tính năng Wishlist cho phép người dùng:

- Lưu sản phẩm yêu thích
- Xem danh sách các sản phẩm đã lưu
- Quản lý wishlist (thêm/xóa sản phẩm)
- Dữ liệu lưu trong localStorage (persistence)

## 📁 Các file tạo mới

### 1. `src/context/WishlistContext.jsx`

Context quản lý state wishlist

**Functions:**

- `addToWishlist(product)` - Thêm sản phẩm vào wishlist
- `removeFromWishlist(productId)` - Xóa sản phẩm khỏi wishlist
- `isInWishlist(productId)` - Kiểm tra sản phẩm có trong wishlist không
- `toggleWishlist(product)` - Thêm/xóa sản phẩm
- `clearWishlist()` - Xóa toàn bộ wishlist
- `getWishlistCount()` - Lấy số lượng sản phẩm
- `useWishlist()` - Hook để sử dụng context

**Dữ liệu lưu:**

```javascript
{
  id: 1,
  name: "Product Name",
  price: 999.99,
  brand: "Brand Name",
  rating: 4.5,
  reviews: 120,
  stock: 50,
  image: "url",
  addedAt: "2026-05-20T10:30:00Z"
}
```

### 2. `src/components/wishlist/WishlistItem.jsx`

Component hiển thị từng sản phẩm trong wishlist

**Features:**

- Hiển thị ảnh, tên, brand, giá sản phẩm
- Hiển thị số lượng tồn kho
- Hiển thị giá gốc và % giảm giá (nếu có)
- Nút "Add to Cart"
- Nút xóa khỏi wishlist
- Responsive design

### 3. `src/pages/WishlistPage.jsx`

Trang hiển thị danh sách wishlist

**Features:**

- Header với số lượng sản phẩm
- Hiển thị từng sản phẩm bằng WishlistItem
- Empty state khi không có sản phẩm
- Nút "Clear Wishlist" và "Continue Shopping"
- Responsive layout

## 🔧 Cách sử dụng

### Trong Component

```jsx
import { useWishlist } from "../context/WishlistContext";

export default function MyComponent() {
  const {
    wishlist, // Mảng sản phẩm trong wishlist
    addToWishlist, // Function thêm
    removeFromWishlist, // Function xóa
    isInWishlist, // Function kiểm tra
    toggleWishlist, // Function thêm/xóa
    getWishlistCount, // Function lấy số lượng
  } = useWishlist();

  const handleAddWishlist = () => {
    toggleWishlist({ id: 1, name: "Product", price: 99.99 });
  };

  return (
    <div>
      <button onClick={handleAddWishlist}>
        {isInWishlist(1) ? "❤️ In Wishlist" : "🤍 Add to Wishlist"}
      </button>
      <p>Items in wishlist: {getWishlistCount()}</p>
    </div>
  );
}
```

### Integration với ProductCard

ProductCard đã được cập nhật để hiển thị wishlist button:

- ❤️ icon (đỏ) nếu sản phẩm đã trong wishlist
- 🤍 icon (trắng) nếu chưa thêm vào wishlist
- Click để toggle thêm/xóa
- Button nằm ở góc trên cùng bên phải ảnh sản phẩm

## 📍 Routes

```
GET /wishlist - Trang xem wishlist
```

Được tự động thêm vào `src/routers/routes.jsx`

## 💾 Lưu trữ dữ liệu

### Client-side (localStorage)

- Wishlist được tự động lưu vào `localStorage` với key: `wishlist`
- Dữ liệu được tự động load khi component mount
- Dữ liệu được tự động update khi wishlist thay đổi

**Ví dụ localStorage:**

```json
[
  {
    "id": 1,
    "name": "Laptop",
    "price": 999.99,
    "addedAt": "2026-05-20T10:30:00Z"
  }
]
```

### Server-side (Backend)

Bảng `wishlists` trong database đã tồn tại với các field:

- `id` - Primary key
- `user_id` - ID của người dùng
- `product_id` - ID của sản phẩm
- `created_at` - Thời gian thêm

## 🔄 Các bước tiếp theo (TODO)

### 1. Sync với Backend

```javascript
// Khi user login: Load wishlist từ database
const loadWishlistFromServer = async () => {
  const response = await fetch("/api/wishlists");
  const wishlistData = await response.json();
  // Update state
};

// Khi thêm/xóa: Gửi request tới backend
const syncToServer = async (product) => {
  await fetch("/api/wishlists", {
    method: "POST",
    body: JSON.stringify({ product_id: product.id }),
  });
};
```

### 2. Tích hợp với Cart

```javascript
// WishlistItem.jsx - Implement Add to Cart
const handleAddToCart = () => {
  addToCart(product);
  removeFromWishlist(product.id);
  // Optional: Show notification
};
```

### 3. Notifications

```javascript
// Khi add/remove wishlist
const handleToggleWishlist = (product) => {
  toggleWishlist(product);
  showNotification({
    message: inWishlist(product.id)
      ? "Removed from wishlist"
      : "Added to wishlist",
    type: "success",
  });
};
```

### 4. Share Wishlist

```javascript
// Copy wishlist link hoặc share
const generateWishlistLink = () => {
  const ids = wishlist.map((p) => p.id).join(",");
  return `${window.location.origin}/wishlist/${ids}`;
};
```

## 🎨 Styling

### Icons sử dụng

- `MdFavoriteBorder` - Icon trái tim rỗng (chưa thêm)
- `MdFavorite` - Icon trái tim đỏ (đã thêm)
- `MdShoppingBag` - Icon giỏ hàng (header)
- `MdClose` - Icon xóa
- `MdAddShoppingCart` - Icon thêm vào cart

### Colors

- `text-error` - Đỏ cho icon yêu thích (active)
- `text-on-surface-variant` - Xám cho icon chưa thêm
- `bg-primary` - Nút hành động chính
- `bg-surface-container` - Nền mặc định

## 🔒 Validation

- Không thêm được sản phẩm trùng vào wishlist
- Xóa sản phẩm khỏi wishlist nếu user nhấn lại
- localStorage được validate trước khi load
- Error handling cho JSON parse

## 📊 Performance

- Dữ liệu lưu trong localStorage (nhanh)
- Không có API call (trừ khi sync với server)
- Re-render tối ưu bằng React Context
- Lazy load WishlistPage

## 🐛 Troubleshooting

### Wishlist không hiển thị

- Kiểm tra WishlistProvider đã wrap App chưa
- Check browser console có error không

### Button wishlist không work

- Kiểm tra useWishlist hook được gọi đúng chưa
- Kiểm tra ProductCard import WishlistContext

### Dữ liệu mất khi reload

- Kiểm tra localStorage được bật
- Check browser settings privacy

## 📚 Related Files

- `src/context/CartContext.jsx` - Cart context (tương tự pattern)
- `src/components/products/ProductCard.jsx` - Updated with wishlist button
- `src/routers/routes.jsx` - Route `/wishlist` added
- `src/App.jsx` - WishlistProvider added
