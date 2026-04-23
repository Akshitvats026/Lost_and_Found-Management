const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/authMiddleware');

// POST /api/items -> Add item
router.post('/', auth, async (req, res) => {
  const { itemName, description, type, location, date, contactInfo } = req.body;

  try {
    const newItem = new Item({
      itemName,
      description,
      type,
      location,
      date,
      contactInfo,
      user: req.user.id
    });

    const item = await newItem.save();
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/items/search?name=xyz -> Search
router.get('/search', async (req, res) => {
  try {
    const { name, category } = req.query;
    let query = {};
    if (name) {
      query.itemName = { $regex: name, $options: 'i' };
    }
    if (category) {
      query.type = { $regex: category, $options: 'i' };
    }

    const items = await Item.find(query).populate('user', ['name', 'email']).sort({ date: -1 });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/items -> View all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find().populate('user', ['name', 'email']).sort({ date: -1 });
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// GET /api/items/:id -> View item by ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('user', ['name', 'email']);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(500).send('Server error');
  }
});

// PUT /api/items/:id -> Update item
router.put('/:id', auth, async (req, res) => {
  const { itemName, description, type, location, date, contactInfo } = req.body;

  const itemFields = {};
  if (itemName) itemFields.itemName = itemName;
  if (description) itemFields.description = description;
  if (type) itemFields.type = type;
  if (location) itemFields.location = location;
  if (date) itemFields.date = date;
  if (contactInfo) itemFields.contactInfo = contactInfo;

  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Make sure user owns item
    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized access. Not authorized to update.' });
    }

    item = await Item.findByIdAndUpdate(
      req.params.id,
      { $set: itemFields },
      { new: true }
    );

    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// DELETE /api/items/:id -> Delete item
router.delete('/:id', auth, async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Make sure user owns item
    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Unauthorized access. Not authorized to delete.' });
    }

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
