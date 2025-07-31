const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
var cors = require('cors');
const { error } = require('console');
const moment = require('moment-timezone');
//const moment = require('moment');



const app = express();
const PORT = process.env.PORT || 5500;
// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Campuseats_SGP_2', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define user schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true }, // Add gender field with enum options
  phone: { type: String, required: true },
  role: { type: String, enum: ['customer', 'seller'], required: true }, // Add role field
  institute: { type: String }, // Add institute field
  studentOrStaff: { type: String, enum: ['student', 'staff'] } // Add staff/student field
});
// // Define order schema
const orderSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  user: String,
  restaurant: String,
  items: [{
    menuItem: String,
    quantity: Number,
    price: Number,
    category: String
  }],
  totalPrice: Number,
  status: { type: String, enum: ['pending', 'rejected', 'in-process', 'completed'], default: 'pending' },
  
  // Separate Date and Time Fields
  date: {
    type: String,
    default: () => moment().tz('Asia/Kolkata').format('YYYY-MM-DD') // Store only the date in 'YYYY-MM-DD' format
  },
  time: {
    type: String,
    default: () => moment().tz('Asia/Kolkata').format('HH:mm:ss') // Store only the time in 'HH:mm:ss' format
  },

  // Time of Sale: Morning, Afternoon, Evening, Night
  timeOfDay: {
    type: String,
    default: () => {
      const hour = moment().tz('Asia/Kolkata').hour();
      if (hour >= 5 && hour < 11) {
        return 'Morning';
      } else if (hour >= 11 && hour < 15) {
        return 'Afternoon';
      } else if (hour >= 15 && hour < 24) {
        return 'Evening';
      } else {
        return 'Night';
      }
    }
  },
});

// Define menu item schema
const menuSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String // Each item will have a single category
});

// Define restaurant schema
const restaurantSchema = new mongoose.Schema({
  name: String,
  menu: [menuSchema],
  orders: [orderSchema],
  category: [String] // Array of category specific to the restaurant
});



// Define models
const User = mongoose.model('User', userSchema, 'User');
const Order = mongoose.model('Order', orderSchema);
const MenuItem = mongoose.model('MenuItem', menuSchema);
const Restaurant = mongoose.model('Restaurant', restaurantSchema);

// //Generate Random Data for visualization
// // Random Data Generators
// const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
// const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

// // Predefined Data
// const categories = ['Snack', 'Drink', 'Meal', 'Dessert'];
// const institutes = ['Institute A', 'Institute B', 'Institute C', 'Institute D'];
// const genders = ['male', 'female', 'other'];
// const roles = ['customer', 'seller'];
// const statuses = ['pending', 'rejected', 'in-process', 'completed'];
// const timeOfDay = ['Morning', 'Afternoon', 'Evening', 'Night'];

// // Generate Random Users
// function generateUsers() {
//   let users = [];
//   for (let i = 25; i < 101; i++) {
//     const user = new User({
//       username: `user${i}`,
//       password: 'password123',
//       name: `User ${i}`,
//       gender: getRandomItem(genders),
//       phone: `+91${getRandomInt(1000000000, 9999999999)}`,
//       role: getRandomItem(roles),
//       institute: getRandomItem(institutes),
//       studentOrStaff: getRandomItem(['student', 'staff'])
//     });
//     users.push(user);
//   }
//   User.insertMany(users);
//   //console.log(`${count} Users Generated`);
// }
// generateUsers();
// console.log("Users Created");

// // Generate Random Menu Items
// function generateMenuItems() {
//   let menuItems = [];
//   for (let i = 0; i < getRandomInt(5, 10); i++) {
//     menuItems.push({
//       name: `Item ${i}`,
//       price: getRandomInt(100, 500),
//       category: getRandomItem(categories)
//     });
//   }
//   return menuItems;
// }

// // Generate Random Orders
// function generateOrders(users, restaurant) {
//   let orders = [];
//   for (let i = 0; i < getRandomInt(50, 100); i++) {
//     const user = getRandomItem(users);
//     const items = [];
//     for (let j = 0; j < getRandomInt(1, 5); j++) {
//       const menuItem = getRandomItem(restaurant.menu);
//       items.push({
//         menuItem: menuItem.name,
//         quantity: getRandomInt(1, 5),
//         price: menuItem.price,
//         category: menuItem.category
//       });
//     }

