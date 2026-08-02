/**
 * Tray'd AI Features - Chat & Analysis API
 * @description AI-powered portfolio analysis, market insights, and chat support
 */

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// ============================================================
// TYPES
// ============================================================

interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface AnalysisRequest {
  type: 'portfolio' | 'market' | 'risk' | 'sentiment';
  data: Record<string, unknown>;
}

// ============================================================
// HELPERS
// ============================================================

/** Initialize ZAI SDK */
function getZAI(): ZAI {
  return new ZAI();
}

/** System prompts for different analysis types */
const SYSTEM_PROMPTS: Record<string, string> = {
  portfolio: `You are Tray'd AI, an expert cryptocurrency and forex trading assistant. You provide professional, data-driven insights about trading portfolios. Always include risk disclaimers that your analysis is informational only and not financial advice. Format responses in clear markdown with proper headings.`,

  market: `You are Tray'd AI Market Analyst. Provide concise, actionable market insights for cryptocurrency and forex traders. Include technical indicators context when relevant. Always remind users that markets are unpredictable and past performance doesn't guarantee future results.`,

  risk: `You are Tray'd AI Risk Assessment Specialist. Analyze trading positions and portfolios for potential risks. Provide concrete metrics like position sizing recommendations, stop-loss levels, and correlation warnings. Never give specific buy/sell advice.`,

  sentiment: `You are Tray'd AI Sentiment Analyzer. Analyze market sentiment from multiple angles including on-chain data, social media trends, and institutional flows. Present balanced views showing both bullish and bearish cases.`,
  
  general: `You are Tray'd AI, an intelligent assistant for the Tray'd professional trading platform. Help users with questions about:
- Cryptocurrency and forex trading concepts
- Technical analysis (trends, support/resistance, indicators)
- Risk management strategies
- Platform features and how to use them
- General market education

Always be helpful, accurate, and remind users that you're providing educational information, not financial advice. Keep responses concise but thorough.`,
};

// ============================================================
// AI CHAT ENDPOINT
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, model = 'default', systemPrompt } = body as {
      messages: AIChatMessage[];
      model?: string;
      systemPrompt?: string;
    };

    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_INPUT', message: 'Messages array is required' } },
        { status: 400 }
      );
    }

    // Get last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_USER_MESSAGE', message: 'At least one user message is required' } },
        { status: 400 }
      );
    }

    // Initialize ZAI
    const zai = getZAI();

    // Build conversation for AI
    const systemContent = systemPrompt || SYSTEM_PROMPTS.general;
    
    const chatMessages = [
      { role: 'system' as const, content: systemContent },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    // Call AI
    const completion = await zai.chat.completions.create({
      model: 'deepseek-chat',
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response at this time.';

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        id: `chat_${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        model: 'deepseek-chat',
      },
    });
  } catch (error) {
    console.error('[AI] Chat error:', error);
    
    return NextResponse.json(
      { success: false, error: { code: 'AI_ERROR', message: 'Failed to generate AI response' } },
      { status: 500 }
    );
  }
}

// ============================================================
// ANALYSIS ENDPOINT
// ============================================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body as AnalysisRequest;

    // Validate input
    if (!type || !['portfolio', 'market', 'risk', 'sentiment'].includes(type)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TYPE', message: 'Valid analysis type is required' } },
        { status: 400 }
      );
    }

    // Initialize ZAI
    const zai = getZAI();

    // Build analysis prompt based on type
    let analysisPrompt = '';
    
    switch (type) {
      case 'portfolio':
        analysisPrompt = `Analyze this trading portfolio and provide comprehensive insights:

Portfolio Data:
${JSON.stringify(data, null, 2)}

Please provide:
1. **Executive Summary** - Overall portfolio health assessment
2. **Asset Allocation Analysis** - Diversification score and recommendations
3. **Risk Assessment** - Key risks with severity ratings (Low/Medium/High)
4. **Performance Metrics** - Interpretation of key statistics
5. **Actionable Recommendations** - Specific suggestions to improve the portfolio
6. **Risk Disclaimer** - Standard trading risk warning

Format as structured markdown with emojis for visual appeal.`;
        break;

      case 'market':
        analysisPrompt = `Provide a market analysis based on this data:

Market Data:
${JSON.stringify(data, null, 2)}

Please analyze:
1. **Market Overview** - Current state summary
2. **Technical Analysis** - Key levels and patterns
3. **Sentiment Indicators** - Bull/bear signals
4. **Key Levels to Watch** - Support, resistance, breakout zones
5. **What to Watch For** - Upcoming catalysts or events
6. **Risk Factors** - Potential market movers

Keep it concise but informative. Use markdown formatting.`;
        break;

      case 'risk':
        analysisPrompt = `Perform a risk assessment for this trading scenario:

Position/Portfolio Data:
${JSON.stringify(data, null, 2)}

Please evaluate:
1. **Overall Risk Score** (0-100 scale)
2. **Position Sizing Analysis** - Is the size appropriate?
3. **Leverage Risk** - Margin safety evaluation
4. **Concentration Risk** - Over-exposure warnings
5. **Stop-Loss Recommendations** - Optimal placement levels
6. **Correlation Risks** - Cross-position dependencies
7. **Black Swan Scenarios** - Tail risk considerations
8. **Risk Management Checklist** - Action items

Be specific with numbers where possible. Use color-coded risk levels.`;
        break;

      case 'sentiment':
        analysisPrompt = `Analyze market sentiment based on available data:

Sentiment Data:
${JSON.stringify(data, null, 2)}

Provide:
1. **Overall Sentiment Score** (Bullish/Bearish/Neutral)
2. **Key Sentiment Drivers** - What's moving the market
3. **Social Signals** - Community and retail sentiment
4. **Institutional Flows** - Smart money movements
5. **On-Chain Indicators** (if crypto) - Holder behavior
6. **Contrarian Signals** - Any crowd extremes?
7. **Outlook Summary** - Balanced view with scenarios

Present both bull and bear cases objectively.`;
        break;
    }

    // Call AI for analysis
    const completion = await zai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { 
          role: 'system', 
          content: SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.general 
        },
        { 
          role: 'user', 
          content: analysisPrompt 
        },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });

    const analysisResult = completion.choices[0]?.message?.content || 'Analysis unavailable at this time.';

    // Return structured analysis response
    return NextResponse.json({
      success: true,
      data: {
        id: `analysis_${Date.now()}`,
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Analysis`,
        summary: analysisResult.slice(0, 500) + '...',
        fullAnalysis: analysisResult,
        confidence: 0.75, // Simulated confidence score
        timestamp: new Date().toISOString(),
        disclaimer: 'This analysis is generated by AI for informational purposes only. It does not constitute financial advice. Always do your own research before making trading decisions.',
      },
    });
  } catch (error) {
    console.error('[AI] Analysis error:', error);
    
    return NextResponse.json(
      { success: false, error: { code: 'ANALYSIS_ERROR', message: 'Failed to generate analysis' } },
      { status: 500 }
    );
  }
}
