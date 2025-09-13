import { insertNeed, fetchNeeds } from '../models/needsModel.js';

// Create a new need post
export async function createNeed(req, res) {
  try {
    const { formType, formData } = req.body;
    if (!formType || !formData) {
      return res.status(400).json({ error: 'formType and formData are required' });
    }
    const post = await insertNeed(formType, formData, req.user.id);
    res.status(201).json({ post });
  } catch (err) {
    console.error('Create need error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Get all need posts (from all tables)
export async function getNeeds(req, res) {
  try {
    const posts = await fetchNeeds();
    res.json({ posts });
  } catch (err) {
    console.error('Get needs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


