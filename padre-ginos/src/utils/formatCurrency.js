const intl = new Intl.NumberFormat("en-UK", {
  style: "currency",
  currency: "GBP",
});

export function formatCurrency(value) {
  return intl.format(value);
}