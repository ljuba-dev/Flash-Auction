import express from 'express';
import { loginUser } from '../services/users.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error('Missing required fields');
    }
    const response = await loginUser(email, password);

    res.status(response.statusCode).json(response);
  } catch (e) {
    if (process.env.SHOW_LOGS && process.env.SHOW_LOGS === 'true') {
      console.log('\x1b[31m' + e.message + '\x1b[0m');
    }
    res.status(400).json({ error: true, message: e.message, statusCode: 400 });
  }
});

export default router;
