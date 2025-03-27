import { useContext } from "react";
import { Link } from "@tanstack/react-router";
import { CartContext } from "./contexts";

const intl = new Intl.NumberFormat("en-UK", {
  style: "currency",
  currency: "GBP",
});

export default function Header() {
  const [cart] = useContext(CartContext);

  const totalPrice = intl.format(
    cart.reduce((sum, item) => {
      return sum + item.pizza.sizes[item.size];
    }, 0),
  );

  return (
    <nav>
      <Link to={"/"}>
        <h1 className="logo">Padre Gino's Pizza</h1>
      </Link>
      <Link className="nav-cart" to={"/order"}>
        <span className="nav-cart-total">{totalPrice}…</span> &nbsp;🛒
        <span className="nav-cart-number">{cart.length}</span>
      </Link>
    </nav>
  );
}
