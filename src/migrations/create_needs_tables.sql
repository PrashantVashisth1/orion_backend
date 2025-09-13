CREATE TABLE IF NOT EXISTS live_projects (
  id SERIAL PRIMARY KEY,
  project_title VARCHAR(255) NOT NULL,
  description TEXT,
  skills VARCHAR(255),
  duration VARCHAR(100),
  team_size VARCHAR(100),
  location VARCHAR(100),
  contact VARCHAR(255),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS internships (
  id SERIAL PRIMARY KEY,
  job_title VARCHAR(255) NOT NULL,
  description TEXT,
  open_for VARCHAR(255),
  duration VARCHAR(100),
  min_skills VARCHAR(255),
  fulltime VARCHAR(100),
  contact_intern VARCHAR(255),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS research (
  id SERIAL PRIMARY KEY,
  research_title VARCHAR(255) NOT NULL,
  research_desc TEXT,
  research_open VARCHAR(255),
  research_duration VARCHAR(100),
  research_skills VARCHAR(255),
  research_contact VARCHAR(255),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS csr_initiatives (
  id SERIAL PRIMARY KEY,
  initiative_type VARCHAR(255) NOT NULL,
  project_desc TEXT,
  csr_duration VARCHAR(100),
  members VARCHAR(50),
  compensation VARCHAR(100),
  location VARCHAR(100),
  csr_contact VARCHAR(255),
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
