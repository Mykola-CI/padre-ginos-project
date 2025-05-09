import fastify from "fastify";
import cors from "@fastify/cors";
import { AsyncDatabase } from "promised-sqlite3";

const server = fastify({
  logger: process.env.NODE_ENV === 'development' ? {
    transport: {
      target: "pino-pretty",
      options: { colorize: true }
    }
  } : true // Use default JSON logger in production
});

if (process.env.NODE_ENV === 'development') {
  import('dotenv').then(dotenv => dotenv.config());
}

const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
console.log(`Server running in ${process.env.NODE_ENV} mode`);

// Register the CORS plugin
await server.register(cors, {
  origin: process.env.NODE_ENV === 'development' 
    ? "http://localhost:5173" // Vite default port
    : [
      "https://mykola-ci.github.io",
      "https://padre-ginos.onrender.com" // Your Render URL
    ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
});

// SQLite database connection
const db = await AsyncDatabase.open("./pizza.sqlite");

// Health check endpoint
server.get("/health", async (req, reply) => {
  reply.send({ status: "healthy" });
});

// Error handler
server.setErrorHandler((error, req, reply) => {
  req.log.error(error);
  reply.status(500).send({ error: "Internal server error" });
});

server.get("/api/pizzas", async function getPizzas(req, res) {
  const pizzasPromise = db.all(
    "SELECT pizza_type_id, name, category, ingredients as description FROM pizza_types"
  );
  const pizzaSizesPromise = db.all(
    `SELECT 
      pizza_type_id as id, size, price
    FROM 
      pizzas
  `
  );

  const [pizzas, pizzaSizes] = await Promise.all([
    pizzasPromise,
    pizzaSizesPromise,
  ]);

  const responsePizzas = pizzas.map((pizza) => {
    const sizes = pizzaSizes.reduce((acc, current) => {
      if (current.id === pizza.pizza_type_id) {
        acc[current.size] = +current.price;
      }
      return acc;
    }, {});

    return {
      id: pizza.pizza_type_id,
      name: pizza.name,
      category: pizza.category,
      description: pizza.description,
      image: `/padre-ginos-project/pizzas/${pizza.pizza_type_id}.webp`,
      sizes,
    };
  });

  server.log.info({ responsePizzas }, "Final response pizzas");

  res.send(responsePizzas);
});

server.get("/api/pizza-of-the-day", async function getPizzaOfTheDay(req, res) {
  const pizzas = await db.all(
    `SELECT 
      pizza_type_id as id, name, category, ingredients as description
    FROM 
      pizza_types`
  );

  const daysSinceEpoch = Math.floor(Date.now() / 86400000);
  const pizzaIndex = daysSinceEpoch % pizzas.length;
  const pizza = pizzas[pizzaIndex];

  const sizes = await db.all(
    `SELECT
      size, price
    FROM
      pizzas
    WHERE
      pizza_type_id = ?`,
    [pizza.id]
  );

  const sizeObj = sizes.reduce((acc, current) => {
    acc[current.size] = +current.price;
    return acc;
  }, {});

  const responsePizza = {
    id: pizza.id,
    name: pizza.name,
    category: pizza.category,
    description: pizza.description,
    image: `/padre-ginos-project/pizzas/${pizza.id}.webp`,
    sizes: sizeObj,
  };

  res.send(responsePizza);
});

server.get("/api/orders", async function getOrders(req, res) {
  const id = req.query.id;
  const orders = await db.all("SELECT order_id, date, time FROM orders");

  res.send(orders);
});

server.get("/api/order", async function getOrders(req, res) {
  const id = req.query.id;
  const orderPromise = db.get(
    "SELECT order_id, date, time FROM orders WHERE order_id = ?",
    [id]
  );
  const orderItemsPromise = db.all(
    `SELECT 
      t.pizza_type_id as pizzaTypeId, t.name, t.category, t.ingredients as description, o.quantity, p.price, o.quantity * p.price as total, p.size
    FROM 
      order_details o
    JOIN
      pizzas p
    ON
      o.pizza_id = p.pizza_id
    JOIN
      pizza_types t
    ON
      p.pizza_type_id = t.pizza_type_id
    WHERE 
      order_id = ?`,
    [id]
  );

  const [order, orderItemsRes] = await Promise.all([
    orderPromise,
    orderItemsPromise,
  ]);

  const orderItems = orderItemsRes.map((item) =>
    Object.assign({}, item, {
      image: `/padre-ginos-project/pizzas/${item.pizzaTypeId}.webp`,
      quantity: +item.quantity,
      price: +item.price,
    })
  );

  const total = orderItems.reduce((acc, item) => acc + item.total, 0);

  res.send({
    order: Object.assign({ total }, order),
    orderItems,
  });
});

server.post("/api/order", async function createOrder(req, res) {
  const { cart } = req.body;

  const now = new Date();
  // forgive me Date gods, for I have sinned
  const time = now.toLocaleTimeString("en-US", { hour12: false });
  const date = now.toISOString().split("T")[0];

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    res.status(400).send({ error: "Invalid order data" });
    return;
  }

  try {
    await db.run("BEGIN TRANSACTION");

    const result = await db.run(
      "INSERT INTO orders (date, time) VALUES (?, ?)",
      [date, time]
    );
    const orderId = result.lastID;

    const mergedCart = cart.reduce((acc, item) => {
      const id = item.pizza.id;
      const size = item.size.toLowerCase();
      if (!id || !size) {
        throw new Error("Invalid item data");
      }
      const pizzaId = `${id}_${size}`;

      if (!acc[pizzaId]) {
        acc[pizzaId] = { pizzaId, quantity: 1 };
      } else {
        acc[pizzaId].quantity += 1;
      }

      return acc;
    }, {});

    for (const item of Object.values(mergedCart)) {
      const { pizzaId, quantity } = item;
      await db.run(
        "INSERT INTO order_details (order_id, pizza_id, quantity) VALUES (?, ?, ?)",
        [orderId, pizzaId, quantity]
      );
    }

    await db.run("COMMIT");

    res.send({ orderId });
  } catch (error) {
    req.log.error(error);
    await db.run("ROLLBACK");
    res.status(500).send({ error: "Failed to create order" });
  }
});

