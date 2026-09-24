// Knowledge Library seed concepts. Grow this alongside the curriculum: every new
// financial or business term a session introduces is a candidate entry.
import type { LibraryEntry } from "./types";

export const LIBRARY: LibraryEntry[] = [
  {
    "id": "gross-margin",
    "term": "Gross Margin",
    "short": "What's left from a sale after the direct cost of producing it, as a percentage of the sale price.",
    "medium": "Gross margin = (Revenue − Cost of Goods Sold) ÷ Revenue. It tells you how much of every rand of sales actually stays in the business before overheads like rent, salaries, or marketing are paid. A butchery selling meat at R150/kg that cost R100/kg to source has a gross margin of 33%.",
    "application": "Use it to compare products or services within your own business — which one actually leaves you the most room to cover overheads and profit — not just which sells the most.",
    "mistakes": "Confusing gross margin with net profit. A healthy gross margin can still result in a loss if overheads are too high.",
    "related": [
      "cash-flow",
      "pnl",
      "pricing"
    ]
  },
  {
    "id": "cash-flow",
    "term": "Cash Flow",
    "short": "The actual movement of money in and out of the business, regardless of what's owed or earned on paper.",
    "medium": "Cash flow is distinct from profit. A business can be profitable on paper and still run out of cash if payments are timed badly — money owed to you arrives late while money you owe goes out on time.",
    "application": "Track cash flow separately from your P&L, especially if you extend payment terms to customers or hold physical stock.",
    "mistakes": "Assuming 'we're profitable' means 'we're fine.' See the Day 25 case study.",
    "related": [
      "gross-margin",
      "pnl",
      "budgeting"
    ]
  },
  {
    "id": "cac",
    "term": "Customer Acquisition Cost (CAC)",
    "short": "What it costs you, on average, to win one new paying customer.",
    "medium": "CAC = total spend on acquiring customers over a period ÷ number of new customers gained in that period. It only becomes meaningful compared against Customer Lifetime Value (CLV) — a low CAC is worthless if the customer is worth even less.",
    "application": "Before spending on ads or promotions, estimate CAC against what a customer is actually worth to you over time.",
    "mistakes": "Counting only ad spend and ignoring the time cost of manual outreach, which is real cost even if no cash changes hands.",
    "related": [
      "retention",
      "distribution",
      "unit-economics"
    ]
  },
  {
    "id": "value-proposition",
    "term": "Value Proposition",
    "short": "A specific, one-sentence statement of who you help, what problem you solve, and why your way beats the alternative.",
    "medium": "A strong value proposition names a specific customer and a specific pain, and states plainly why doing business with you beats their current alternative — including doing nothing.",
    "application": "Use it as a test: if a sentence about your business could apply to almost any competitor, it isn't a value proposition yet.",
    "mistakes": "Describing everything you do instead of the one sharpest true thing that matters most to the customer.",
    "related": [
      "positioning",
      "pricing"
    ]
  },
  {
    "id": "reversible-decisions",
    "term": "Reversible vs Irreversible Decisions",
    "short": "A way of matching how much deliberation a decision deserves to how costly it actually is to get wrong.",
    "medium": "Two-way-door decisions can be undone if they don't work. One-way-door decisions can't, or can't easily. Treating every decision like a one-way door is a common, quiet source of slowness and perfectionism.",
    "application": "Before deliberating at length, ask: can I reverse this if it's wrong? If yes, decide fast and review the outcome later.",
    "mistakes": "Using 'this could be reversed eventually, with enough cost and pain' as if that made it a two-way door — reversibility only counts if it's genuinely cheap.",
    "related": [
      "decision-theory",
      "responsibility"
    ]
  }
];
