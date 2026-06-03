# Inventory & Order Management System (MERN Stack)

A professional, easy-to-use, and highly explainable **Inventory & Order Management System** built with the **MERN Stack** (MongoDB, Express, React, Node.js). 

This system supports dual roles (Admin & Seller/User), high-precision currency values in INR (₹) utilizing `Decimal128`, base unit internal storage, and dynamic unit conversions (grams/kilograms, milliliters/liters, count/items).

---

## 🚀 Key Features

* **Secure Authentication**: JWT-based authentication with role-based routing (Admin vs. Seller/User).
* **Unified Inventory & Product Management**: Create, edit, and delete products, filter categories, search by SKU, and track stock.
* **Smart Unit Conversion & Calculations**:
  * Weights: Kilograms (kg) $\leftrightarrow$ Grams (g)
  * Volumes: Liters (L) $\leftrightarrow$ Milliliters (mL)
  * Count: Item $\leftrightarrow$ Item
* **Live Pricing Estimations**: Real-time pricing calculated instantly in the frontend based on the selected unit.
* **Verification Pipelines**: Backend verifies user quantity selections and calculations against official database prices, preventing request tampering.
* **Order & Quotation Workflows**: Sellers create draft quotations or submit final orders; Admins track and update order statuses.

---

## 🏛️ Project Architecture

```text
+----------------------------------------------------+
|               React.js Frontend (Vite)             |
|   - Dynamic UI with Tailwind CSS                    |
|   - Global Context (Auth, Cart, Unit Selectors)     |
+--------------------------+-------------------------+
                           |
                     HTTP JSON & JWT
                           |
                           v
+--------------------------+-------------------------+
|             Express.js Server (Node.js)            |
|   - Auth Middleware & Role Guard                    |
|   - Unit Conversion Helpers & Order Recalculator    |
+--------------------------+-------------------------+
                           |
                      Mongoose ODM
                           |
                           v
+--------------------------+-------------------------+
|                  MongoDB Atlas Database            |
|   - Schema-validated collections                   |
|   - Numeric indices for fast query lookups         |
+----------------------------------------------------+
```

---

## 📂 Folder Structure

```text
/aasa-medchem-system
│
├── /server                 # Backend Express Application
│   ├── /config             # db.js (MongoDB Connection setup)
│   ├── /middleware         # auth.js (JWT & Role validation guards)
│   ├── /models             # User.js, Product.js, Order.js, Category.js
│   ├── /routes             # authRoutes.js, productRoutes.js, orderRoutes.js
│   ├── /controllers        # Route handlers executing conversions & database saves
│   ├── server.js           # Server startup script
│   └── package.json        # Server backend packages
│
└── /client                 # Frontend Vite + React Application
    ├── /src
    │   ├── /components     # Navbar.jsx, ProductCard.jsx, ProtectedRoute.jsx
    │   ├── /context        # AuthContext.jsx, CartContext.jsx
    │   ├── /pages          # Login.jsx, Catalog.jsx, AdminDashboard.jsx
    │   ├── /utils          # conversion.js (Unit conversions & INR formatting)
    │   ├── App.jsx         # App layouts and Route configurations
    │   ├── index.css       # Styling configuration
    │   └── main.jsx        # Frontend entry point
    └── package.json        # Frontend React packages
```

---

## 📊 Database Schema (MongoDB Collections)

### 1. `users`
* **`name`**: String (Full name of user)
* **`email`**: String (Unique email, used for login)
* **`password`**: String (Hashed password using `bcryptjs`)
* **`role`**: String (Either `'admin'` or `'seller'`)

### 2. `products`
* **`sku`**: String (Unique Stock Keeping Unit code)
* **`name`**: String (Product title)
* **`description`**: String
* **`category`**: ObjectId (Ref to Category collection)
* **`baseUnit`**: String (`'g'` for weights, `'mL'` for volumes, or `'item'` for piece count)
* **`basePricePerUnit`**: Decimal128 (Currency cost in INR for 1 base unit)
* **`stockQuantity`**: Number (Current available inventory count stored in base units, e.g. 5000g instead of 5kg)

