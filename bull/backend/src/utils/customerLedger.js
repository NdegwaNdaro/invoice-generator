export function summarizeCustomerLedger(invoices = [], payments = []) {
  const totalInvoiced = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0),
    0
  );
  const totalPaid = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const invoiceLedger = invoices.map((invoice) => {
    const paidAmount = Number(
      invoice.paidAmount ??
        payments
          .filter((payment) => Number(payment.invoiceId) === Number(invoice.id))
          .reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
    );

    const outstanding = Math.max(0, Number(invoice.total || 0) - paidAmount);
    const overdue =
      invoice.status === "overdue" ||
      (invoice.dueDate && new Date(invoice.dueDate) < new Date(new Date().toDateString()) && invoice.status !== "paid");

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      total: Number(invoice.total || 0),
      paidAmount,
      outstanding,
      overdue
    };
  });

  return {
    totalInvoiced,
    totalPaid,
    totalOutstanding: Math.max(0, totalInvoiced - totalPaid),
    overdueCount: invoiceLedger.filter((invoice) => invoice.overdue).length,
    invoiceCount: invoiceLedger.length,
    ledger: invoiceLedger
  };
}
