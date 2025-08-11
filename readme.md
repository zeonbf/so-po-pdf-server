# PDF Generation Server

This is a simple Express.js server that generates PDF documents from order data using Puppeteer. The server exposes a POST endpoint `/generate-pdf` which accepts order details and returns a PDF invoice.

## Features

- Generates PDF invoices dynamically using HTML templates.
- Uses Puppeteer to render HTML and produce PDFs.
- Supports CORS for easy frontend integration.
- Customizable page size and order type.
- Returns PDF with proper `Content-Disposition` headers for attachment download.

## Installation

```bash
git clone <repo-url>
cd <repo-directory>
npm install
npm start
```

### API Endpoint

`POST /generate-pdf`

#### Request Body

```json
{
  "order": {
    "id": "ORD-123456",
    "companyDetails": {
      "companyName": "My Company",
      "branch": "Main Branch",
      "address": "123 Main St",
      "city": "City",
      "state": "State",
      "zip": "12345"
    },
    "customerDetails": {
      "name": "John Doe",
      "branch": "Customer Branch",
      "address": "456 Customer Rd",
      "city": "Customer City",
      "state": "Customer State",
      "zip": "67890",
      "phone": "123-456-7890"
    },
    "products": [
      {
        "productName": "Product 1",
        "description": "Description 1",
        "netQuantity": 10,
        "unit": "pcs",
        "myPrice": 15.5
      }
    ],
    "totalAmount": 155,
    "purchaseOrderNo": "PO1234",
    "rep": "Sales Rep",
    "projectName": "Project X",
    "timeline": {
      "dateSubmitted": "2025-08-11"
    }
  },
  "pageSize": "Letter",
  "orderType": "Sales Order"
}
```

order (object): Order details to include in the PDF.

pageSize (string, optional): PDF page size (default "Letter").

orderType (string, optional): Document title (default "Sales Order").
