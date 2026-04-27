export async function GET() {
  try {
    const priceRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd,inr&include_24hr_change=true',
      { cache: 'no-store' }
    );
    const trendingRes = await fetch(
      'https://api.coingecko.com/api/v3/search/trending',
      { cache: 'no-store' }
    );

    if (!priceRes.ok || !trendingRes.ok) {
      return Response.json(
        { error: 'Could not load crypto market data right now' },
        { status: 502 }
      );
    }

    const prices = await priceRes.json();
    const trending = await trendingRes.json();

    const btcChange = Number(prices?.bitcoin?.usd_24h_change || 0);
    const ethChange = Number(prices?.ethereum?.usd_24h_change || 0);
    const solChange = Number(prices?.solana?.usd_24h_change || 0);
    const averageChange = (btcChange + ethChange + solChange) / 3;

    let recommendation =
      'Market momentum is neutral. Consider SIP-style small buys and keep majority in safer assets.';
    if (averageChange > 2) {
      recommendation =
        'Momentum is positive in majors. Consider staggered entries, not lump-sum buying.';
    } else if (averageChange < -2) {
      recommendation =
        'Market is weak in the last 24h. Preserve cash and avoid overexposure until volatility cools.';
    }

    return Response.json({
      prices,
      trending:
        trending?.coins?.slice(0, 5).map((item: any) => ({
          name: item.item?.name,
          symbol: item.item?.symbol,
          market_cap_rank: item.item?.market_cap_rank,
        })) || [],
      signal: {
        averageChange: Number(averageChange.toFixed(2)),
        recommendation,
      },
    });
  } catch {
    return Response.json(
      { error: 'Could not load crypto market data right now' },
      { status: 500 }
    );
  }
}
