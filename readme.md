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

### Response

- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="{order.id}.pdf"`

The API responds with the generated PDF file of the sales order invoice. The PDF is sent as a binary stream in the HTTP response body.

- The `Content-Type` header specifies that the response is a PDF document.
- The `Content-Disposition` header is set to `attachment` with a filename based on the order's ID, so browsers and clients will treat it as a downloadable file named like `ORD-123456.pdf`.

#### How to Handle the Response

- **In a browser:**  
  The PDF will be downloaded automatically using the filename specified.

- **In a mobile app or programmatic client:**
  - The response body contains the raw PDF binary data.
  - Save this binary data as a `.pdf` file locally, using the filename from the `Content-Disposition` header or based on the order ID you sent in the request.
  - Open or share the saved PDF file as needed.
