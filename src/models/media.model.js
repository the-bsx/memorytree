import pool from "../config/dbConfig.js";

const mediaModel = {
    async create(data) {
        const result = await pool.query(
            `INSERT INTO media (memory_entry_id, url, public_id, media_type, caption, file_size_bytes, mime_type)
            VALUES($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, memory_entry_id, url, media_type, caption, file_size_bytes, mime_type, created_at `,
            [
                data.memory_entry_id,
                data.url,
                data.public_id,
                data.media_type,
                data.caption,
                data.file_size_bytes,
                data.mime_type,
            ]
        )
        return result.rows[0];
    },

    async findById(id) {
        const result = await pool.query(
            `SELECT id, memory_entry_id, url, media_type, caption, file_size_bytes, mime_type, created_at
            FROM media 
            WHERE id = $1`,
            [id]
        )
        return result.rows[0];
    },

    async findAllByMemoryEntry(memoryEntryId) {
        const result = await pool.query(
            `SELECT id, memory_entry_id, url, media_type, caption, file_size_bytes, mime_type, created_at
            FROM media 
            WHERE memory_entry_id = $1`,
            [memoryEntryId]
        )
        return result.rows;
    },

    async updateCaption(id, caption) {
        const result = await pool.query(
            `UPDATE media
            SET caption = $1
            WHERE id = $2
            RETURNING id, caption`,
            [caption, id]
        )
        return result.rows[0];
    },

    async deleteById(id) {
        const result = await pool.query(
            `DELETE FROM media
            WHERE id = $1
            RETURNING id, public_id`,
            [id]
        )
        return result.rows[0];
    }
}

export default mediaModel;