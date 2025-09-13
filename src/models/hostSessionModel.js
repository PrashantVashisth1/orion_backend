// host-sessions-db.js (or wherever your database interaction functions are)
import pool from '../config/db.js';

// No longer needed in backend, as frontend handles it
// const TABLE_MAP = {
//   webinar: 'webinar_sessions',
//   panel: 'panel_sessions',
//   demo: 'demo_sessions'
// };

export async function insertHostSession(sessionType, sessionData, userId) {
    let query, values;

    // Common fields extracted from sessionData
    const date = sessionData.date;
    const time = sessionData.time;
    const duration = sessionData.duration;
    const link = sessionData.link || ''; // Ensure empty string if not provided

    // Ensure description is consistently handled, deriving from specific fields if needed
    let description;

    switch (sessionType) {
        case 'webinar_sessions': // Use the full backendSessionType as sent from frontend
            // Frontend: sessionDataToSend = { title, description, date, time, duration, audience, speakers, contact, link }
            
            description = sessionData.description || '';
            const speakers = sessionData.speakers || [];
            const audience = sessionData.audience || [];
            const contact = sessionData.contact || '';

            // Validate critical fields for webinar
            if (!sessionData.title || !date || !time || !duration || speakers.length === 0 || audience.length === 0) {
                throw new Error('Missing required fields for webinar session');
            }

            query = `
                INSERT INTO webinar_sessions
                (title, description, date, time, duration, audience, speakers, contact, link, user_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *`;
            values = [
                sessionData.title,
                description,
                date,
                time,
                duration,
                audience, // PostgreSQL can handle TEXT[] arrays directly
                JSON.stringify(speakers), // Convert array of objects to JSON string for JSONB column
                contact,
                link,
                userId
            ];
            break;

        case 'panel_sessions': // Use the full backendSessionType
            // Frontend: sessionDataToSend = { title (from topic), description (from bio), date, time, duration, panelists, moderator, link }
            
            description = sessionData.description || ''; // Already derived from panelistBio in frontend
            const panelists = sessionData.panelists || [];
            const moderator = sessionData.moderator || {};

            // Validate critical fields for panel
            if (!sessionData.title || !date || !time || !duration || panelists.length === 0 || !moderator.name) {
                throw new Error('Missing required fields for panel session');
            }

            query = `
                INSERT INTO panel_sessions
                (title, description, date, time, duration, panelists, moderator, link, user_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *`;
            values = [
                sessionData.title, // Mapped from topic in frontend
                description,
                date,
                time,
                duration,
                JSON.stringify(panelists), // Convert array of objects to JSON string for JSONB column
                JSON.stringify(moderator), // Convert object to JSON string for JSONB column
                link,
                userId
            ];
            break;

        case 'demo_sessions': // Use the full backendSessionType
            // Frontend: sessionDataToSend = { title, description (from product/company), date, time, duration, presenter, aboutCompany, aboutProduct, link }

            description = sessionData.description || ''; // Already derived from aboutProduct/aboutCompany in frontend
            const presenter = sessionData.presenter || {};
            const aboutCompany = sessionData.aboutCompany || '';
            const aboutProduct = sessionData.aboutProduct || '';

            // Validate critical fields for demo
            if (!sessionData.title || !date || !time || !duration || !presenter.name) {
                throw new Error('Missing required fields for demo session');
            }

            query = `
                INSERT INTO demo_sessions
                (title, description, date, time, duration, presenter, about_company, about_product, link, user_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *`;
            values = [
                sessionData.title,
                description,
                date,
                time,
                duration,
                JSON.stringify(presenter), 
                aboutCompany,
                aboutProduct,
                link,
                userId
            ];
            break;

        default:
            throw new Error(`Invalid sessionType: ${sessionType}`);
    }

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error(`Error inserting ${sessionType} session:`, error);
        throw error; // Re-throw to be caught by the API route handler
    }
}

// Ensure your API route calls this function with the correct backendSessionType string
// E.g., from pages/api/host-sessions.js (or your equivalent route handler):
/*
import { insertHostSession } from '../../path/to/host-sessions-db.js'; // Adjust path

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { sessionType, sessionData, userId } = req.body; // sessionType will be 'webinar_sessions', 'panel_sessions', 'demo_sessions'

  try {
    const newSession = await insertHostSession(sessionType, sessionData, userId);
    res.status(201).json({ success: true, message: `${sessionType.replace('_', ' ')} created successfully!`, data: newSession });
  } catch (error) {
    console.error('API Error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to create session' });
  }
}
*/

// The fetchHostSessions function remains largely the same, but ensure column names match
// and handle JSONB parsing on retrieval.
export async function fetchHostSessions() {
    const queries = [
        // Ensure all selected columns match your table schema
        pool.query(`
            SELECT
                id, 'webinar' AS session_type, title, description, date, time, duration,
                audience, speakers, contact, link, user_id, created_at
            FROM webinar_sessions
        `),
        pool.query(`
            SELECT
                id, 'panel' AS session_type, title, description, date, time, duration,
                panelists, moderator, link, user_id, created_at
            FROM panel_sessions
        `),
        pool.query(`
            SELECT
                id, 'demo' AS session_type, title, description, date, time, duration,
                presenter, about_company, about_product, link, user_id, created_at
            FROM demo_sessions
        `)
    ];

    try {
        const results = await Promise.all(queries);
        // Map over results to parse JSONB fields back to JavaScript objects
        const sessions = results.flatMap(r => r.rows.map(row => {
            if (row.session_type === 'webinar' && row.speakers) {
                row.speakers = typeof row.speakers === 'string' ? JSON.parse(row.speakers) : row.speakers;
            } else if (row.session_type === 'panel') {
                if (row.panelists) row.panelists = typeof row.panelists === 'string' ? JSON.parse(row.panelists) : row.panelists;
                if (row.moderator) row.moderator = typeof row.moderator === 'string' ? JSON.parse(row.moderator) : row.moderator;
            } else if (row.session_type === 'demo' && row.presenter) {
                row.presenter = typeof row.presenter === 'string' ? JSON.parse(row.presenter) : row.presenter;
            }
            return row;
        }));

        // Corrected line: removed the typo and the "i think" comment.
        sessions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return sessions;
    } catch (error) {
        console.log(error);
        console.error('Error fetching host sessions:', error);
        throw error;
    }
}