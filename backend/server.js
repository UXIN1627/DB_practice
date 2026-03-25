require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const custRoutes = require('./routes/cust');
const factRoutes = require('./routes/fact');
const itemRoutes = require('./routes/item');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/cust', custRoutes);
app.use('/api/fact', factRoutes);
app.use('/api/item', itemRoutes);
app.use('/api/user', userRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
