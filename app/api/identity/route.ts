import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { scenario } = await request.json();

    if (!scenario || typeof scenario !== 'string') {
      return Response.json({ error: 'Scenario text is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      try {
        const llmRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 400,
            system: `You are an advanced AI Identity Orchestrator embedded inside a privacy-first digital identity platform.
Your role is to manage, validate, and intelligently process user identity data in a secure, decentralized, and privacy-preserving manner while ensuring compliance with real-world systems such as KYC, financial onboarding, healthcare access, and digital services.

The platform provides:
- Self-sovereign identity wallet
- W3C DID compliant identity framework
- Verifiable credentials
- Zero-Knowledge Proof (ZKP) based authentication

Rules:
- NEVER store raw personal data unless explicitly required
- ALWAYS prefer verifiable credentials over raw inputs
- ALWAYS suggest ZKP-based verification when possible
- ALWAYS check for existing credentials before requesting new KYC

Respond ONLY with valid JSON (no markdown, no preamble) using this structure:
{
  "requestType": "string",
  "dataRequired": "string",
  "verificationMethod": "string",
  "riskLevel": "Low" | "Medium" | "High",
  "suggestedAction": "string",
  "privacyImpactSummary": "string"
}`,
            messages: [{ role: 'user', content: scenario }],
          }),
        });

        if (llmRes.ok) {
          const llmData = await llmRes.json();
          const content = llmData.content?.[0]?.text;
          if (content) {
            return Response.json(JSON.parse(content));
          }
        }
      } catch (error) {
        console.error('LLM error:', error);
        // Fall through to fallback
      }
    }

    // Fallback response if API key is missing or fails
    return Response.json({
      requestType: "General Identity Verification",
      dataRequired: "Minimal demographic data (e.g., Year of Birth)",
      verificationMethod: "Zero-Knowledge Proof (ZKP)",
      riskLevel: "Low",
      suggestedAction: "Check existing wallet for verifiable credentials. Request ZKP proof instead of raw ID scan.",
      privacyImpactSummary: "Zero raw data exposure. Verification computed client-side."
    });
  } catch (err) {
    return Response.json({ error: 'Verification failed' }, { status: 500 });
  }
}
