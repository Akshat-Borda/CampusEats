// Connect to MongoDB
mongoose.connect('mongodb://localhost:5000/campuseats', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));
