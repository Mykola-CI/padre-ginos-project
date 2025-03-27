import { useState, useContext } from "react";
import { formatCurrency } from "./utils/formatCurrency";
import { CartContext } from "./contexts";

export default function Cart() {
  const [cart, setCart] = useContext(CartContext);
  const [loading, setLoading] = useState(false);

  let totalPrice = 0;
  for (let i = 0; i < cart.length; i++) {
    const current = cart[i];
    totalPrice += current.pizza.sizes[current.size];
  }

  async function checkout() {
    setLoading(true);

    await fetch("/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cart,
      }),
    });

    setCart([]);
    setLoading(false);
  }

  function removeFromCart(index) {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <div>
      {loading ? (
        <h2>LOADING …</h2>
      ) : (
        <div className="cart">
          <h2>Cart</h2>
          <ul>
            {cart.map((item, index) => (
              <li key={index}>
                <span className="size">{item.size}</span> –
                <span className="type">{item.pizza.name}</span> –
                <span className="price">{item.price}</span>
                <button type="button" className="cartRemoveButton" onClick={() => removeFromCart(index)}>X</button>
              </li>
            ))}
          </ul>
          <p>Total: {formatCurrency(totalPrice)}</p>
          <div>
            <button type="button" onClick={checkout}>
              Checkout
            </button>
          </div>
          <div>
            <button type="button" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
          </div>
        )}
    </div>
  );
}
