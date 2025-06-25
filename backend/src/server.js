const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');
const User = require('./models/User');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Basic route
app.get('/', (req, res) => {
  res.send('Ticket Management System API');
});

async function ensureAdminUser() {
  const adminEmail = "admin@gmail.com";
  const adminPassword = "Admin";
  const adminName = "Admin";

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = new User({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin"
    });
    await admin.save();
    console.log("Admin user created:", adminEmail);
  } else if (admin.role !== "admin") {
    admin.role = "admin";
    await admin.save();
    console.log("Existing user promoted to admin:", adminEmail);
  } else {
    console.log("Admin user already exists:", adminEmail);
  }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('MongoDB connected');
    await ensureAdminUser();
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error' });
}); 