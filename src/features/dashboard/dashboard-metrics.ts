import type { Product } from "@/features/products/types/product";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function priceToCents(price: string) {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(price);

  if (!match) {
    return BigInt(0);
  }

  const [, whole, fraction = ""] = match;
  return BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
}

export function calculateInventoryValueInCents(products: Product[]) {
  return products.reduce(
    (total, product) =>
      product.isActive
        ? total + priceToCents(product.price) * BigInt(product.stock)
        : total,
    BigInt(0),
  );
}

export function formatInventoryValue(valueInCents: bigint) {
  const wholeValue = valueInCents / BigInt(100);
  const fraction = (valueInCents % BigInt(100)).toString().padStart(2, "0");

  return currencyFormatter
    .formatToParts(wholeValue)
    .map((part) => (part.type === "fraction" ? fraction : part.value))
    .join("");
}
