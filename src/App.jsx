import { useState } from "react";
import "./App.css";

const products = [
  { id: 1, name: "Mushroom Burger", price: 120, category: "Burgers" },
  { id: 2, name: "Mushroom Burger Meal", price: 180, category: "Burgers" },
  { id: 3, name: "Cheese Mushroom Burger", price: 150, category: "Burgers" },
  { id: 4, name: "Double Mushroom Burger", price: 200, category: "Burgers" },

  { id: 5, name: "Mushroom Rice Meal", price: 165, category: "Rice Meals" },
  { id: 6, name: "Mushroom Chicken", price: 190, category: "Rice Meals" },

  { id: 7, name: "Mushroom Fries", price: 90, category: "Sides" },
  { id: 8, name: "Mushroom Nuggets", price: 110, category: "Sides" },

  { id: 9, name: "Iced Tea", price: 60, category: "Drinks" },
  { id: 10, name: "Soft Drink", price: 55, category: "Drinks" },
];

const categories = ["All", "Burgers", "Rice Meals", "Sides", "Drinks"];

function App() {
  const [category, setCategory] = useState("All");
  const [orderType, setOrderType] = useState("Dine-In");
  const [cart, setCart] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  const filteredProducts =
    category === "All"
      ? products
      : products.filter((product) => product.category === category);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const total = subtotal;

  function addToCart(product) {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  }

  function increaseQuantity(id) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decreaseQuantity(id) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function cancelOrder() {
    setCart([]);
    setShowCancel(false);
    setOrderNumber(null);
  }

  function completePayment() {
    const number = Math.floor(100 + Math.random() * 900);

    setOrderNumber(number);
    setShowPayment(false);
  }

  return (
    <div className="app">

      {/* HEADER */}
      <header className="topbar">
        <div className="brand">
          <div className="logo">🍄</div>

          <div>
            <h1>Mushroom Factory</h1>
            <p>Point of Sale</p>
          </div>
        </div>

        <div className="cashier">
          <div>
            <strong>Cashier 01</strong>
            <span>Online</span>
          </div>

          <button className="logout-button">
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="pos">

        {/* MENU */}
        <section className="menu">

          <div className="section-header">
            <div>
              <h2>Menu</h2>
              <p>Select products to add to the order</p>
            </div>

            <input
              className="search"
              placeholder="Search product..."
            />
          </div>

          {/* CATEGORIES */}
          <div className="categories">
            {categories.map((item) => (
              <button
                key={item}
                className={category === item ? "category active" : "category"}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {/* PRODUCTS */}
          <div className="products">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                className="product"
                onClick={() => addToCart(product)}
              >
                <div className="product-icon">🍄</div>

                <div className="product-info">
                  <h3>{product.name}</h3>
                  <strong>₱{product.price.toFixed(2)}</strong>
                </div>

                <span className="add">
                  +
                </span>
              </button>
            ))}
          </div>

        </section>

        {/* CURRENT ORDER */}
        <aside className="order-panel">

          <div className="order-header">
            <div>
              <h2>Current Order</h2>

              <p>
                {cart.length} item{cart.length !== 1 ? "s" : ""}
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
              className={orderType === "Dine-In" ? "selected" : ""}
              onClick={() => setOrderType("Dine-In")}
            >
              Dine-In
            </button>

            <button
              className={orderType === "Take-Out" ? "selected" : ""}
              onClick={() => setOrderType("Take-Out")}
            >
              Take-Out
            </button>
          </div>

          {/* CART */}
          <div className="cart">

            {cart.length === 0 ? (
              <div className="empty-cart">
                <div>🛒</div>
                <h3>No items yet</h3>
                <p>Select a product from the menu.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item.id}>

                  <div className="cart-details">
                    <strong>{item.name}</strong>
                    <span>
                      ₱{item.price.toFixed(2)} each
                    </span>
                  </div>

                  <div className="quantity">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => increaseQuantity(item.id)}
                    >
                      +
                    </button>
                  </div>

                  <strong>
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </strong>

                </div>
              ))
            )}

          </div>

          {/* SUMMARY */}
          <div className="summary">

            <div>
              <span>Subtotal</span>
              <strong>₱{subtotal.toFixed(2)}</strong>
            </div>

            <div>
              <span>Discount</span>
              <strong>₱0.00</strong>
            </div>

            <div className="total">
              <span>Total</span>
              <strong>₱{total.toFixed(2)}</strong>
            </div>

          </div>

          {/* BUTTONS */}
          <div className="actions">

            <button
              className="cancel"
              disabled={cart.length === 0}
              onClick={() => setShowCancel(true)}
            >
              Cancel Order
            </button>

            <button
              className="payment"
              disabled={cart.length === 0}
              onClick={() => setShowPayment(true)}
            >
              Proceed to Payment
            </button>

          </div>

        </aside>

      </main>

      {/* PAYMENT MODAL */}
      {showPayment && (
        <div className="modal-overlay">

          <div className="modal">

            <h2>Payment</h2>

            <p className="modal-total">
              Total Amount
            </p>

            <div className="big-total">
              ₱{total.toFixed(2)}
            </div>

            <div className="payment-methods">

              <button
                onClick={completePayment}
              >
                💵 Cash
              </button>

              <button
                onClick={completePayment}
              >
                💳 Card
              </button>

            </div>

            <button
              className="close-modal"
              onClick={() => setShowPayment(false)}
            >
              Back
            </button>

          </div>

        </div>
      )}

      {/* CANCEL MODAL */}
      {showCancel && (
        <div className="modal-overlay">

          <div className="modal">

            <h2>Cancel Order?</h2>

            <p>
              Select a reason for cancelling this order.
            </p>

            <div className="cancel-reasons">

              <button onClick={cancelOrder}>
                Customer cancelled
              </button>

              <button onClick={cancelOrder}>
                Wrong order
              </button>

              <button onClick={cancelOrder}>
                Duplicate order
              </button>

              <button onClick={cancelOrder}>
                Other
              </button>

            </div>

            <button
              className="close-modal"
              onClick={() => setShowCancel(false)}
            >
              Back
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default App;