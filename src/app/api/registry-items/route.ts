import { NextRequest, NextResponse } from 'next/server';

// This would normally come from your database
// For now, we'll use a simple in-memory store
let registryItems = [
  { id: 'burp-cloths', name: 'Burp Cloths', icon: '🍼', current: 3, target: 12, category: 'feeding' },
  { id: 'onesies', name: 'Onesies (0-3m)', icon: '👶', current: 8, target: 15, category: 'clothing' },
  { id: 'diapers-nb', name: 'Newborn Diapers', icon: '👶', current: 2, target: 6, category: 'essentials' },
  { id: 'swaddles', name: 'Swaddle Blankets', icon: '🤱', current: 2, target: 8, category: 'sleep' },
  { id: 'bottles', name: 'Baby Bottles', icon: '🍼', current: 4, target: 8, category: 'feeding' },
  { id: 'bibs', name: 'Bibs', icon: '🥄', current: 6, target: 12, category: 'feeding' },
];

export async function GET() {
  return NextResponse.json(registryItems);
}

export async function PUT(request: NextRequest) {
  try {
    const { itemId, current } = await request.json();
    
    // In a real app, you would:
    // 1. Verify the user is authenticated and has admin permissions
    // 2. Update the database
    // 3. Return the updated data
    
    const itemIndex = registryItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }
    
    registryItems[itemIndex].current = Math.max(0, current);
    
    return NextResponse.json(registryItems[itemIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}