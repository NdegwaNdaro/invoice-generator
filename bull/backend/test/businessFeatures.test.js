import test from "node:test";
import assert from "node:assert/strict";

import { buildRevenueSummary } from "../src/utils/revenueReport.js";
import { canAccessResource } from "../src/utils/roles.js";

test("buildRevenueSummary totals invoices and outstanding balances", () => {
  const summary = buildRevenueSummary([
    { total: 1000, status: "paid" },
    { total: 2500, status: "sent" },
    { total: 300, status: "overdue" },
    { total: 500, status: "draft" }
  ], [
    { amount: 900 },
    { amount: 200 }
  ]);

  assert.equal(summary.totalRevenue, 4300);
  assert.equal(summary.totalCollected, 1100);
  assert.equal(summary.outstanding, 3200);
  assert.equal(summary.overdueCount, 1);
});

test("role access checks enforce the requested permission", () => {
  const user = { role: "manager" };
  assert.equal(canAccessResource(user, "view_reports"), true);
  assert.equal(canAccessResource(user, "delete_customer"), false);
});
