import { NextResponse } from 'next/server';

/**
 * GET /api/stats — global study stats
 *
 * TODO: query DB for:
 * - dueToday: cards WHERE due <= NOW()
 * - learning: cards WHERE state = 1 OR state = 3
 * - review: cards WHERE state = 2
 * - mature: cards WHERE stability > 21
 * - streak: consecutive days with at least one review
 */
export async function GET() {
  return NextResponse.json({
    dueToday: 0,
    learning: 0,
    review: 0,
    mature: 0,
    retentionRate: 0,
    streak: 0,
  });
}
