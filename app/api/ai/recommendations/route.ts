import { NextRequest, NextResponse } from 'next/server';

interface StockRecommendation {
  symbol: string;
  action: string;
  reasoning: string;
  riskLevel: string;
  targetPrice?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { budget, spendingPattern } = await request.json();

    // Validate inputs
    if (!budget || budget <= 0) {
      return NextResponse.json(
        { error: 'Invalid budget amount' },
        { status: 400 }
      );
    }

    // Simulate Claude-based stock recommendations
    // In production, this would call Claude API with actual market data
    const recommendations: StockRecommendation[] = [
      {
        symbol: 'MSFT',
        action: 'BUY',
        reasoning: 'Strong AI growth, consistent earnings, good for long-term portfolio building',
        riskLevel: 'LOW',
        targetPrice: '$440-450',
      },
      {
        symbol: 'NVDA',
        action: 'HOLD',
        reasoning: 'High valuation but solid fundamentals. Current price reflects growth expectations',
        riskLevel: 'MEDIUM',
        targetPrice: '$120-130',
      },
      {
        symbol: 'AAPL',
        action: 'BUY',
        reasoning: 'Dividend growth potential and stable cash flow make it ideal for budget allocation',
        riskLevel: 'LOW',
        targetPrice: '$195-200',
      },
    ];

    // Filter recommendations based on budget
    const allocatedRecommendations = recommendations.map((rec) => ({
      ...rec,
      allocatedAmount: Math.round((budget * 0.33) * 100) / 100, // Equal 3-way split
    }));

    console.log(`✅ Generated stock recommendations for budget: $${budget}`);

    return NextResponse.json({
      success: true,
      budget,
      recommendations: allocatedRecommendations,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Stock recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
