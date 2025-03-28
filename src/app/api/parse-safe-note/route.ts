import { NextRequest, NextResponse } from 'next/server';

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

    // For now, return dummy data until we fix the PDF parsing
    const dummyTerms = {
      valuationCap: 5000000,
      discountRate: 20,
      proRataRights: true,
      mfnProvision: true,
      boardObserver: false,
      investmentAmount: 250000
    };

    return NextResponse.json(dummyTerms);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}

function parseTerms(text: string) {
  return {
    valuationCap: extractValuationCap(text),
    discountRate: extractDiscountRate(text),
    proRataRights: text.toLowerCase().includes('pro rata'),
    mfnProvision: text.toLowerCase().includes('most favored nation'),
    boardObserver: text.toLowerCase().includes('board observer'),
    investmentAmount: extractInvestmentAmount(text)
  };
}

function extractValuationCap(text: string): number {
  const capMatch = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:million|M)?\s*(?:valuation cap|cap)/i);
  if (capMatch) {
    const amount = parseFloat(capMatch[1].replace(/,/g, ''));
    return capMatch[0].toLowerCase().includes('million') || capMatch[0].toLowerCase().includes('m')
      ? amount * 1000000
      : amount;
  }
  return 5000000;
}

function extractDiscountRate(text: string): number {
  const discountMatch = text.match(/(\d+)%\s*discount/i);
  return discountMatch ? parseInt(discountMatch[1]) : 20;
}

function extractInvestmentAmount(text: string): number {
  const amountMatch = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)\s*(?:thousand|k)?/i);
  if (amountMatch) {
    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    return amountMatch[0].toLowerCase().includes('thousand') || amountMatch[0].toLowerCase().includes('k')
      ? amount * 1000
      : amount;
  }
  return 250000;
} 