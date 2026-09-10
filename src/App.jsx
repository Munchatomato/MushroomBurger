import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000";

// =====================================================
// LOGIN / REGISTER
// =====================================================

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    full_name: "",
    username: "",
    password: "",
    role: "CASHIER",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLoginChange(event) {
    setLoginData({
      ...loginData,
      [event.target.name]: event.target.value,
    });
  }

  function handleRegisterChange(event) {
    setRegisterData({
      ...registerData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleLogin(event) {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Login failed.");
      }

      localStorage.setItem(
        "mushroomFactoryUser",
        JSON.stringify(result.user)
      );

      onLogin(result.user);
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Registration failed."
        );
      }

      setMessage(
        "Account registered successfully. You can now log in."
      );

      setLoginData({
        username: registerData.username,
        password: "",
      });

      setRegisterData({
        full_name: "",
        username: "",
        password: "",
        role: "CASHIER",
      });

      setMode("login");
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">🍄</div>

        <h1>Mushroomburger</h1>

        <p className="auth-subtitle">
          Point of Sale System
        </p>

        <div className="auth-tabs">

          <button
            type="button"
            className={
              mode === "login"
                ? "auth-tab active"
                : "auth-tab"
            }
            onClick={() => {
              setMode("login");
              setError("");
              setMessage("");
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={
              mode === "register"
                ? "auth-tab active"
                : "auth-tab"
            }
            onClick={() => {
              setMode("register");
              setError("");
              setMessage("");
            }}
          >
            Register
          </button>

        </div>

        {message && (
          <div className="auth-success">
            {message}
          </div>
        )}

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {/* LOGIN */}

        {mode === "login" && (
          <form
            className="auth-form"
            onSubmit={handleLogin}
          >

            <label>Username</label>

            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={loginData.username}
              onChange={handleLoginChange}
              required
            />

            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>
        )}

        {/* REGISTER */}

        {mode === "register" && (
          <form
            className="auth-form"
            onSubmit={handleRegister}
          >

            <label>Full Name</label>

            <input
              type="text"
              name="full_name"
              placeholder="Enter full name"
              value={registerData.full_name}
              onChange={handleRegisterChange}
              required
            />

            <label>Username</label>

            <input
              type="text"
              name="username"
              placeholder="Create username"
              value={registerData.username}
              onChange={handleRegisterChange}
              required
            />

            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Create password"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
            />

            <label>Account Role</label>

            <select
              name="role"
              value={registerData.role}
              onChange={handleRegisterChange}
            >
              <option value="CASHIER">
                Cashier
              </option>

              <option value="MANAGER">
                Manager
              </option>
            </select>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}


// =====================================================
// PRODUCT OPTIONS MODAL
// =====================================================

function ProductOptionsModal({
  product,
  editingItem,
  onClose,
  onConfirm,
}) {
  const [quantity, setQuantity] = useState(
    editingItem?.quantity || 1
  );

  if (!product) {
    return null;
  }

  function decrease() {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  }

  function increase() {
    setQuantity((current) =>
      current + 1
    );
  }

  function confirm() {
    onConfirm(quantity);
  }

  const isEditing = Boolean(editingItem);

  return (
    <div className="modal-overlay">

      <div className="modal product-options-modal">

        <div className="product-option-icon">
          🍄
        </div>

        <h2>
          {isEditing
            ? "Edit Order"
            : "Product Options"}
        </h2>

        <h3>
          {product.name}
        </h3>

        <p className="option-price">
          ₱{product.price.toFixed(2)} each
        </p>

        <div className="option-section">

          <label>
            Quantity
          </label>

          <div className="option-quantity">

            <button
              type="button"
              onClick={decrease}
            >
              −
            </button>

            <strong>
              {quantity}
            </strong>

            <button
              type="button"
              onClick={increase}
            >
              +
            </button>

          </div>

        </div>

        <div className="option-total">

          <span>
            Total
          </span>

          <strong>
            ₱
            {(product.price * quantity).toFixed(2)}
          </strong>

        </div>

        <div className="modal-actions">

          <button
            type="button"
            className="close-modal"
            onClick={onClose}
          >
            Back
          </button>

          <button
            type="button"
            className="confirm-product"
            onClick={confirm}
          >
            {isEditing
              ? "Save Changes"
              : "Add to Order"}
          </button>

        </div>

      </div>

    </div>
  );
}


// =====================================================
// POS
// =====================================================

function POS({ user, onLogout }) {

  const [products, setProducts] = useState([]);

  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [productError, setProductError] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [search, setSearch] =
    useState("");

  const [orderType, setOrderType] =
    useState("Dine-In");

  const [cart, setCart] =
    useState([]);

  const [showPayment, setShowPayment] =
    useState(false);

  const [showCancel, setShowCancel] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [editingItem, setEditingItem] =
    useState(null);

  const [orderNumber, setOrderNumber] =
    useState(null);

  const [processingPayment, setProcessingPayment] =
    useState(false);


  // ===================================================
  // LOAD PRODUCTS
  // ===================================================

  useEffect(() => {

    fetch(`${API_URL}/api/products`)
      .then((response) => {

        if (!response.ok) {
          throw new Error(
            "Failed to connect to the server."
          );
        }

        return response.json();
      })

      .then((result) => {

        if (!result.success) {
          throw new Error(
            result.message ||
            "Failed to load products."
          );
        }

        const formattedProducts =
          result.data
            .filter(
              (product) =>
                product.product_status === "AVAILABLE"
            )
            .map((product) => ({
              id: product.id_product,
              name: product.product_name,
              price: Number(product.price),
              category: product.product_category,
            }));

        setProducts(formattedProducts);
      })

      .catch((error) => {

        console.error(
          "Product loading error:",
          error
        );

        setProductError(error.message);
      })

      .finally(() => {
        setLoadingProducts(false);
      });

  }, []);


  // ===================================================
  // CATEGORIES
  // ===================================================

  const categories = [
    "All",
    ...new Set(
      products.map(
        (product) => product.category
      )
    ),
  ];


  // ===================================================
  // FILTER PRODUCTS
  // ===================================================

  const filteredProducts =
    products.filter((product) => {

      const matchesCategory =
        category === "All" ||
        product.category === category;

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      return (
        matchesCategory &&
        matchesSearch
      );
    });


  // ===================================================
  // TOTALS
  // ===================================================

  const subtotal =
    cart.reduce(
      (total, item) =>
        total +
        item.price *
        item.quantity,
      0
    );

  const total = subtotal;


  // ===================================================
  // CLICK PRODUCT
  // ===================================================

  function selectProduct(product) {

    setSelectedProduct(product);
    setEditingItem(null);
  }


  // ===================================================
  // ADD PRODUCT TO CART
  // ===================================================

  function addProductToCart(quantity) {

    const product =
      selectedProduct;

    if (!product) {
      return;
    }

    setCart((currentCart) => {

      const existing =
        currentCart.find(
          (item) =>
            item.id === product.id
        );

      if (existing) {

        return currentCart.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    item.quantity +
                    quantity,
                }
              : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity,
        },
      ];
    });

    setSelectedProduct(null);
    setEditingItem(null);
  }


  // ===================================================
  // EDIT CART ITEM
  // ===================================================

  function openEditItem(item) {

    const product =
      products.find(
        (product) =>
          product.id === item.id
      );

    if (!product) {
      return;
    }

    setSelectedProduct(product);
    setEditingItem(item);
  }


  // ===================================================
  // SAVE EDIT
  // ===================================================

  function saveEditedItem(quantity) {

    if (!editingItem) {
      return;
    }

    setCart((currentCart) =>
      currentCart.map(
        (item) =>
          item.id === editingItem.id
            ? {
                ...item,
                quantity,
              }
            : item
      )
    );

    setEditingItem(null);
    setSelectedProduct(null);
  }


  // ===================================================
  // REMOVE ITEM
  // ===================================================

  function removeItem(id) {

    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.id !== id
      )
    );
  }


  // ===================================================
  // QUICK QUANTITY
  // ===================================================

  function increaseQuantity(id) {

    setCart((currentCart) =>
      currentCart.map(
        (item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  item.quantity + 1,
              }
            : item
      )
    );
  }


  function decreaseQuantity(id) {

    setCart((currentCart) =>
      currentCart
        .map(
          (item) =>
            item.id === id
              ? {
                  ...item,
                  quantity:
                    item.quantity - 1,
                }
              : item
        )
        .filter(
          (item) =>
            item.quantity > 0
        )
    );
  }


  // ===================================================
  // CANCEL ORDER
  // ===================================================

  function cancelOrder() {

    setCart([]);

    setShowCancel(false);

    setOrderNumber(null);
  }


  // ===================================================
  // PAYMENT
  // ===================================================

  async function completePayment(
    paymentMethod
  ) {

    if (processingPayment) {
      return;
    }

    if (cart.length === 0) {
      return;
    }

    setProcessingPayment(true);

    try {

      const response =
        await fetch(
          `${API_URL}/api/orders`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              cashier_id:
                user.id_user,

              order_type:
                orderType === "Dine-In"
                  ? "DINE_IN"
                  : "TAKE_OUT",

              total_amount:
                total,

              items:
                cart.map(
                  (item) => ({
                    product_id:
                      item.id,

                    quantity:
                      item.quantity,

                    unit_price:
                      item.price,
                  })
                ),
            }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
          "Failed to save order."
        );
      }

      const completedOrder =
        result.order;

      setOrderNumber(
        completedOrder.order_number
      );

      setShowPayment(false);

      setCart([]);

      alert(
        `✅ PAYMENT SUCCESSFUL!\n\n` +
        `Order Number: #${completedOrder.order_number}\n` +
        `Serving Number: #${completedOrder.serving_number}\n` +
        `Order Type: ${
          completedOrder.order_type ===
          "DINE_IN"
            ? "Dine-In"
            : "Take-Out"
        }\n` +
        `Payment: ${paymentMethod}\n` +
        `Total: ₱${Number(
          completedOrder.total_amount
        ).toFixed(2)}`
      );

    } catch (error) {

      console.error(
        "Payment error:",
        error
      );

      alert(
        `❌ PAYMENT FAILED\n\n${error.message}`
      );

    } finally {

      setProcessingPayment(false);
    }
  }


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <div className="app">

      {/* ============================================= */}
      {/* TOP BAR */}
      {/* ============================================= */}

      <header className="topbar">

        <div className="brand">

          <div className="logo">
            🍄
          </div>

          <div>

            <h1>
              Mushroomburger
            </h1>

            <p>
              Point of Sale
            </p>

          </div>

        </div>

        <div className="cashier">

          <div>

            <strong>
              {user.full_name}
            </strong>

            <span>
              {user.role} • Online
            </span>

          </div>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </header>


      {/* ============================================= */}
      {/* POS */}
      {/* ============================================= */}

      <main className="pos">

        {/* =========================================== */}
        {/* MENU */}
        {/* =========================================== */}

        <section className="menu">

          <div className="section-header">

            <div>

              <h2>
                Menu
              </h2>

              <p>
                Select products to add to the order
              </p>

            </div>

            <input
              className="search"
              placeholder="Search product..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>


          {/* CATEGORIES */}

          <div className="categories">

            {categories.map(
              (item) => (

                <button
                  type="button"
                  key={item}
                  className={
                    category === item
                      ? "category active"
                      : "category"
                  }
                  onClick={() =>
                    setCategory(item)
                  }
                >
                  {item}
                </button>

              )
            )}

          </div>


          {/* PRODUCTS */}

          <div className="products">

            {loadingProducts ? (

              <div className="empty-cart">

                <div>
                  🍄
                </div>

                <h3>
                  Loading products...
                </h3>

                <p>
                  Connecting to the database.
                </p>

              </div>

            ) : productError ? (

              <div className="empty-cart">

                <div>
                  ⚠️
                </div>

                <h3>
                  Unable to load products
                </h3>

                <p>
                  {productError}
                </p>

              </div>

            ) : filteredProducts.length === 0 ? (

              <div className="empty-cart">

                <div>
                  🍄
                </div>

                <h3>
                  No products found
                </h3>

                <p>
                  No products match your search.
                </p>

              </div>

            ) : (

              filteredProducts.map(
                (product) => (

                  <button
                    type="button"
                    key={product.id}
                    className="product"
                    onClick={() =>
                      selectProduct(product)
                    }
                  >

                    <div className="product-icon">
                      🍄
                    </div>

                    <div className="product-info">

                      <h3>
                        {product.name}
                      </h3>

                      <strong>
                        ₱
                        {product.price.toFixed(2)}
                      </strong>

                    </div>

                    <span className="add">
                      +
                    </span>

                  </button>

                )
              )

            )}

          </div>

        </section>


        {/* =========================================== */}
        {/* CURRENT ORDER */}
        {/* =========================================== */}

        <aside className="order-panel">

          <div className="order-header">

            <div>

              <h2>
                Current Order
              </h2>

              <p>
                {cart.length} item
                {cart.length !== 1
                  ? "s"
                  : ""}
              </p>

            </div>

            {orderNumber && (

              <div className="order-number">
                #{orderNumber}
              </div>

            )}

          </div>


          {/* ORDER TYPE */}

          <div className="order-type">

            <button
              type="button"
              className={
                orderType === "Dine-In"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setOrderType("Dine-In")
              }
            >
              Dine-In
            </button>

            <button
              type="button"
              className={
                orderType === "Take-Out"
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setOrderType("Take-Out")
              }
            >
              Take-Out
            </button>

          </div>


          {/* CART */}

          <div className="cart">

            {cart.length === 0 ? (

              <div className="empty-cart">

                <div>
                  🛒
                </div>

                <h3>
                  No items yet
                </h3>

                <p>
                  Select a product from the menu.
                </p>

              </div>

            ) : (

              cart.map(
                (item) => (

                  <div
                    className="cart-item"
                    key={item.id}
                  >

                    {/* PRODUCT INFO */}

                    <div className="cart-details">

                      <strong>
                        {item.name}
                      </strong>

                      <span>
                        ₱
                        {item.price.toFixed(2)}
                        {" "}each
                      </span>

                    </div>


                    {/* QUANTITY */}

                    <div className="quantity">

                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity(
                            item.id
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity(
                            item.id
                          )
                        }
                      >
                        +
                      </button>

                    </div>


                    {/* ITEM TOTAL */}

                    <strong>
                      ₱
                      {(
                        item.price *
                        item.quantity
                      ).toFixed(2)}
                    </strong>


                    {/* EDIT / REMOVE */}

                    <div className="cart-item-actions">

                      <button
                        type="button"
                        className="edit-item"
                        onClick={() =>
                          openEditItem(item)
                        }
                      >
                        ✏️ Edit
                      </button>

                      <button
                        type="button"
                        className="remove-item"
                        onClick={() =>
                          removeItem(item.id)
                        }
                      >
                        🗑 Remove
                      </button>

                    </div>

                  </div>

                )
              )

            )}

          </div>


          {/* SUMMARY */}

          <div className="summary">

            <div>

              <span>
                Subtotal
              </span>

              <strong>
                ₱
                {subtotal.toFixed(2)}
              </strong>

            </div>

            <div>

              <span>
                Discount
              </span>

              <strong>
                ₱0.00
              </strong>

            </div>

            <div className="total">

              <span>
                Total
              </span>

              <strong>
                ₱
                {total.toFixed(2)}
              </strong>

            </div>

          </div>


          {/* ACTIONS */}

          <div className="actions">

            <button
              type="button"
              className="cancel"
              disabled={
                cart.length === 0
              }
              onClick={() =>
                setShowCancel(true)
              }
            >
              Cancel Order
            </button>

            <button
              type="button"
              className="payment"
              disabled={
                cart.length === 0
              }
              onClick={() =>
                setShowPayment(true)
              }
            >
              Proceed to Payment
            </button>

          </div>

        </aside>

      </main>


      {/* ============================================= */}
      {/* PRODUCT OPTIONS MODAL */}
      {/* ============================================= */}

      {selectedProduct && (

        <ProductOptionsModal
          product={selectedProduct}
          editingItem={editingItem}

          onClose={() => {
            setSelectedProduct(null);
            setEditingItem(null);
          }}

          onConfirm={
            editingItem
              ? saveEditedItem
              : addProductToCart
          }
        />

      )}


      {/* ============================================= */}
      {/* PAYMENT MODAL */}
      {/* ============================================= */}

      {showPayment && (

        <div className="modal-overlay">

          <div className="modal">

            <h2>
              Payment
            </h2>

            <p className="modal-total">
              Total Amount
            </p>

            <div className="big-total">
              ₱
              {total.toFixed(2)}
            </div>

            <div className="payment-methods">

              <button
                type="button"
                disabled={processingPayment}
                onClick={() =>
                  completePayment("CASH")
                }
              >
                💵 Cash
              </button>

              <button
                type="button"
                disabled={processingPayment}
                onClick={() =>
                  completePayment("CARD")
                }
              >
                💳 Card
              </button>

            </div>

            {processingPayment && (
              <p className="processing-payment">
                Processing payment...
              </p>
            )}

            <button
              type="button"
              className="close-modal"
              disabled={processingPayment}
              onClick={() =>
                setShowPayment(false)
              }
            >
              Back
            </button>

          </div>

        </div>

      )}


      {/* ============================================= */}
      {/* CANCEL MODAL */}
      {/* ============================================= */}

      {showCancel && (

        <div className="modal-overlay">

          <div className="modal">

            <h2>
              Cancel Order?
            </h2>

            <p>
              Select a reason for cancelling this order.
            </p>

            <div className="cancel-reasons">

              <button
                type="button"
                onClick={cancelOrder}
              >
                Customer cancelled
              </button>

              <button
                type="button"
                onClick={cancelOrder}
              >
                Wrong order
              </button>

              <button
                type="button"
                onClick={cancelOrder}
              >
                Duplicate order
              </button>

              <button
                type="button"
                onClick={cancelOrder}
              >
                Other
              </button>

            </div>

            <button
              type="button"
              className="close-modal"
              onClick={() =>
                setShowCancel(false)
              }
            >
              Back
            </button>

          </div>

        </div>

      )}

    </div>
  );
}


// =====================================================
// MAIN APP
// =====================================================

function App() {

  const [user, setUser] = useState(() => {

    const savedUser =
      localStorage.getItem(
        "mushroomFactoryUser"
      );

    if (!savedUser) {
      return null;
    }

    try {

      return JSON.parse(savedUser);

    } catch (error) {

      console.error(
        "Invalid saved user:",
        error
      );

      localStorage.removeItem(
        "mushroomFactoryUser"
      );

      return null;
    }

  });


  // ===================================================
  // LOGIN
  // ===================================================

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
  }


  // ===================================================
  // LOGOUT
  // ===================================================

  function handleLogout() {

    localStorage.removeItem(
      "mushroomFactoryUser"
    );

    setUser(null);
  }


  // ===================================================
  // SCREEN
  // ===================================================

  if (!user) {

    return (
      <AuthScreen
        onLogin={handleLogin}
      />
    );
  }


  return (
    <POS
      user={user}
      onLogout={handleLogout}
    />
  );
}


export default App;