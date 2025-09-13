import { insertHostSession, fetchHostSessions } from '../models/hostSessionModel.js';

export async function createHostSession(req, res) {
  try  {
    const { sessionType, sessionData } = req.body;
    if (!sessionType || !sessionData) {
      return res.status(400).json({ error: 'sessionType and sessionData are required' });
    }
    // For now, use null as userId since we're not using authentication
    const session = await insertHostSession(sessionType, sessionData, req.user.id);
    
    res.status(201).json({ session });
  } catch (err) {
    console.error('Create host session error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getHostSessions(req, res) {
  try {
    const sessions = await fetchHostSessions();
    res.json({ sessions });
  } catch (err) {
    console.error('Get host sessions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
