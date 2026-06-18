import pool from "../config/dbConfig.js";

const eventModel = {
  async create(data) {
    const result = await pool.query(
      `INSERT INTO events (user_id, title, description, category, cover_image_url, cover_image_public_id, is_private, is_ongoing, started_at, ended_at)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, user_id, title, description, category, cover_image_url, is_private, is_ongoing, started_at, ended_at, created_at `,
      [
        data.user_id,
        data.title,
        data.description,
        data.category,
        data.cover_image_url,
        data.cover_image_public_id,
        data.is_private,
        data.is_ongoing,
        data.started_at,
        data.ended_at,
      ],
    );
    return result.rows[0];
  },
  async findById(id, userId) {
    const result = await pool.query(
      `SELECT id , user_id, title, description, category, cover_image_url, cover_image_public_id, is_private, is_ongoing, display_order, started_at, ended_at, created_at, updated_at
        FROM events
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL `,
      [id, userId],
    );
    return result.rows[0];
  },
  async findAllByUser(userId) {
    const result = await pool.query(
      `SELECT id, user_id, title, description, category, cover_image_url, is_private, is_ongoing, display_order, started_at, ended_at, created_at
        FROM events
        WHERE user_id = $1 AND deleted_at IS NULL
        ORDER BY display_order ASC, created_at DESC`,[userId],
    );
    return result.rows;
  },

  async updateById(id, userId, data) {
    const result = await pool.query(
      `UPDATE events
        SET 
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            category = COALESCE($3, category),
            cover_image_url = COALESCE($4, cover_image_url),
            cover_image_public_id = COALESCE($5, cover_image_public_id),
            is_private = COALESCE($6, is_private),
            is_ongoing = COALESCE($7, is_ongoing),
            started_at = COALESCE($8, started_at),
            ended_at = COALESCE($9, ended_at) 
            WHERE id = $10 AND user_id = $11 AND deleted_at IS NULL
            RETURNING id, title, description, category, cover_image_url, is_private, is_ongoing, started_at, ended_at, updated_at`,
            [data.title, data.description, data.category, data.cover_image_url, data.cover_image_public_id, data.is_private, data.is_ongoing, data.started_at, data.ended_at, id, userId]
    );
    return result.rows[0];
  },
  async softDeleteById(id, userId) {
    const result = await pool.query(
        `UPDATE events
        set deleted_at = NOW()
        WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
        RETURNING id`,
        [id, userId]
    )
    return result.rows[0];
  },
};

export default eventModel;