server.get("/api/past-orders", async function getPastOrders(req, res) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const pastOrders = await db.all(
      "SELECT order_id, date, time FROM orders ORDER BY order_id DESC LIMIT 10 OFFSET ?",
      [offset]
    );
    res.send(pastOrders);
  } catch (error) {
    req.log.error(error);
    res.status(500).send({ error: "Failed to fetch past orders" });
  }
});

server.get("/api/past-order/:order_id", async function getPastOrder(req, res) {
  const orderId = req.params.order_id;

  try {
    const order = await db.get(
      "SELECT order_id, date, time FROM orders WHERE order_id = ?",
      [orderId]
    );

    if (!order) {
      res.status(404).send({ error: "Order not found" });
      return;
    }

    const orderItems = await db.all(
      `SELECT 
        t.pizza_type_id as pizzaTypeId, t.name, t.category, t.ingredients as description, o.quantity, p.price, o.quantity * p.price as total, p.size
      FROM 
        order_details o
      JOIN
        pizzas p
      ON
        o.pizza_id = p.pizza_id
      JOIN
        pizza_types t
      ON
        p.pizza_type_id = t.pizza_type_id
      WHERE 
        order_id = ?`,
      [orderId]
    );

    const formattedOrderItems = orderItems.map((item) =>
      Object.assign({}, item, {
        image: `/padre-ginos-project/pizzas/${item.pizzaTypeId}.webp`,
        quantity: +item.quantity,
        price: +item.price,
      })
    );

    const total = formattedOrderItems.reduce(
      (acc, item) => acc + item.total,
      0
    );

    res.send({
      order: Object.assign({ total }, order),
      orderItems: formattedOrderItems,
    });
  } catch (error) {
    req.log.error(error);
    res.status(500).send({ error: "Failed to fetch order" });
  }
});

server.post("/api/contact", async function contactForm(req, res) {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).send({ error: "All fields are required" });
    return;
  }

  req.log.info(`Contact Form Submission:
    Name: ${name}
    Email: ${email}
    Message: ${message}
  `);

  res.send({ success: "Message received" });
});

const start = async () => {
  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
