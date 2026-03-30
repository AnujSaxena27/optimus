/**
 * Chat API Route
 * Hugging Face Model Inference Endpoint
 * POST /api/chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { huggingFaceService } from '@/lib/services/huggingface';
import { modelRoutingService } from '@/lib/services/routing';
import { withAuth, unauthorizedResponse } from '@/lib/middleware/auth';
import { generateRequestId } from '@/lib/utils/helpers';
import { isValidModel, DEFAULT_MODEL, ModelCategory } from '@/config/models';

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    // 1. Authentication
    const auth = await withAuth(req);
    if (!auth.isValid || !auth.payload) {
      return unauthorizedResponse();
    }

    const userId = auth.payload.sub;
    console.log(`[${requestId}] Chat request from user: ${userId}`);

    // 2. Parse Request
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const {
      message,
      model,
      category,
      temperature = 0.7,
      maxTokens = 1024,
    } = body;

    // 3. Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required and must be non-empty' },
        { status: 400 }
      );
    }

    // 4. Route to best model
    const routing = modelRoutingService.route({
      message,
      requestedModel: model,
      category: category as ModelCategory | undefined,
    });

    console.log(
      `[${requestId}] Routing: ${routing.reason} -> "${routing.selectedModel}"`
    );

    // 5. Call Hugging Face API
    let reply: string;
    try {
      reply = await huggingFaceService.chatCompletion(
        routing.selectedModel,
        message,
        { temperature, maxTokens },
        requestId
      );
    } catch (error: any) {
      console.error(`[${requestId}] HF API error:`, error.message);
      return NextResponse.json(
        { error: error.message || 'Failed to get response from model' },
        { status: 500 }
      );
    }

    // 6. Prepare response
    const processingTime = Date.now() - startTime;
    const response = {
      id: requestId,
      userId,
      model: routing.selectedModel,
      category: routing.category,
      reply,
      processingTimeMs: processingTime,
      timestamp: new Date().toISOString(),
    };

    console.log(`[${requestId}] Completed in ${processingTime}ms`);

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error(`[${requestId}] Unexpected error:`, error.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