//     const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

//     const order = {
//       user: user.username,
//       restaurant: restaurant.name,
//       items: items,
//       totalPrice: totalPrice,
//       status: getRandomItem(statuses),
//       date: moment().tz('Asia/Kolkata').subtract(getRandomInt(1, 30), 'days').format('YYYY-MM-DD'),
//       time: moment().tz('Asia/Kolkata').format('HH:mm:ss'),
//       timeOfDay: getRandomItem(timeOfDay)
//     };

//     orders.push(order);
//   }
//   return orders;
// }

// // Generate Random Restaurants and Orders
// async function generateRestaurantsAndOrders(users, count) {
//   let restaurants = [];
//   for (let i = 0; i < count; i++) {
//     const restaurant = new Restaurant({
//       name: `Restaurant ${i}`,
//       menu: generateMenuItems(),
//       category: categories
//     });

//     // Generate orders for this restaurant
//     restaurant.orders = generateOrders(users, restaurant);

//     restaurants.push(restaurant);
//   }
//   await Restaurant.insertMany(restaurants);
//   console.log(`${count} Restaurants and Orders Generated`);
// }

// // Main function to run data generation
// async function generateTestData() {
//   try {
//     const userCount = 100;
//     const restaurantCount = 10;

//     // Step 1: Generate Users
//     await generateUsers(userCount);

//     // Fetch the generated users to be used in orders
//     const users = await User.find({});

//     // Step 2: Generate Restaurants and Orders
//     await generateRestaurantsAndOrders(users, restaurantCount);

//     console.log('Test Data Generated Successfully');
//   } catch (error) {
//     console.error('Error generating test data:', error);
//   } finally {
//     mongoose.disconnect();
//   }
// }

// generateTestData();


// // Function to create a new restaurant instance with dummy data and save it to the database
// const createRestaurant = async () => {
//   try {
//     // Create a new restaurant instance with dummy data
//     const newRestaurant = new Restaurant({
//       name: 'sweetspot',
//       category: ['Pizza', 'Burger', 'Desserts'], // Correct the field name
//       menu: [ // Use 'menu' instead of 'menuItems'
//         { name: 'Margerita', price: 120, category: 'Pizza' },
//         { name: 'Chess Burger', price: 80, category: 'Burger' },
//         { name: 'Ice Cream', price: 40, category: 'Desserts' }
//       ],
//       orders: [ // Example orders
//         {
//           user: 'user1',
//           restaurant: 'danny',
//           items: [
//             { menuItem: 'Margerita', quantity: 2, price: 240 },
//             { menuItem: 'Chess Burger', quantity: 1, price: 80 }
//           ],
//           totalPrice: 320,
//           status: 'pending',
//           date: new Date()
//         },
//         {
//           user: 'user2',
//           restaurant: 'danny',
//           items: [
//             { menuItem: 'Ice Cream', quantity: 3, price: 40 }
//           ],
//           totalPrice: 120,
//           status: 'pending',
//           date: new Date()
//         }
//       ]
//     });

//     // Save the restaurant instance to the database
//     await newRestaurant.save();
//     console.log('Restaurant created successfully:', newRestaurant);
//   } catch (error) {
//     console.error('Error creating restaurant:', error);
//   }
// };

// // Call the function to create the restaurant
// createRestaurant();


// Middleware to parse JSON bodies
app.use(express.json());
app.use(bodyParser.json());

// app.get('/',async (req,res)=>{
//     res.send("<h1>Hello World!</h1>");
// });

app.post('/signup', async (req, res) => {
  const { username, password, name, phone, gender, institute, studentOrStaff, role = "customer" } = req.body;
  try {
      if (!username || !role || !gender || !institute || !studentOrStaff) { // Check if all required fields are provided
          return res.status(400).send('All fields are required');
      }
      // Check that the username is not already in use
      let existingUser = await User.findOne({ username: username });
      console.log(existingUser);
      if (existingUser) {
          return res.status(400).send('Username is already taken');
      }

      // Hash the password before storing it in the database
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
          username,
          password: hashedPassword,
          name,
          phone,
          gender,
          institute,
          studentOrStaff,
          role
      }); // Include all fields in user object
      await user.save();
      res.status(201).send(user);
  } catch (err) {
      console.error(err);
      res.status(500).send();
  }
});

