import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const pdfFile = formData.get('pdf') as File;
    
    if (!pdfFile) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    // Read the PDF file
    const pdfBuffer = await pdfFile.arrayBuffer();
    const data = await pdfParse(Buffer.from(pdfBuffer));
    const text = data.text;

    // Extract terms from the text
    const terms = parseTerms(text);

    return NextResponse.json(terms);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to parse PDF' },
      { status: 500 }
    );
  }
}

function parseTerms(text: string) {
  // This is where you'd implement the actual parsing logic
  // For now, we'll return some dummy data
  const terms = {
    valuationCap: extractValuationCap(text),
    discountRate: extractDiscountRate(text),
    proRataRights: text.toLowerCase().includes('pro rata'),
    mfnProvision: text.toLowerCase().includes('most favored nation'),
    boardObserver: text.toLowerCase().includes('board observer'),
    investmentAmount: extractInvestmentAmount(text)
  };

  return terms;
}

function extractValuationCap(text: string): number {
  // Example pattern: "$5,000,000 valuation cap" or "Valuation Cap: $5M"
  const capMatch = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:million|M)?\s*(?:valuation cap|cap)/i);
  if (capMatch) {
    const amount = parseFloat(capMatch[1].replace(/,/g, ''));
    return capMatch[0].toLowerCase().includes('million') || capMatch[0].toLowerCase().includes('m')
      ? amount * 1000000
      : amount;
  }
  return 5000000; // Default value
}

function extractDiscountRate(text: string): number {
  // Example pattern: "20% discount" or "Discount Rate: 20%"
  const discountMatch = text.match(/(\d+)%\s*discount/i);
  return discountMatch ? parseInt(discountMatch[1]) : 20; // Default value
}

function extractInvestmentAmount(text: string): number {
  // Example pattern: "Purchase Amount: $250,000" or "Investment Amount: $250k"
  const amountMatch = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:thousand|k)?/i);
  if (amountMatch) {
    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    return amountMatch[0].toLowerCase().includes('thousand') || amountMatch[0].toLowerCase().includes('k')
      ? amount * 1000
      : amount;
  }
  return 250000; // Default value
} 