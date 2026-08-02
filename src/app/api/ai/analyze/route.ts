/**
 * Tray'd AI Analysis API Endpoint
 * @description AI-powered market analysis, portfolio insights, and risk assessment
 */

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// ============================================================
// TYPES
// ============================================================

interface AnalysisRequest {
  type: 'portfolio' | 'market' | 'risk' | 'sentiment';
  data: Record<string, unknown>;
}

interface Insight {
  type: 'opportunity' | 'warning' | 'info' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

// ============================================================
// HELPERS
// ============================================================

/** Initialize ZAI SDK */
function getZAI(): ZAI {
  return new ZAI();
}

/** System prompts */
const SYSTEM_PROMPTS: Record<string, string> = {
  portfolio: `You are Tray'd AI Portfolio Analyst. Analyze trading portfolios with professional rigor. Provide actionable insights with clear risk disclaimers. Use markdown formatting with emojis for visual appeal.`,

  market: `You are Tray'd AI Market Analyst. Provide concise, data-driven market insights. Include technical context when relevant. Present balanced bull/bear cases.`,

  risk: `You are Tray'd AI Risk Specialist. Evaluate trading risks objectively. Provide specific metrics and recommendations. Never give direct trading advice.`,

  sentiment: `You are Tray'd AI Sentiment Analyst. Evaluate market sentiment from multiple angles. Present objective analysis with supporting evidence.`,
};

// ============================================================
// ANALYSIS HANDLER
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body as AnalysisRequest;

