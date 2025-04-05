import { usePizzaOfTheDay } from "./usePizzaOfTheDay";

// feel free to change en-US / USD to your locale
const intl = new Intl.NumberFormat("en-UK", {
  style: "currency",
  currency: "GBP",
});

const PizzaOfTheDay = () => {
  const pizzaOfTheDay = usePizzaOfTheDay();

  if (!pizzaOfTheDay) {
    return (
      <>
        <div className="past-orders">
          <h2>LOADING …</h2>
        </div>
        <div className="loader"></div>
      </>
    );
  }

  return (
    <div className="pizza-of-the-day">
      <h2>Pizza of the Day</h2>
      <div>
        <div className="pizza-of-the-day-info">
          <h3>{pizzaOfTheDay.name}</h3>
          <p>{pizzaOfTheDay.description}</p>
          <p className="pizza-of-the-day-price">
            From: <span>{intl.format(pizzaOfTheDay.sizes.S)}</span>
          </p>
        </div>
        <img
          className="pizza-of-the-day-image"
          src={pizzaOfTheDay.image}
          alt={pizzaOfTheDay.name}
        />
      </div>
    </div>
  );
};

export default PizzaOfTheDay;
