import express from 'express';
import { createItem, deleteItem, getItemById, getItems, updateItem } from '../services/items.js';
import { handleResponse } from '../services/helpers.js';
const router = express.Router();
/**
 * GET route to items/all
 * */
router.get('/all', async (req, res) => {
  const items = await getItems();
  const response = handleResponse(items);
  res.status(response.statusCode).json(response);
});
/**
 * GET route to items/:id
 * */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const item = await getItemById(id);
  const response = handleResponse(item);
  res.status(response.statusCode).json(response);
});
/**
 * PUT route to items/:id
 * */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { description, end_time } = req.body;
  const itemUpdate = await updateItem(id, { description, end_time });
  const response = handleResponse(itemUpdate);
  res.status(response.statusCode).json(response);
});
/**
 * DELETE route to items/:id
 * */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const itemDelete = await deleteItem(id);
  const response = handleResponse(itemDelete);
  res.status(response.statusCode).json(response);
});
/**
 * POST route to items
 * */
router.post('/', async (req, res) => {
  const { name, description, starting_bid, current_bid, end_time } = req.body;
  const itemCreate = await createItem({
    name,
    description,
    starting_bid,
    current_bid,
    end_time,
  });
  const response = handleResponse(itemCreate);
  res.status(response.statusCode).json(response);
});

export default router;