    // Validate input
    if (!type || !['portfolio', 'market', 'risk', 'sentiment'].includes(type)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TYPE', message: 'Valid analysis type required (portfolio, market, risk, sentiment)' } },
        { status: 400 }
      );
    }

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_DATA', message: 'Analysis data is required' } },
        { status: 400 }
      );
    }

    // Initialize ZAI
    const zai = getZAI();

    // Build prompt based on analysis type
    let userPrompt = '';

    switch (type) {
      case 'portfolio':
        userPrompt = `Analyze this cryptocurrency/forex trading portfolio:

**Portfolio Data:**
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

Provide a comprehensive analysis including:
1. 📊 **Executive Summary** - Overall health score (1-10) and key takeaway
2. 💰 **Asset Allocation** - Diversification assessment with visual breakdown
3. ⚠️ **Risk Analysis** - Key risks with severity ratings
4. 📈 **Performance Review** - Metrics interpretation
5. 💡 **Recommendations** - 3-5 actionable improvement suggestions
6. 🛡️ **Risk Disclaimer** - Standard warning

Format as structured markdown with tables where appropriate.`;
        break;

      case 'market':
        userPrompt = `Provide market analysis for this instrument:

**Market Data:**
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

Include:
1. 🔍 **Market Overview** - Current state summary
2. 📉 **Technical Analysis** - Key levels and patterns
3. 🎯 **Sentiment Signals** - Bull/bear indicators
4. 📍 **Key Levels** - Support/resistance zones
5. 👀 **What to Watch** - Important upcoming factors
6. ⚡ **Risk Factors** - Potential market movers

Be concise but thorough. Use markdown formatting.`;
        break;

      case 'risk':
        userPrompt = `Perform detailed risk assessment:

**Position/Portfolio Data:**
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

Evaluate and provide:
1. 🎯 **Risk Score** (0-100) with category breakdowns
2. 📏 **Position Sizing** - Appropriateness evaluation
3. 🏗️ **Leverage Safety** - Margin level analysis
4. 🔄 **Concentration Risk** - Correlation warnings
5. 🛑️ **Stop-Loss Strategy** - Optimal placement
6. 🌊 **Tail Risks** - Black swan considerations
7. ✅ **Action Checklist** - Risk management items

Use specific numbers. Color-code risk levels (🟢 Low 🟡 Medium 🔴 High).`;
        break;

      case 'sentiment':
        userPrompt = `Analyze market sentiment based on available data:

**Sentiment Data:**
\`\`\`json
${JSON.stringify(data, null, 2)}
\`\`\`

Provide:
1. 🌡️ **Overall Sentiment** - Score (-100 to +100)
2. 📊 **Key Drivers** - What's moving markets
3. 👥 **Retail Activity** - Crowd positioning
4. 🏛️ **Institutional Flows** - Smart money signals
5. 🔗 **On-Chain Data** - Holder behavior (if applicable)
6. 🔄 **Contrarian Signals** - Extremes to watch
7. 🔮 **Scenarios** - Bull/base/bear cases

Present balanced view with evidence.`;
        break;
    }

    // Call ZAI
    const completion = await zai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.portfolio },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 3000,
    });

    const result = completion.choices[0]?.message?.content || 'Analysis unavailable. Please try again.';

    // Generate mock insights based on type
    const insights: Insight[] = generateMockInsights(type, data);

    return NextResponse.json({
      success: true,
      data: {
        id: `analysis_${Date.now()}_${type}`,
        type,
        title: formatAnalysisTitle(type),
        summary: extractSummary(result),
        fullAnalysis: result,
        insights,
        confidence: calculateConfidence(type),
        timestamp: new Date().toISOString(),
        disclaimer: '⚠️ This AI-generated analysis is for informational purposes only and does not constitute financial advice. Always conduct your own research before making trading decisions.',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[AI] Analysis error:', error);
    
    return NextResponse.json(
      { success: false, error: { code: 'ANALYSIS_ERROR', message: 'Failed to generate analysis. Please try again.' } },
      { status: 500 }
    );
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function formatAnalysisTitle(type: string): string {
  const titles: Record<string, string> = {
    portfolio: '📊 Portfolio Analysis',
    market: '📈 Market Analysis',
    risk: '🛡️ Risk Assessment',
    sentiment: '🎯 Market Sentiment',
  };
  return titles[type] || 'AI Analysis';
}

function extractSummary(analysis: string): string {
  // Take first ~300 chars as summary
  if (analysis.length <= 500) return analysis;
  
  // Find first paragraph or section
  const firstNewline = analysis.indexOf('\n');
  if (firstNewline > 200) {
    return analysis.slice(0, firstNewline) + '...';
  }
  
  return analysis.slice(0, 500) + '...';
}

function generateMockInsights(type: string, data: Record<string, unknown>): Insight[] {
  const baseInsights: Record<string, Insight[]> = {
    portfolio: [
      { type: 'info', title: 'Diversification Score', description: 'Your portfolio has moderate diversification across 4 assets.', impact: 'medium' },
      { type: 'recommendation', title: 'Consider Stablecoins', description: 'Adding USDC/USDT could reduce volatility by ~15%.', impact: 'low' },
      { type: 'warning', title: 'BTC Concentration', description: 'BTC represents >50% of portfolio value.', impact: 'high' },
    ],
    market: [
      { type: 'opportunity', title: 'Breakout Setup', description: 'Price approaching key resistance level.', impact: 'medium' },
      { type: 'info', title: 'Volume Increasing', description: '24h volume 23% above average.', impact: 'low' },
      { type: 'warning', title: 'Overbought RSI', description: 'Daily RSI at 72 suggests caution.', impact: 'medium' },
    ],
    risk: [
      { type: 'warning', title: 'High Leverage', description: '25x leverage increases liquidation risk significantly.', impact: 'high' },
      { type: 'recommendation', title: 'Stop-Loss Needed', description: 'Set SL below $62,000 for BTC position.', impact: 'high' },
      { type: 'info', title: 'Margin Health', description: 'Current margin ratio is healthy at 450%.', impact: 'low' },
    ],
    sentiment: [
      { type: 'opportunity', title: 'Bish Sentiment', description: 'Long/Short ratio at 1.8 suggests bullish bias.', impact: 'medium' },
      { type: 'info', title: 'Funding Positive', description: 'Longs paying shorts - slight long bias.', impact: 'low' },
      { type: 'warning', title: 'Greed Alert', description: 'Social sentiment reaching extreme levels.', impact: 'medium' },
    ],
  };

  return baseInsights[type] || baseInsights.portfolio;
}

function calculateConfidence(type: string): number {
  // Simulated confidence scores
  const scores: Record<string, number> = {
    portfolio: 0.82,
    market: 0.75,
    risk: 0.88,
    sentiment: 0.68,
  };
  return scores[type] || 0.75;
}
