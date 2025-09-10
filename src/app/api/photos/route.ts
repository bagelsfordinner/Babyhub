import { NextRequest, NextResponse } from 'next/server';

interface Photo {
  id: string;
  url: string;
  title: string;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
  width: number;
  height: number;
}

// Mock photo data - in a real app this would come from a database
let photos: Photo[] = [
  {
    id: '1',
    url: '/api/placeholder/400/600',
    title: 'Pregnancy Announcement',
    uploadedBy: 'Mom',
    uploadedAt: '2024-01-15T10:00:00Z',
    tags: ['pregnancy'],
    width: 400,
    height: 600,
  },
  {
    id: '2',
    url: '/api/placeholder/600/400',
    title: 'Baby Bump Progress - 20 Weeks',
    uploadedBy: 'Dad',
    uploadedAt: '2024-03-20T14:30:00Z',
    tags: ['pregnancy'],
    width: 600,
    height: 400,
  },
  {
    id: '3',
    url: '/api/placeholder/500/500',
    title: 'First Day Home',
    uploadedBy: 'Mom',
    uploadedAt: '2024-08-01T08:00:00Z',
    tags: ['newborn'],
    width: 500,
    height: 500,
  },
  {
    id: '4',
    url: '/api/placeholder/400/600',
    title: 'One Month Milestone',
    uploadedBy: 'Dad',
    uploadedAt: '2024-09-01T16:45:00Z',
    tags: ['1-month'],
    width: 400,
    height: 600,
  },
  {
    id: '5',
    url: '/api/placeholder/600/400',
    title: 'Two Month Check-up',
    uploadedBy: 'Mom',
    uploadedAt: '2024-10-01T12:30:00Z',
    tags: ['2-month'],
    width: 600,
    height: 400,
  },
  {
    id: '6',
    url: '/api/placeholder/500/700',
    title: 'Baby Bump at 30 Weeks',
    uploadedBy: 'Dad',
    uploadedAt: '2024-05-15T18:20:00Z',
    tags: ['pregnancy'],
    width: 500,
    height: 700,
  },
];

export async function GET() {
  // Sort by upload date, newest first
  const sortedPhotos = [...photos].sort((a, b) => 
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
  
  return NextResponse.json(sortedPhotos);
}

export async function POST(request: NextRequest) {
  try {
    const { title, tags, uploadedBy } = await request.json();
    
    // In a real app, you would:
    // 1. Verify authentication and permissions
    // 2. Handle file upload to storage service
    // 3. Save metadata to database
    // 4. Return the created photo data
    
    const newPhoto: Photo = {
      id: `photo-${Date.now()}-${Math.random()}`,
      url: `/api/placeholder/400/400`, // This would be the actual uploaded image URL
      title: title || 'Untitled Photo',
      uploadedBy: uploadedBy || 'Unknown',
      uploadedAt: new Date().toISOString(),
      tags: tags || [],
      width: 400,
      height: 400,
    };
    
    photos.unshift(newPhoto); // Add to beginning of array
    
    return NextResponse.json(newPhoto);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { photoId, tags } = await request.json();
    
    const photoIndex = photos.findIndex(photo => photo.id === photoId);
    if (photoIndex === -1) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }
    
    photos[photoIndex] = {
      ...photos[photoIndex],
      tags: tags || photos[photoIndex].tags,
    };
    
    return NextResponse.json(photos[photoIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}