app.get('/edit_menu', (req, res) => {
  // Construct the file path to the edit_menu.html file
  const filePath = path.join(__dirname, 'edit_menu.html');

  // Send the edit_menu.html file
  res.sendFile(filePath);
});

//Checkout
app.get('/checkout', (req, res) => {
  // Construct the file path to the edit_menu.html file
  const filePath = path.join(__dirname, 'checkout.html');

  // Send the edit_menu.html file
  res.sendFile(filePath);
});

//Checkout
app.get('/dashboard', (req, res) => {
  // Construct the file path to the edit_menu.html file
  const filePath = path.join(__dirname, 'dashboard.html');

  // Send the edit_menu.html file
  res.sendFile(filePath);
});


app.get('/status', (req, res) => {
  // Construct the file path to the edit_menu.html file
  const filePath = path.join(__dirname, 'Status.html');

  // Send the edit_menu.html file
  res.sendFile(filePath);
});

app.get('/login', (req, res) => {
  // Construct the file path to the edit_menu.html file
  const filePath = path.join(__dirname, 'login.html');

  // Send the edit_menu.html file
  res.sendFile(filePath);
});

app.get('/signup', (req, res) => {
  // Construct the file path to the edit_menu.html file
  const filePath = path.join(__dirname, 'signup.html');

  // Send the edit_menu.html file
  res.sendFile(filePath);
});

app.get('/menu', (req, res) => {
  // Construct the file path to the edit_menu.html file
  const filePath = path.join(__dirname, 'menuu.html');

  // Send the edit_menu.html file
  res.sendFile(filePath);
});
//         // Hash the password
//        // const saltRounds = 10;
//         const hpassword = bcrypt.hashSync(password, 10); // Generate hash with salt rounds
//         // Create a new user record with the hashed password
//         const user = new User({ username, password:hpassword, name, phone });
//         // Save the user record to the database
//         await user.save();
//         res.status(201).send('User created successfully');
//     } catch (error) {
//         console.error('Error signing up:', error);
//         res.status(500).send('Error signing up');
//     }
// });
app.get('/home', (req, res) => {
    // Redirect to home.html
    res.sendFile(path.join(__dirname, 'home.html'));
  });

app.get('/visual', (req, res) => {
  // Construct the file path to the edit_menu.html file
  const filePath = path.join(__dirname, 'visual.html');

  // Send the edit_menu.html file
  res.sendFile(filePath);
});
  
// Route to handle login
app.post('/login', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        if (!username || !role) {
            return res.status(400).send('Username and role are required');
        }

        // Find the user by username
        const user = await User.findOne({ username });

        // Check if user exists
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            // Check if the role matches
            if (user.role === role) {
                // Send role in response if login successful
                return res.status(201).send({ message: 'Login successful', role: user.role });
            } else {
                // Role doesn't match
                return res.status(401).send('Role does not match');
            }
        } else {
            return res.status(401).send('Invalid password');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in');
    }
});

// Routes to fetch menu
// app.get('/menu/:username', async (req, res) => {
//   try {
//     const username = req.params.username;
//     const menuItems = await MenuItem.find({ restaurant: username });
//     res.json(menuItems);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

