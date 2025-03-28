const puppeteer = require('puppeteer');
const path = require('path');

async function generateSampleDoc() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set viewport to letter size (8.5" x 11" at 96 DPI)
  await page.setViewport({
    width: 816, // 8.5 inches * 96 DPI
    height: 1056, // 11 inches * 96 DPI
    deviceScaleFactor: 1
  });

  // Create a simple HTML template for the SAFE note
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 48px;
            line-height: 1.6;
          }
          h1 {
            text-align: center;
            margin-bottom: 32px;
          }
          .signature-line {
            margin-top: 48px;
            border-top: 1px solid #000;
            padding-top: 8px;
            width: 250px;
          }
          .signature-label {
            font-size: 12px;
            color: #666;
          }
          .date-line {
            margin-top: 24px;
            border-top: 1px solid #000;
            padding-top: 8px;
            width: 150px;
          }
          .initial-line {
            margin-top: 24px;
            border-top: 1px solid #000;
            padding-top: 8px;
            width: 100px;
          }
        </style>
      </head>
      <body>
        <h1>SAFE (Simple Agreement for Future Equity)</h1>
        
        <p>THIS CERTIFIES THAT in exchange for the payment by [Investor Name] (the "Investor") of $[Investment Amount] (the "Purchase Amount") on or about [Date], [Company Name], a Delaware corporation (the "Company"), hereby issues to the Investor the right to certain shares of the Company's capital stock, subject to the terms set forth below.</p>

        <h2>1. Events</h2>
        
        <p>(a) Equity Financing. If there is an Equity Financing before the termination of this SAFE, the Company will automatically issue to the Investor a number of shares of Safe Preferred Stock equal to the Purchase Amount divided by the Conversion Price.</p>

        <p>(b) Liquidity Event. If there is a Liquidity Event before the termination of this SAFE, the Investor will, at their option, either (i) receive a cash payment equal to the Purchase Amount or (ii) automatically receive from the Company a number of shares of Common Stock equal to the Purchase Amount divided by the Liquidity Price.</p>

        <div style="margin-top: 64px;">
          <div style="float: left; width: 45%;">
            <div class="signature-line">INVESTOR SIGNATURE</div>
            <div class="initial-line">INVESTOR INITIALS</div>
            <div class="date-line">DATE</div>
          </div>
          
          <div style="float: right; width: 45%;">
            <div class="signature-line">COMPANY SIGNATURE</div>
            <div class="initial-line">COMPANY INITIALS</div>
            <div class="date-line">DATE</div>
          </div>
        </div>
      </body>
    </html>
  `;

  // Write the HTML to a file
  await page.setContent(html);

  // Wait for content to load
  await page.evaluate(() => new Promise(resolve => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', resolve);
    }
  }));

  // Take a screenshot
  await page.screenshot({
    path: path.join(__dirname, '../public/sample-safe-note.png'),
    fullPage: true
  });

  await browser.close();
}

generateSampleDoc().catch(console.error); 