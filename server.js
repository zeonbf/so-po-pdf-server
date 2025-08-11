const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.post("/generate-pdf", async (req, res) => {
  const { order, pageSize = "Letter", orderType = "Sales Order" } = req.body;

  console.log("req hit: \n", req.body);

  let html = generateHTML(order || {}, orderType);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: pageSize,
    printBackground: true,
  });

  await browser.close();

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${order?.id}.pdf"`,
  });
  console.log("Success...");

  res.send(pdfBuffer);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

function generateHTML(order, orderType) {
  // Helper to format a product row
  const productRows = order?.products
    ?.map(
      (prod) => `
      <tr>
        <td style="border:1px solid #000; padding:8px; text-align:left; font-size:12px;">${
          prod?.productName
        }</td>
        <td style="border:1px solid #000; padding:8px; text-align:left; font-size:12px;">${
          prod?.description || ""
        }</td>
        <td style="border:1px solid #000; padding:8px; text-align:center; font-size:12px;">${
          prod?.netQuantity
        }</td>
        <td style="border:1px solid #000; padding:8px; text-align:center; font-size:12px;">${
          prod?.unit
        }</td>
        <td style="border:1px solid #000; padding:8px; text-align:right; font-size:12px;">${prod?.myPrice?.toFixed(
          2
        )}</td>
        <td style="border:1px solid #000; padding:8px; text-align:right; font-size:12px;">${(
          prod?.myPrice * prod?.netQuantity
        )?.toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Sales Order</title>
    <style>
        body {
            margin: 0px;
            background: white;
        }
        @page {
            margin: 32px;
        }

      body {
        font-family: Arial, sans-serif;
        margin: 20px;
        color: #000;
      }
      .page {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: 32px;
        box-sizing: border-box;
        background: white;
      }
      /* Hide the .page inside preview container by default */
      #pdf-preview .page {
        border: none;
        box-shadow: none;
      }
      #pdf-preview {
        margin-top: 20px;
        border: 1px solid #ddd;
        padding: 8px;
        max-width: 800px;
        max-height: 600px;
        overflow: auto;
      }
      button {
        margin-top: 20px;
        padding: 10px 20px;
        font-size: 16px;
      }
      /* Tables styling */
      table {
        border-collapse: collapse;
      }
      .items-table th,
      .items-table td {
        border: 1px solid #000;
        padding: 8px;
        font-size: 12px;
      }
      .items-table th {
        background-color: #f2f2f2;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div id="pdf-content" class="page">

      <div
        class="header"
        style="
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        "
      >
        <div class="company-info">
          <h1 style="font-size: 18px; margin: 0">${
            order?.companyDetails?.companyName
          }</h1>
          <p style="margin: 0; font-size: 12px">
          ${order?.companyDetails?.branch}<br />
          ${order?.companyDetails?.address}<br />  
            ${order?.companyDetails?.city || ""}${
    order?.companyDetails?.city ? ", " : ""
  }${order?.companyDetails?.state || ""} ${order?.companyDetails?.zip || ""}
          </p>
        </div>
        <div
          class="sales-order-box"
          style="padding: 5px; width: 250px; text-align: center"
        >
          <h2 style="margin: 0px; font-size: 24px">${orderType}</h2>
          <table class="items-table" style="width: 100%; margin-top: 8px">
            <thead>
              <tr>
                <th style="width: 50%;">Date</th>
                <th style="width: 50%;">${
                  order?.orderType === "Sales Order" ? "S.O. No." : "Order No."
                }</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: center;">${
                  order?.timeline?.dateSubmitted
                }</td>
                <td style="text-align: center;">${order?.id}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        class="customer-info-section"
        style="
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          position: relative;
          gap: 8px;
        "
      >
        <div
          class="customer-info-box"
          style="border: 1px solid #000; padding: 10px; margin: 4px; width: 46%"
        >
          <h3 style="font-size: 14px; margin: 0; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
            Name / Address
          </h3>
          <p style="margin: 2px 0; font-size: 12px;">${
            order?.customerDetails?.name
          }</p>
          <p style="margin: 2px 0; font-size: 12px;">${
            order?.customerDetails?.branch
          }</p>
          <p style="margin: 2px 0; font-size: 12px;">${
            order?.customerDetails?.address ||
            order?.customerDetails?.street ||
            ""
          }</p>
          <p style="margin: 2px 0; font-size: 12px;">${
            order?.customerDetails?.city || ""
          }${order?.customerDetails?.city ? ", " : ""}${
    order?.customerDetails?.state || ""
  } ${order?.customerDetails?.zip || ""}</p>
          <p style="margin: 2px 0; font-size: 12px;">${
            order?.customerDetails?.country || ""
          }</p>
          <p style="margin: 2px 0; font-size: 12px;">Phone: ${
            order?.customerDetails?.phone
          }</p>
        </div>


        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999; pointer-events: none; white-space: pre-line; text-align: center;">
            <div style="transform: rotate(-30deg); font-size: 54px; color: rgba(0, 0, 0, 0.05); font-weight: bold; line-height: 1;">
                INVOICED<br />IN FULL
            </div>
        </div>




        <div
          class="customer-info-box"
          style="border: 1px solid #000; padding: 10px; margin: 4px; width: 46%"
        >
          <h3 style="font-size: 14px; margin: 0; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 5px;">
            Additional Info
          </h3>
          <!-- Add more info here if needed -->
        </div>
      </div>

      <table
        class="po-rep-project-table"
        style="
          width: 60%;
          border-collapse: collapse;
          margin-top: 20px;
          margin-left: auto;
          border: 1px solid #000;
        "
      >
        <thead>
          <tr>
            <th style="width: 30%; padding: 8px; border: 1px solid #000; text-align: center;">P.O. No.</th>
            <th style="width: 30%; padding: 8px; border: 1px solid #000; text-align: center;">Rep</th>
            <th style="width: 30%; padding: 8px; border: 1px solid #000; text-align: center;">Project</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px; border: 1px solid #000; text-align: center;">${
              order?.purchaseOrderNo || "--"
            }</td>
            <td style="padding: 8px; border: 1px solid #000; text-align: center;">${
              order?.rep || "--"
            }</td>
            <td style="padding: 8px; border: 1px solid #000; text-align: center;">${
              order?.projectName || "--"
            }</td>
          </tr>
        </tbody>
      </table>

      <div class="table-container" style="margin-top: 20px;">
        <table class="items-table" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="width: 20%;">Item</th>
              <th style="width: 35%;">Description</th>
              <th style="width: 5%;">Ordered</th>
              <th style="width: 5%;">U/M</th>
              <th style="width: 15%;">Rate</th>
              <th style="width: 20%;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}

            <tr>
                <td colspan="3" style="">
                   
                </td>
                <td colspan="3" style="text-align: right; font-weight: bold;font-size:20px; padding: 8px 4px;">
                    Total: $${order?.totalAmount?.toFixed(2)}
                </td>
            </tr>

          </tbody>
        </table>
      </div>

     

    </div>
  </body>
</html>
`;
}
