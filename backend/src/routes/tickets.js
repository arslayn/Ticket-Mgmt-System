const express = require('express');
const Ticket = require('../models/Ticket');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');

const router = express.Router();

// Create ticket
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const ticket = await Ticket.create({
      title,
      description,
      priority,
      createdBy: req.user._id,
    });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tickets (with search, filter, pagination)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, search } = req.query;
    const query = {};
    if (req.user.role === 'user') {
      query.createdBy = req.user._id;
    }
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Ticket.countDocuments(query);
    res.json({ tickets, total });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single ticket
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (req.user.role === 'user' && !ticket.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update ticket (status, priority, assign, etc.)
router.put('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (req.user.role === 'user' && !ticket.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Only agent/admin can assign or change status to in-progress/resolved/closed
    if (req.body.assignedTo || ['in-progress', 'resolved', 'closed'].includes(req.body.status)) {
      if (!['agent', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Only agent/admin can assign or change status' });
      }
    }
    Object.assign(ticket, req.body);
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete ticket
router.delete('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (req.user.role === 'user' && !ticket.createdBy.equals(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await ticket.deleteOne();
    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 