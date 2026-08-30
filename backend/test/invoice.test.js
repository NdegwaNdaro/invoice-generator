import assert from "node:assert/strict";
import test from "node:test";
import { calculateInvoice, validateInvoiceInput } from "../src/utils/invoice.js";

test("calculateInvoice calculates subtotal, tax, discount, and total", () => {
  const result = calculateInvoice(
    [
      { description: "Website design", quantity: 1, rate: 50000 },
      { description: "Hosting", quantity: 1, rate: 5000 }
    ],
    16,
    2000
  );

  assert.equal(result.subtotal, 55000);
  assert.equal(result.tax, 8800);
  assert.equal(result.total, 61800);
  assert.deepEqual(result.items.map((item) => item.amount), [50000, 5000]);
});

test("calculateInvoice prevents a negative total", () => {
  assert.equal(
    calculateInvoice([{ description: "Credit", quantity: 1, rate: 100 }], 0, 200).total,
    0
  );
});

test("validateInvoiceInput rejects incomplete invoice items", () => {
  assert.equal(
    validateInvoiceInput({
      customerId: 1,
      invoiceDate: "2026-08-30",
      items: [{ description: "", quantity: 0, rate: -1 }]
    }),
    "Each item requires a description, positive quantity, and valid rate."
  );
});
