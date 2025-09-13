import pool from '../config/db.js';

const TABLE_MAP = {
    'live-projects': 'live_projects',
    'internship': 'internships',
    'research': 'research',
    'csr-initiative': 'csr_initiatives'
};

export async function insertNeed(formType, formData, userId) {
    const table = TABLE_MAP[formType];
    if (!table) throw new Error('Invalid formType');

    let query, values;
    // Object to store additional form data that doesn't have a direct, explicit column
    // This will be stored as JSON in the 'details_json' column.
    let details = {};

    // Common fields that might not have direct columns or are supplementary
    details.companyName = formData.companyName;
    // Store the image URL in details_json, as there's no explicit image_url column in the schema
    details.imageUrl = formData[`${formType.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}Image`] || null;
    details.email = formData[`${formType.replace('-', '')}Email`]; // e.g., projectEmail, internshipEmail
    details.phone = formData[`${formType.replace('-', '')}Phone`]; // e.g., projectPhone, internshipPhone

    if (formType === 'live-projects') {
        // Explicitly mapped columns from frontend formData to backend table schema
        const projectTitle = formData.projectTitle;
        const description = formData.projectDescription;
        const skills = formData.projectSkills;
        const duration = formData.projectDuration;
        const teamSize = formData.projectTeamSize;
        // Prioritize location from mode (offline/hybrid) if available, otherwise use general location
        const location = formData.projectModeLocation || formData.projectLocation || null;
        const contact = formData.projectCvEmail; // Using CV email as the primary contact for this table

        // Add other live-projects specific fields to details JSON
        details.mode = formData.projectMode;
        details.compensationType = formData.projectCompensation;
        details.compensationSpecify = formData.projectCompensationSpecify;
        details.extendable = formData.projectExtendable;

        query = `INSERT INTO live_projects
            (project_title, description, skills, duration, team_size, location, contact, user_id, details_json)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *`;
        values = [
            projectTitle,
            description,
            skills,
            duration,
            teamSize,
            location,
            contact,
            userId,
            JSON.stringify(details) // Store all other details as JSON
        ];
    } else if (formType === 'internship') {
        // Explicitly mapped columns
        const jobTitle = formData.jobTitle;
        const description = formData.internshipDescription;
        const openFor = formData.openFor;
        const duration = formData.duration;
        const minSkills = formData.internshipSkills;
        const fulltime = formData.fullTime;
        const contactIntern = formData.internshipCvEmail;

        // Add other internship specific fields to details JSON
        details.stipendType = formData.stipend;
        details.stipendSpecify = formData.stipendSpecify;
        details.extendable = formData.extendable;

        query = `INSERT INTO internships
            (job_title, description, open_for, duration, min_skills, fulltime, contact_intern, user_id, details_json)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *`;
        values = [
            jobTitle,
            description,
            openFor,
            duration,
            minSkills,
            fulltime,
            contactIntern,
            userId,
            JSON.stringify(details)
        ];
    } else if (formType === 'research') {
        // Explicitly mapped columns
        const researchTitle = formData.researchTitle;
        const researchDesc = formData.researchDescription;
        const researchOpen = formData.researchOpenFor;
        const researchDuration = formData.researchDuration;
        const researchSkills = formData.researchSkills;
        const researchContact = formData.researchCvEmail; // Using CV email as the primary contact for this table

        // Add other research specific fields to details JSON
        details.stipendType = formData.researchStipend;
        details.stipendSpecify = formData.researchStipendSpecify;
        details.extendable = formData.researchExtendable;

        query = `INSERT INTO research
            (research_title, research_desc, research_open, research_duration, research_skills, research_contact, user_id, details_json)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *`;
        values = [
            researchTitle,
            researchDesc,
            researchOpen,
            researchDuration,
            researchSkills,
            researchContact,
            userId,
            JSON.stringify(details)
        ];
    } else if (formType === 'csr-initiative') {
        // Explicitly mapped columns
        const initiativeType = formData.initiativeType;
        const projectDesc = formData.csrDescription;
        const csrDuration = formData.csrDuration;
        const members = formData.members;
        const compensation = formData.csrCompensation; // This is the free text compensation field
        // Prioritize location from mode (offline/hybrid) if available, otherwise use general location
        const location = formData.modeLocation || formData.location || null;
        const csrContact = formData.csrEmail; // Using email as the primary contact for this table

        // Add other CSR specific fields to details JSON
        details.mode = formData.mode;
        details.stipendType = formData.csrStipend;
        details.stipendSpecify = formData.csrStipendSpecify;

        query = `INSERT INTO csr_initiatives
            (initiative_type, project_desc, csr_duration, members, compensation, location, csr_contact, user_id, details_json)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING *`;
        values = [
            initiativeType,
            projectDesc,
            csrDuration,
            members,
            compensation,
            location,
            csrContact,
            userId,
            JSON.stringify(details)
        ];
    } else {
        throw new Error('Invalid formType');
    }

    const result = await pool.query(query, values);
    return result.rows[0];
}

export async function fetchNeeds() {
    const queries = [
        // Updated SELECT statements to include details_json
        pool.query(`SELECT id, 'live-projects' AS form_type, project_title, description, skills, duration, team_size, location, contact, user_id, created_at, details_json FROM live_projects`),
        pool.query(`SELECT id, 'internship' AS form_type, job_title, description, open_for, duration, min_skills, fulltime, contact_intern, user_id, created_at, details_json FROM internships`),
        pool.query(`SELECT id, 'research' AS form_type, research_title, research_desc, research_open, research_duration, research_skills, research_contact, user_id, created_at, details_json FROM research`),
        pool.query(`SELECT id, 'csr-initiative' AS form_type, initiative_type, project_desc, csr_duration, members, compensation, location, csr_contact, user_id, created_at, details_json FROM csr_initiatives`)
    ];
    const results = await Promise.all(queries);
    const posts = results.flatMap(r => r.rows);
    posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return posts;
}