app.get('/menu/:resturant', async (req, res) => {
  try {
    const name = req.params.resturant;
    // Find the restaurant document by username
    const restaurant = await Restaurant.findOne({ name: name });

    // Check if the restaurant exists
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Extract the menu items from the restaurant document
    const menuItems = restaurant.menu;

    // Send the menu items as the response
    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  
app.post('/menu', async (req, res) => {
  const { name, price, category } = req.body;
  const { username } = req.query;

  try {
      const restaurant = await Restaurant.findOne({ name: username });
      if (!restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Check if the selected category exists
      if (!restaurant.category.includes(category)) {
          return res.status(400).json({ error: 'Invalid category' });
      }

      const newItem = new MenuItem({ name, price, category });
      restaurant.menu.push(newItem);
      await restaurant.save();

      res.status(201).json(newItem);
  } catch (error) {
      console.error('Error adding menu item:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

  


  
//   // Update a menu item
//   app.put('/api/menu/:itemId', async (req, res) => {
//     try {
//       const itemId = req.params.itemId;
//       const { name, price } = req.body;
//       const updatedItem = await MenuItem.findByIdAndUpdate(itemId, { name, price }, { new: true });
//       res.json(updatedItem);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });

//Delete item
app.delete('/menu/:restaurant/:itemId', async (req, res) => {
  try {
    const { restaurant, itemId } = req.params;

    // Find the restaurant by its name
    const foundRestaurant = await Restaurant.findOne({ name: restaurant });

    if (!foundRestaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Remove the item from the menu array
    foundRestaurant.menu = foundRestaurant.menu.filter(item => item._id.toString() !== itemId);

    // Save the updated restaurant document
    await foundRestaurant.save();

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//Fetch the orders
app.get('/orders/:username', async (req, res) => {
  try {
      const username = req.params.username;

      // Find the restaurant by username
      const restaurant = await Restaurant.findOne({ name: username });

      if (!restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Retrieve orders of the restaurant
      const orders = restaurant.orders;

      res.json({ orders });
  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

//Route to update the status of an order associated with a specific restaurant
app.put('/orders/:username/:orderId/status', async (req, res) => {
  try {
      const username = req.params.username;
      const orderId = req.params.orderId;
      const { status } = req.body;

      // Find the restaurant by username
      const restaurant = await Restaurant.findOne({ name: username });

      if (!restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Find the order by orderId and update its status
      const updatedOrder = await Order.findOneAndUpdate(
          { _id: orderId},
          { status },
          { new: true }
      );

      if (!updatedOrder) {
          return res.status(404).json({ error: 'Order not found' });
      }

      // Update the order status in the restaurant's orders array
      const restaurantOrderIndex = restaurant.orders.findIndex(order => order._id.toString() === orderId);
      if (restaurantOrderIndex !== -1) {
          restaurant.orders[restaurantOrderIndex].status = status;
          await restaurant.save();
      }

      res.json(updatedOrder);
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to delete an order
app.delete('/orders/:orderId/:username', async (req, res) => {
  try {
      const orderId = req.params.orderId;
      const username = req.params.username;

      // Find the restaurant associated with the username
      const restaurant = await Restaurant.findOne({ name: username });

      if (!restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Find the index of the order to be deleted in the restaurant's orders array
      const orderIndex = restaurant.orders.findIndex(order => order._id.toString() === orderId);

      if (orderIndex === -1) {
          return res.status(404).json({ error: 'Order not found in restaurant' });
      }

      // Remove the order from the restaurant's orders array
      restaurant.orders.splice(orderIndex, 1);
      await restaurant.save();

      res.json({ message: 'Order deleted successfully' });
  } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/place-order', async (req, res) => {
  try {
      // Extract order details from request body
      const { restaurantName, user, items, totalPrice} = req.body;

      // Find the restaurant by name
      const restaurant = await Restaurant.findOne({ name: restaurantName });

      // Create a new order
      const order = new Order({
          user,
          items,
          totalPrice,
          restaurant: restaurant.name,// Reference to the restaurant
      });

      // Save the order
      await order.save();

      // Add the order to the restaurant's orders array
      restaurant.orders.push(order);
      await restaurant.save();

      res.status(200).json({ message: 'Order placed successfully', order });
  } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).json({ error: 'Failed to place order' });
  }
});

// Route to fetch order status based on orderId
app.get('/order/status', async (req, res) => {
  try {
    const { orderId } = req.query;

    // Validate orderId as a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid orderId' });
    }

    // Find the order by orderId
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Return the order status
    res.json({ status: order.status });
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route to fetch order data based on restaurant name and username
app.get('/orders', async (req, res) => {
  try {
    const { username, resturant } = req.query;

    // Find the restaurant by name
    const foundRestaurant = await Restaurant.findOne({ name: resturant });

    if (!foundRestaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Retrieve orders of the restaurant for the specified username
    const orders = await Order.find({ user: username });

    res.json(orders );
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Add category
app.post('/restaurants/:restaurantName/category', async (req, res) => {
  const { restaurantName } = req.params;
  const { category } = req.body;

  try {
      const restaurant = await Restaurant.findOne({ name: restaurantName });
      if (!restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Check if the category already exists
      if (restaurant.category.includes(category)) {
          return res.status(400).json({ error: 'Category already exists' });
      }

      restaurant.category.push(category);
      await restaurant.save();

      res.status(201).json({ message: 'Category added successfully', category: restaurant.category });
  } catch (error) {
      console.error('Error adding category:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

//Get Catofries
app.get('/restaurants/:restaurantName/category', async (req, res) => {
  const { restaurantName } = req.params;

  try {
      const restaurant = await Restaurant.findOne({ name: restaurantName });
      if (!restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
      }
      //console.log(typeof{category: restaurant.category});
      res.status(200).json({ category: restaurant.category });
  } catch (error) {
      console.error('Error fetching category:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// app.get('/api/aggregated-data', async (req, res) => {
//   try {
//     // Extract filters from query params
//     const { startDate, endDate, category, gender, institute, staffOrStudent } = req.query;

//     const matchCriteria = {};

//     // Apply date filter
//     if (startDate && endDate) {
//       matchCriteria.date = {
//         $gte: new Date(startDate),
//         $lte: new Date(endDate)
//       };
//     }

//     // Apply category filter (multiple categories can be selected)
//     if (category && category.length > 0) {
//       matchCriteria["items.category"] = { $in: category.split(',') };
//     }

//     // Apply gender filter (multiple genders can be selected)
//     if (gender && gender.length > 0) {
//       matchCriteria["userData.gender"] = { $in: gender.split(',') };
//     }

//     // Apply institute filter (multiple institutes can be selected)
//     if (institute && institute.length > 0) {
//       matchCriteria["userData.institute"] = { $in: institute.split(',') };
//     }

//     // Apply staff/student filter (multiple options can be selected)
//     if (staffOrStudent && staffOrStudent.length > 0) {
//       matchCriteria["userData.studentOrStaff"] = { $in: staffOrStudent.split(',') };
//     }

//     console.log("Match Criteria: ", matchCriteria); // Log the criteria to verify

//     // Perform aggregation
//     const aggregatedData = await Order.aggregate([
//       {
//         $lookup: {
//           from: "users", // Join with User collection
//           localField: "user", // Assuming "user" in Order stores userId
//           foreignField: "_id", // Matching _id from User collection
//           as: "userData"
//         }
//       },
//       {
//         $unwind: "$userData" // Unwind userData array
//       },
//       {
//         $match: matchCriteria // Apply the dynamically built filters
//       },
//       {
//         $group: {
//           _id: {
//             date: "$date",
//             item_name: "$items.menuItem",
//             item_type: "$items.category",
//             time_of_sale: "$timeOfDay",
//             user_gender: "$userData.gender",
//             institute: "$userData.institute",
//             staffOrStudent: "$userData.studentOrStaff"
//           },
//           total_quantity: { $sum: "$items.quantity" },
//           total_amount: { $sum: "$totalPrice" },
//           total_transactions: { $sum: 1 }
//         }
//       },
//       {
//         $sort: { "_id.date": 1 }
//       }
//     ]);

//     if (aggregatedData.length === 0) {
//       res.status(200).json({ message: "No data available for the selected filters" });
//     } else {
//       res.status(200).json(aggregatedData);
//     }

//   } catch (error) {
//     console.error("Error fetching filtered data", error);
//     res.status(500).json({ error: "Failed to fetch filtered data" });
//   }
// });

// // Sales Summary
// app.get("/restaurants/:restaurantName/sales-summary" ,  async (req, res) => {
//   const { restaurantName } = req.params;
//   try {
//     const result = await Restaurant.aggregate([
//       { $match: { name: restaurantName } },
//       { $unwind: "$orders" },
//       {
//         $group: {
//           _id: null,
//           totalSales: { $sum: "$orders.totalPrice" },
//           totalOrders: { $sum: 1 },
//           avgOrderValue: { $avg: "$orders.totalPrice" },
//         },
//       },
//     ]);
//     res.json(result[0]);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch sales summary" });
//   }
// });

// // Category Analysis
// app.get("/restaurants/:restaurantName/category-analysis", async (req, res) => {
//   const { restaurantName } = req.params;
//   try {
//     const result = await Restaurant.aggregate([
//       { $match: { name: restaurantName } },
//       { $unwind: "$orders" },
//       { $unwind: "$orders.items" },
//       {
//         $group: {
//           _id: "$orders.items.category",
//           totalSales: { $sum: "$orders.items.price" },
//         },
//       },
//       { $sort: { totalSales: -1 } },
//     ]);
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch category analysis" });
//   }
// });

// Sales Summary with Date Filter
app.get("/restaurants/:restaurantName/sales-summary", async (req, res) => {
  const { restaurantName } = req.params;
  const { start, end } = req.query;

  try {
    const matchStage = { name: restaurantName };
    if (start || end) {
      matchStage["orders.date"] = {};
      if (start) matchStage["orders.date"].$gte = new Date(start);
      if (end) matchStage["orders.date"].$lte = new Date(end);
    }

    const result = await Restaurant.aggregate([
      { $match: matchStage },
      { $unwind: "$orders" },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$orders.totalPrice" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$orders.totalPrice" },
        },
      },
    ]);

    res.json(result[0] || { totalSales: 0, totalOrders: 0, avgOrderValue: 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sales summary" });
  }
});

// Category Analysis with Date Filter
app.get("/restaurants/:restaurantName/category-analysis", async (req, res) => {
  try {
    const { restaurantName } = req.params;
    const { start, end, genders, institutes, roles } = req.query;

    // Fetch the restaurant by its name
    const restaurant = await Restaurant.findOne({ name: restaurantName }).exec();
    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Access orders from the restaurant document
    let restaurantOrders = restaurant.orders;

    // Populate user data for each order
    const populatedOrders = await Promise.all(
      restaurantOrders.map(async (order) => {
        const user = await User.findOne({ username: order.user }).exec();
        if (!user) {
          console.warn(`User not found for order: ${order._id}, username: ${order.user}`);
          return null; // Skip orders with missing user details
        }
        return {
          ...order,
          user, // Append user details
        };
      })
    );

    // Filter out null values from populatedOrders where user was not found
    const validOrders = populatedOrders.filter((order) => order !== null);

    // Filter orders based on query parameters
    const filteredOrders = validOrders.filter((order) => {
      const orderDate = new Date(order.date);

      // Check if the start and end dates are provided
      const parsedStart = start ? new Date(start) : null;
      const parsedEnd = end ? new Date(end) : null;

      // Date filtering logic, skip if no dates provided
      const isInDateRange = 
        (!parsedStart && !parsedEnd) || 
        (parsedStart && orderDate >= parsedStart) && 
        (parsedEnd && orderDate <= parsedEnd);

      // Gender filter - "all" means skip gender filter
      const matchesGender = !genders || genders === "all" || genders.split(",").includes(order.user.gender);
      //console.log("Order Gender:", order.user.gender, "Matches Gender:", matchesGender);

      // Institute filter - "all" means skip institute filter
      const matchesInstitute = !institutes || institutes === "all" || institutes.split(",").includes(order.user.institute);
      //console.log("Order Institute:", order.user.institute, "Matches Institute:", matchesInstitute);

      // Role filter - "all" means skip role filter
      const matchesRole = !roles || roles === "all" || roles.split(",").includes(order.user.studentOrStaff);
      //console.log("Order Role:", order.user.studentOrStaff, "Matches Role:", matchesRole);

      return isInDateRange && matchesGender && matchesInstitute && matchesRole;
    });

    if (!Array.isArray(filteredOrders)) {
      filteredOrders = Object.values(filteredOrders);
    }

    
    console.log(typeof(filteredOrders));

    // Aggregate sales data by category
    const categorySales = {};
    filteredOrders.forEach((order) => {
      if (!Array.isArray(order.items)) {
        order.items = Object.values(order.items);
      }
      order.items.forEach((item) => {
        if (!categorySales[item.category]) {
          categorySales[item.category] = 0;
        }
        categorySales[item.category] += item.price;
      });
    });

    // Format the result
    const result = Object.entries(categorySales).map(([category, totalSales]) => ({
      category,
      totalSales,
    }));

    console.log(result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching category analysis" });
  }
});

// Fetch sales by category
app.get("/restaurants/:restaurantName/categories", async (req, res) => {
  const { restaurantName } = req.params;

  try {
    // Find the restaurant and only return the categories field
    const restaurant = await Restaurant.findOne({ name: restaurantName }, "category");

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Ensure 'category' is always an array
    const categories = restaurant.category || [];
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});


// API Route to get total sales by category for a specific restaurant
app.get('/sales-by-category/:restaurantName', async (req, res) => {
  const restaurantName = req.params.restaurantName;

  try {
    // Fetch restaurant data by name
    const restaurant = await Restaurant.findOne({ name: restaurantName });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Aggregate total sales by category
    const salesByCategory = await Restaurant.aggregate([
      // Match the restaurant by name
      { $match: { name: restaurantName } },
      
      // Unwind orders and items arrays
      { $unwind: "$orders" },
      { $unwind: "$orders.items" },
      
      // Group by category and calculate total sales for each category
      {
        $group: {
          _id: "$orders.items.category",
          total_sales: { $sum: "$orders.items.price"  }
        }
      },

      // Project to return only the category and total sales
      {
        $project: {
          category: "$_id",
          total_sales: 1,
          _id: 0
        }
      },

      // Sort categories by total sales in descending order
      { $sort: { total_sales: -1 } }
    ]);

    res.json(salesByCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
});

// Route to fetch sales by time of day
app.get('/sales-by-time/:restaurantName', async (req, res) => {
  const restaurantName = req.params.restaurantName;

  try {
    const restaurant = await Restaurant.findOne({ name: restaurantName });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Aggregate sales by time of day
    const salesByTime = restaurant.orders.reduce((acc, order) => {
      // Get the time of sale (Morning, Afternoon, Evening, or Night)
      const timeOfDay = order.timeOfDay;

      if (!acc[timeOfDay]) {
        acc[timeOfDay] = 0;
      }

      // Add the total price of the order to the corresponding time of day
      acc[timeOfDay] += order.totalPrice;

      return acc;
    }, {});

    // Convert the sales data into an array of { timeOfDay, total_sales }
    const salesData = Object.keys(salesByTime).map(timeOfDay => ({
      timeOfDay,
      total_sales: salesByTime[timeOfDay]
    }));

    res.json(salesData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Function to get sales by date for a specific restaurant
app.get('/sales-by-date/:username', async (req, res) => {
  const { username } = req.params;

  try {
    // Find the restaurant by its name (username)
    const restaurant = await Restaurant.findOne({ name: username });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Get the current year start and end date
    const startDate = moment().startOf('year').toDate();
    const endDate = moment().endOf('year').toDate();

    // Aggregate sales data by date for the current year
    const salesData = await Restaurant.aggregate([
      { 
        $match: { 
          _id: restaurant._id, 
          "orders.date": { $gte: moment(startDate).format('YYYY-MM-DD'), $lte: moment(endDate).format('YYYY-MM-DD') },  // Match orders within the year range
        }
      },
      { 
        $unwind: "$orders"  // Unwind the orders to process them individually
      },

      { 
        $addFields: {
          parsedDate: { $dateFromString: { dateString: "$orders.date", format: "%Y-%m-%d" } }
        }
      },

      { 
    $match: { 
      parsedDate: { $gte: startDate, $lte: endDate }
    }
  },
      {
        $project: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$parsedDate" } },  // Format the date
          totalPrice: "$orders.totalPrice"
        }
      },
      {
        $group: {
          _id: "$date",  // Group by the date of the order
          total_sales: { $sum: "$totalPrice" }  // Sum up the total sales for that date
        }
      },
      { 
        $sort: { _id: 1 }  // Sort the dates in ascending order
      }
    ]);

    // Generate a list of all dates from the start of the year to today
    const allDates = [];
    let date = moment(startDate);
    const currentDate = moment();

    // Generate all the dates from the start of the year to today
    while (date.isBefore(currentDate) || date.isSame(currentDate, 'day')) {
      allDates.push(date.format('YYYY-MM-DD'));
      date.add(1, 'day');
    }

    // Create a map of sales data for quick lookup by date
    const salesDataMap = salesData.reduce((acc, data) => {
      acc[data._id] = data.total_sales;
      return acc;
    }, {});

    // Fill in any missing dates with zero sales
    const filledSalesData = allDates.map(date => ({
      date,
      total_sales: salesDataMap[date] || 0  // Use 0 if there's no sales data for that date
    }));

    // Return the filled sales data as a JSON response
    res.json(filledSalesData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching sales data by date' });
  }
});


// Example route for sales by gender
app.get('/sales-by-gender/:username', async (req, res) => {
  const username = req.params.username;

  try {
    // Find the restaurant associated with the username
    const restaurant = await Restaurant.findOne({ "name": username });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found for this username.' });
    }

    const restaurantId = restaurant._id;

    // Aggregating sales data by gender for this specific restaurant
    const salesData = await Restaurant.aggregate([
      { $match: { "_id": restaurantId } }, // Match the restaurant by its ID
      { 
        $unwind: "$orders" // Unwind the orders array to process each order separately
      },
      {
        $lookup: {
          from: 'users', // Join the User collection to fetch gender data
          localField: 'orders.user', // Match the user from orders
          foreignField: 'username', // Match to the username field in the User schema
          as: 'userDetails' // Name of the resulting field
        }
      },
      { $unwind: "$userDetails" }, // Unwind the user details to access gender
      {
        $group: {
          _id: "$userDetails.gender", // Group by gender
          total_sales: { $sum: "$orders.totalPrice" } // Sum up the total sales per gender
        }
      }
    ]);

    // Send the aggregated data to the frontend
    console.log(salesData);
    res.json(salesData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sales by gender data.' });
  }
});

app.get('/sales-by-student-staff/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find the restaurant by owner (username)
    const restaurant = await Restaurant.findOne({ name: username });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurantId = restaurant._id;

    // Aggregating sales data by gender for this specific restaurant
    const salesData = await Restaurant.aggregate([
      { $match: { "_id": restaurantId } }, // Match the restaurant by its ID
      { 
        $unwind: "$orders" // Unwind the orders array to process each order separately
      },
      {
        $lookup: {
          from: 'users', // Join the User collection to fetch gender data
          localField: 'orders.user', // Match the user from orders
          foreignField: 'username', // Match to the username field in the User schema
          as: 'userDetails' // Name of the resulting field
        }
      },
      { $unwind: "$userDetails" }, // Unwind the user details to access gender
      {
        $group: {
          _id: "$userDetails.studentOrStaff", // Group by gender
          total_sales: { $sum: "$orders.totalPrice" } // Sum up the total sales per gender
        }
      }
    ]);

    res.json(salesData);

  } catch (error) {
    console.error('Error fetching sales data by student/staff:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/sales-by-institute/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find the restaurant by owner (username)
    const restaurant = await Restaurant.findOne({ name: username });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const restaurantId = restaurant._id;

    // Aggregating sales data by gender for this specific restaurant
    const salesData = await Restaurant.aggregate([
      { $match: { "_id": restaurantId } }, // Match the restaurant by its ID
      { 
        $unwind: "$orders" // Unwind the orders array to process each order separately
      },
      {
        $lookup: {
          from: 'users', // Join the User collection to fetch gender data
          localField: 'orders.user', // Match the user from orders
          foreignField: 'username', // Match to the username field in the User schema
          as: 'userDetails' // Name of the resulting field
        }
      },
      { $unwind: "$userDetails" }, // Unwind the user details to access gender
      {
        $group: {
          _id: "$userDetails.institute", // Group by gender
          total_sales: { $sum: "$orders.totalPrice" } // Sum up the total sales per gender
        }
      }
    ]);

    res.json(salesData);

  } catch (error) {
    console.error('Error fetching sales data by institute:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
