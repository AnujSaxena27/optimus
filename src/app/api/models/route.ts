/**
 * Models API Route
 * Returns available models organized by category
 * GET /api/models
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCategoriesList } from '@/config/models';

export async function GET(req: NextRequest) {
  try {
    const categories = getCategoriesList();

    return NextResponse.json(
      {
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          defaultModel: cat.defaultModel,
          models: cat.models.map((m) => ({
            id: m.id,
            name: m.name,
            description: m.description,
            category: m.category,
            latencyMs: m.latencyMs,
            maxTokens: m.maxTokens,
            costPerMTok: m.costPerMTok,
            provider: m.provider,
          })),
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
