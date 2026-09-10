export function buildRevenueSummary(invoices = [], payments = []) {
  const totalRevenue = invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const totalCollected = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const outstanding = Math.max(0, totalRevenue - totalCollected);
  const overdueCount = invoices.filter((invoice) => invoice.status === "overdue").length;

  return {
    totalRevenue,
    totalCollected,
    outstanding,
    overdueCount,
    invoiceCount: invoices.length,
    paymentCount: payments.length
  };
}