### 3. `orders` / `quotations`
* **`orderNumber`**: String (Auto-generated code, e.g. ORD-1001)
* **`seller`**: ObjectId (Ref to User collection)
* **`items`**: Array of subdocuments:
  * `product`: ObjectId (Ref to Product collection)
  * `sku`: String (Snapshot of SKU)
  * `name`: String (Snapshot of Product name)
  * `quantityOrdered`: Number (Amount input by seller, e.g. 2.5)
  * `unitSelected`: String (Input unit, e.g. `'kg'`)
  * `quantityInBaseUnit`: Number (Converted count stored in base units, e.g. 2500)
  * `pricePerBaseUnit`: Decimal128 (Cost per base unit, e.g. 0.15)
  * `itemSubtotal`: Decimal128 (Calculated cost: `quantityInBaseUnit * pricePerBaseUnit`)
* **`totalAmount`**: Decimal128 (Sum of all item subtotals)
* **`status`**: String (`'pending'`, `'approved'`, `'processing'`, `'completed'`, `'cancelled'`)

---

## ⚖️ Unit Conversion Strategy

To ensure data integrity, **all stock quantities and prices are stored in single base units**:
* **Weight products**: Stored in **grams (g)**.
* **Volume products**: Stored in **milliliters (mL)**.
* **Count products**: Stored in **items (item)**.

### Conversion Logic

* **Kilograms (kg) to Grams (g)**:
  $$\text{grams} = \text{kg} \times 1000$$
* **Liters (L) to Milliliters (mL)**:
  $$\text{milliliters} = \text{L} \times 1000$$

### Why Backend Verification is Required
The client calculates subtotal estimations in React so that sellers see immediate updates. However, when the user clicks **Place Order**, the client sends only the `productId`, the `quantityOrdered`, and the `unitSelected`. 

The server recalculates the conversion and total amount using base prices stored directly in MongoDB:
$$\text{Calculated Price} = (\text{Quantity Ordered} \times \text{Conversion Multiplier}) \times \text{Base Price Per Unit}$$

This verifies the integrity of every transaction and prevents user manipulation of price fields.

---

## ⚙️ Setup Instructions

### Prerequisites
* [Node.js](https://nodejs.org/) installed (v18+ recommended)
* A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account

### 1. Clone & Install Dependencies
Navigate to your project root folder and install packages for both client and server:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables
Create a file named `.env` inside the `/server` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/aasa-medchem?retryWrites=true&w=majority
JWT_SECRET=supersecretkey12345
```

---

## 💻 Local Development

### 1. Start the Backend Server
From the `/server` directory:
```bash
npm run dev
# or
node server.js
```
The server will start on [http://localhost:5000](http://localhost:5000).

### 2. Start the React Frontend
From the `/client` directory:
```bash
npm run dev
```
The application will launch on [http://localhost:5173](http://localhost:5173).

---

## 🧪 Test Credentials

Once you seed your database, you can use these profiles to verify the role structures:

* **Administrator Account**:
  * **Email**: `admin@gmail.com`
  * **Password**: `admin123`
  * **Permissions**: Access to Dashboard metrics, Product CRUD actions, stock refills, user tables, and updating Order statuses.

* **Seller / User Account**:
  * **Email**: `seller@gmail.com`
  * **Password**: `seller123`
  * **Permissions**: Access to Product Catalog, Live Pricing Calculators, Cart checkout, Order creation, and Personal Order history.

---

## ☁️ Deployment

### Backend Deployment (Render or Vercel)
1. Commit and push your code repository to GitHub.
2. Link your repository to **Render** or **Vercel**.
3. Set your Environment variables (`MONGODB_URI`, `JWT_SECRET`) in the hosting panel.
4. Ensure your server start command is set to `node server.js`.

### Frontend Deployment (Vercel)
1. Add a `vercel.json` rewrite file to ensure React routing works seamlessly.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Define your backend address in your API service helper file.
