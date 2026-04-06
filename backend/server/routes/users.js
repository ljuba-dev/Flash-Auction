import express from 'express';
import { deleteUser, getUserById, getUsers, insertUser, updateUser } from '../services/users.js';
import { handleResponse } from '../services/helpers.js';

const router = express.Router();

router.get('/all', async (req, res) => {
  try {
    const users = await getUsers();
    const response = handleResponse(users);
    res.status(response.statusCode).json(response);
  } catch (e) {
    console.log('\x1b[31m' + e.message + '\x1b[0m');
    res.status(400).json({ error: true, message: e.message, statusCode: 400 });
  }
});
router.get('/', async (req, res) => {
  const id = req.user.sub;
  const user = await getUserById(id);
  const response = handleResponse(user);
  res.status(response.statusCode).json(response);
});
router.put('/', async (req, res) => {
  try {
    const id = req.user.sub;
    const { username, password } = req.body;
    const userUpdate = await updateUser(id, { username, password });
    const response = handleResponse(userUpdate.rowCount);
    res.status(response.statusCode).json(response);
  } catch (e) {
    console.log('\x1b[31m' + e.message + '\x1b[0m');
    res.status(400).json({ error: true, message: e.message, statusCode: 400 });
  }
});
router.delete('/', async (req, res) => {
  const id = req.user.sub;
  const deletedUser = await deleteUser(id);
  const response = handleResponse(deletedUser);
  res.status(response.statusCode).json(response);
});
router.post('/', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      throw new Error('Missing required fields');
    }
    const createUser = await insertUser({ email, password, username });
    const response = handleResponse(createUser);
    res.status(response.statusCode).json(response);
  } catch (e) {
    console.log('\x1b[31m' + e.message + '\x1b[0m');
    res.status(400).json({ error: true, message: e.message, statusCode: 400 });
  }
});

export default router;
