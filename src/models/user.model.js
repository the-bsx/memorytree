import pool from "../config/dbConfig.js";

const userModel = {
  async create(data) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, avatar_url, avatar_public_id, email_verification_token, email_verify_token_expiry)
            VALUES($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, name, email, avatar_url,avatar_public_id, timezone, email_verified, created_at`,
      [
        data.name,
        data.email,
        data.password_hash,
        data.avatar_url,
        data.avatar_public_id,
        data.email_verification_token,
        data.email_verify_token_expiry,
      ],
    );
    return result.rows[0];
  },
  async existsByEmail(email) {
    const result = await pool.query(`SELECT 1 FROM users WHERE email = $1`, [
      email,
    ]);
    return result.rows.length > 0; // return true or false
  },
  async findAuthByEmail(email) {
    const result = await pool.query(
      `SELECT id, email, password_hash, email_verified, is_active, refresh_token 
            FROM users WHERE email = $1 AND deleted_at IS NULL`,
      [email],
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT id, name, email, avatar_url, timezone, email_verified, is_active,refresh_token created_at
            FROM users where id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return result.rows[0];
  },
  async findVerificationToken(token) {
    const result = await pool.query(
      `SELECT id, name, email, email_verify_token_expiry FROM users 
            WHERE email_verification_token = $1 AND deleted_at IS NULL`,
      [token],
    );
    return result.rows[0];
  },

  async updateById(id, data) {
    const result = await pool.query(
      `UPDATE users 
            SET 
            name = COALESCE($1, name),
             avatar_url = COALESCE($2, avatar_url),
             avatar_public_id = COALESCE($3, avatar_public_id),
             timezone = COALESCE($4, timezone)
         WHERE id = $5 
         RETURNING id, name, avatar_url, avatar_public_id, timezone, email_verified, created_at`,
      [data.name, data.avatar_url, data.avatar_public_id, data.timezone, id],
    );
    return result.rows[0];
  },
  async storeRefreshToken(id, refreshToken) {
    await pool.query(
      `UPDATE users SET refresh_token = $1
            WHERE id = $2`,
      [refreshToken, id],
    );
  },
  async verifyEmail(id) {
    await pool.query(
      ` UPDATE users
       SET email_verified = true,
            email_verification_token = NULL,
            email_verify_token_expiry = NULL
            WHERE id = $1`,
      [id],
    );
  },
  async updateVerificationToken(id, token, expiry) {
    await pool.query(
      `UPDATE users 
         SET email_verification_token = $1,
             email_verify_token_expiry = $2
         WHERE id = $3`,
      [token, expiry, id],
    );
  },
};

export default userModel;
