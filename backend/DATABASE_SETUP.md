# Backend Database Setup Guide

## ✅ Các file đã tạo

### 1. `.env` - Biến môi trường

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=ecommerce_db
```

**Cần sửa**: Thay `DB_PASSWORD` bằng password MySQL của bạn

### 2. `src/config/database.js` - Database connection pool

- Khởi tạo connection pool MySQL
- Tự động test kết nối khi server start
- Handle connection errors

### 3. `src/utils/database.js` - Database utility functions

Cung cấp các function tiện ích:

- `executeQuery()` - SELECT queries
- `executeInsert()` - INSERT queries
- `executeUpdate()` - UPDATE queries
- `executeDelete()` - DELETE queries
- `executeTransaction()` - Multiple queries in transaction

### 4. `src/models/User.js` - Example model

Ví dụ cách tạo model với các method CRUD:

- `getAllUsers()`
- `getUserById(id)`
- `getUserByEmail(email)`
- `createUser(userData)`
- `updateUser(id, userData)`
- `deleteUser(id)`

### 5. `src/server.js` - Updated server.js

- Import database connection
- Test database khi server start
- Health check endpoint `/api/health`

---

## 🚀 Bước setup

### 1. Cập nhật `.env` file

```bash
# Sửa file backend/.env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password  # ← Thay bằng password của bạn
DB_NAME=ecommerce_db
```

### 2. Cài dependencies (nếu chưa)

```bash
cd backend
npm install
```

### 3. Import database schema

```bash
# Sử dụng file ecommerce.sql đã được nâng cấp
mysql -u root -p < ../ecommerce.sql
```

Hoặc dùng phpMyAdmin:

- Import file `ecommerce.sql`
- Chọn database `ecommerce_db`

### 4. Start backend server

```bash
npm run dev
```

Nếu kết nối thành công, bạn sẽ thấy:

```
✅ Connected to MySQL Database successfully!
✅ Server running on port 5000
📍 API available at http://localhost:5000/api
```

---

## 📝 Cách sử dụng

### Ví dụ 1: Lấy tất cả users

```javascript
import UserModel from "../models/User.js";

const users = await UserModel.getAllUsers();
console.log(users);
```

### Ví dụ 2: Lấy user theo ID

```javascript
const user = await UserModel.getUserById(1);
console.log(user);
```

### Ví dụ 3: Tạo user mới

```javascript
const result = await UserModel.createUser({
  email: "user@example.com",
  password: "hashed_password",
  firstName: "John",
  lastName: "Doe",
  fullName: "John Doe",
  phone: "0123456789",
});

console.log("New user ID:", result.id);
```

### Ví dụ 4: Update user

```javascript
await UserModel.updateUser(1, {
  firstName: "Jane",
  lastName: "Smith",
  phone: "0987654321",
});
```

### Ví dụ 5: Tạo custom query

```javascript
import { executeQuery } from "../utils/database.js";

const products = await executeQuery(
  "SELECT * FROM products WHERE category_id = ? AND price > ?",
  [1, 100],
);
```

### Ví dụ 6: Transaction (multiple queries)

```javascript
import { executeTransaction } from "../utils/database.js";

await executeTransaction([
  {
    query:
      "INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)",
    params: [1, 250.99, "pending"],
  },
  {
    query: "UPDATE products SET stock = stock - 1 WHERE id = ?",
    params: [5],
  },
]);
```

---

## 🔧 Tạo Models khác

Tương tự User model, tạo cho:

- `src/models/Product.js`
- `src/models/Category.js`
- `src/models/Order.js`
- `src/models/Cart.js`
- `src/models/Review.js`
- `src/models/Wishlist.js`
- v.v...

Mẫu cơ bản:

```javascript
import {
  executeQuery,
  executeInsert,
  executeUpdate,
  executeDelete,
} from "../utils/database.js";

class ProductModel {
  static async getAllProducts() {
    const query = "SELECT * FROM products";
    return await executeQuery(query);
  }

  static async getProductById(id) {
    const query = "SELECT * FROM products WHERE id = ?";
    return await executeQuery(query, [id]);
  }

  // ... thêm các method khác
}

export default ProductModel;
```

---

## ✅ Testing Endpoints

### Test health check

```bash
curl http://localhost:5000/api/health
```

Response:

```json
{
  "status": "Server is running"
}
```

### Test main API

```bash
curl http://localhost:5000/api
```

Response:

```json
{
  "message": "Ecommerce API"
}
```

---

## 🐛 Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:3306"

- MySQL server không chạy
- Kiểm tra: `mysql -u root -p`

### Error: "Access denied for user 'root'@'localhost'"

- Kiểm tra password trong `.env` file
- Đặt lại MySQL password nếu cần

### Error: "Unknown database 'ecommerce_db'"

- Import schema từ file `ecommerce.sql`
- `mysql -u root -p < ecommerce.sql`

### Error: "PROTOCOL_CONNECTION_LOST"

- MySQL server disconnected
- Kiểm tra MySQL logs
- Restart MySQL service

---

## 📚 Tiếp theo

1. ✅ Tạo controllers cho các routes
2. ✅ Tạo validation middleware
3. ✅ Tạo authentication (JWT)
4. ✅ Tạo error handling
5. ✅ Tạo API routes

Bạn cần hỗ trợ bước nào tiếp theo? 🚀
