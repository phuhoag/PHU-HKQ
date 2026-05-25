import {
  executeQuery,
  executeQueryOne,
  executeInsert,
  executeUpdate,
  executeDelete,
} from "../utils/database.js";

class UserModel {
  /**
   * Get all users
   */
  static async getAllUsers() {
    const query =
      "SELECT id, email, first_name, last_name, phone, role, is_active, created_at FROM users";
    return await executeQuery(query);
  }

  /**
   * Get user by ID
   */
  static async getUserById(id) {
    const query =
      "SELECT id, email, first_name, last_name, phone, avatar, address, role, is_active, created_at, updated_at FROM users WHERE id = ?";
    return await executeQueryOne(query, [id]);
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email) {
    const query = "SELECT * FROM users WHERE email = ?";
    return await executeQueryOne(query, [email]);
  }

  /**
   * Create new user
   */
  static async createUser(userData) {
    const {
      email,
      password,
      firstName,
      lastName,
      fullName,
      phone,
      role = "user",
    } = userData;

    const query =
      "INSERT INTO users (email, password, first_name, last_name, full_name, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)";

    return await executeInsert(query, [
      email,
      password,
      firstName,
      lastName,
      fullName,
      phone,
      role,
    ]);
  }

  /**
   * Update user
   */
  static async updateUser(id, userData) {
    const { firstName, lastName, fullName, phone, avatar, address, isActive } =
      userData;

    const query =
      "UPDATE users SET first_name = ?, last_name = ?, full_name = ?, phone = ?, avatar = ?, address = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";

    return await executeUpdate(query, [
      firstName,
      lastName,
      fullName,
      phone,
      avatar,
      address,
      isActive,
      id,
    ]);
  }

  /**
   * Update user password
   */
  static async updatePassword(id, hashedPassword) {
    const query =
      "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    return await executeUpdate(query, [hashedPassword, id]);
  }

  /**
   * Delete user
   */
  static async deleteUser(id) {
    const query = "DELETE FROM users WHERE id = ?";
    return await executeDelete(query, [id]);
  }

  /**
   * Check if email exists
   */
  static async emailExists(email) {
    const query = "SELECT id FROM users WHERE email = ?";
    const result = await executeQueryOne(query, [email]);
    return result !== null;
  }

  /**
   * Get active users count
   */
  static async getActiveUsersCount() {
    const query = "SELECT COUNT(*) as count FROM users WHERE is_active = TRUE";
    const result = await executeQueryOne(query);
    return result?.count || 0;
  }
}

export default UserModel;
