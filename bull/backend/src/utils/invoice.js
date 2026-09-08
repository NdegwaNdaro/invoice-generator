export function calculateInvoice(items, taxRate = 0, discount = 0) {
  const normalizedItems = items.map((item) => {
    const quantity = Number(item.quantity);
    const rate = Number(item.rate);
    return {
      description: item.description?.trim(),
      quantity,
      rate,
      amount: Number((quantity * rate).toFixed(2))
    };
  });

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = Number((subtotal * (Number(taxRate) / 100)).toFixed(2));
  const total = Number(Math.max(0, subtotal + tax - Number(discount || 0)).toFixed(2));

  return {
    items: normalizedItems,
    subtotal: Number(subtotal.toFixed(2)),
    taxRate: Number(taxRate || 0),
    tax,
    discount: Number(discount || 0),
    total
  };
}

export function validateInvoiceInput(body) {
  if (!body.customerId || !body.invoiceDate) {
    return "Customer and invoice date are required.";
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return "Add at least one invoice item.";
  }
  const invalid = body.items.some(
    (item) =>
      !item.description?.trim() ||
      !Number.isFinite(Number(item.quantity)) ||
      Number(item.quantity) <= 0 ||
      !Number.isFinite(Number(item.rate)) ||
      Number(item.rate) < 0
  );
  return invalid ? "Each item requires a description, positive quantity, and valid rate." : null;
}
