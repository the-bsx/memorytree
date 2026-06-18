import pool from "../config/dbConfig.js";

const memoryModel = {
  async create(data) {
    const result = await pool.query(
      `INSERT into memory_entries (event_id, parent_id, title, body, chapter, mood, mood_score, location_name, latitude, longitude , memory_date )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id, event_id, parent_id, title, body, chapter, mood, mood_score, location_name, latitude, longitude, memory_date, created_at`,
      [
        data.event_id,
        data.parent_id,
        data.title,
        data.body,
        data.chapter,
        data.mood,
        data.mood_score,
        data.location_name,
        data.latitude,
        data.longitude,
        data.memory_date,
      ],
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT id, event_id, parent_id, title, body, chapter, mood, mood_score, location_name, latitude, longitude, memory_date, created_at, updated_at
        FROM memory_entries
        WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return result.rows[0];
  },

  async findAllByEvent(event_id) {
    const result = await pool.query(
      `SELECT id, event_id, parent_id, title, body, chapter, mood, mood_score, location_name, latitude, longitude, memory_date, created_at, updated_at
        FROM memory_entries
        WHERE event_id = $1 AND deleted_at IS NULL
        ORDER BY memory_date DESC `,
      [event_id],
    );
    return result.rows;
  },

  async updateById(id, data) {
    const result = await pool.query(
      ` UPDATE memory_entries
          SET 
            title = COALESCE($1, title),
            body = COALESCE($2, body),
            chapter = COALESCE($3, chapter),
            mood = COALESCE($4, mood),
            mood_score = COALESCE($5, mood_score),
            location_name = COALESCE($6, location_name),
            latitude = COALESCE($7, latitude),
            longitude = COALESCE($8, longitude),
            memory_date = COALESCE($9, memory_date)
        WHERE id = $10 AND deleted_at IS NULL
       RETURNING id, title, body, chapter, mood, mood_score, location_name, latitude, longitude, memory_date, updated_at`,
       [
         data.title,
        data.body,
        data.chapter,
        data.mood,
        data.mood_score,
        data.location_name,
        data.latitude,
        data.longitude,
        data.memory_date,
        id
       ]
    );
    return result.rows[0];
  },

  async softDeleteById(id) {
    const result = await pool.query(
        `UPDATE memory_entries 
        SET deleted_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id`,
        [id]
    )
    return result.rows[0];
  }
};

export default memoryModel;