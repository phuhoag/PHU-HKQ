import pool from "../config/database.js";

/**
 * Execute a SELECT query
 * @param {string} query - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise<array>} Query results
 */
export const executeQuery = async (query, params = []) => {
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.execute(query, params);
    connection.release();
    return results;
  } catch (error) {
    console.error("Database Query Error:", error.message);
    throw error;
  }
};

/**
 * Execute a query that returns first row
 * @param {string} query - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise<object>} First row or null
 */
export const executeQueryOne = async (query, params = []) => {
  try {
    const results = await executeQuery(query, params);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error("Database Query Error:", error.message);
    throw error;
  }
};

/**
 * Execute INSERT query
 * @param {string} query - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise<object>} Result with insertId and affectedRows
 */
export const executeInsert = async (query, params = []) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(query, params);
    connection.release();
    return {
      id: result.insertId,
      affectedRows: result.affectedRows,
    };
  } catch (error) {
    console.error("Database Insert Error:", error.message);
    throw error;
  }
};

/**
 * Execute UPDATE query
 * @param {string} query - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise<object>} Result with affectedRows and changedRows
 */
export const executeUpdate = async (query, params = []) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(query, params);
    connection.release();
    return {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
    };
  } catch (error) {
    console.error("Database Update Error:", error.message);
    throw error;
  }
};

/**
 * Execute DELETE query
 * @param {string} query - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise<object>} Result with affectedRows
 */
export const executeDelete = async (query, params = []) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.execute(query, params);
    connection.release();
    return {
      affectedRows: result.affectedRows,
    };
  } catch (error) {
    console.error("Database Delete Error:", error.message);
    throw error;
  }
};

/**
 * Execute multiple queries in transaction
 * @param {array} queries - Array of {query, params}
 * @returns {Promise<array>} Array of results
 */
export const executeTransaction = async (queries) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const results = [];
    for (const { query, params = [] } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }

    await connection.commit();
    connection.release();
    return results;
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Transaction Error:", error.message);
    throw error;
  }
};
