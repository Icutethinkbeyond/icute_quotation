Refactor and redesign the quotation document rendering system for **A4 paper preview mode** with high accuracy for future export using **html2pdf.js**.

## Main Goal

Improve the quotation item layout so grouped rows, categories, and child items render cleanly in browser preview and convert to PDF without broken rows, split sections, or unreadable page breaks.

The final output must look like a professional printable quotation document.

---

# Document Structure

Each quotation consists of:

1. First page top area:
   - Company Header
   - Customer Information
   - Quotation Meta Data (quotation no, date, due date, etc.)

2. Middle area:
   - Quotation item table

3. Final area:
   - Summary totals
   - VAT / Discount / Grand total
   - Notes
   - Signature section
   - Footer

---

# Data Structure

Quotation rows contain:

## Category Row

Main grouped section เช่น:

- งานระบบไฟฟ้า
- งานตกแต่งภายใน
- งานระบบประปา

## Child Items Under Category

Each category contains rows:

- Item name
- Description
- Qty
- Unit
- Price
- Total

---

# Critical Problem To Solve

Current rendering causes:

- Rows cut in half across pages
- Category title at bottom page but items on next page
- Summary split to another page badly
- Header duplicated incorrectly
- PDF output mismatch from preview

Need AI to fully solve this.

---

# Required Layout Rules

## A4 Page Size

Use exact A4 proportions:

- Width: 210mm
- Height: 297mm

Recommended preview container:

- width: 794px
- min-height: 1123px

---

## Pagination Rules

### MUST Prevent Row Splitting

Never split these across pages:

- Category title row
- Item row
- Item description block
- Signature section
- Summary totals block

Use:

```css
page-break-inside: avoid;
break-inside: avoid;