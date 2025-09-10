'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Camera, 
  Upload, 
  Calendar, 
  Grid3x3, 
  Tag, 
  X,
  Download,
  Filter
} from 'lucide-react';
import { PageTransition } from '@/components/molecules/PageTransition';
import { ForestLoader } from '@/components/atoms/ForestLoader';
import styles from './gallery.module.css';

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

interface Tag {
  id: string;
  name: string;
  color: string;
  category: 'pregnancy' | 'milestone' | 'general';
}

const defaultTags: Tag[] = [
  { id: 'pregnancy', name: 'Pregnancy', color: 'var(--berry-pop)', category: 'pregnancy' },
  { id: 'newborn', name: 'Newborn', color: 'var(--sage)', category: 'milestone' },
  { id: '1-month', name: '1 Month', color: 'var(--fern)', category: 'milestone' },
  { id: '2-month', name: '2 Months', color: 'var(--moss)', category: 'milestone' },
  { id: '3-month', name: '3 Months', color: 'var(--pine)', category: 'milestone' },
  { id: '4-month', name: '4 Months', color: 'var(--mushcap)', category: 'milestone' },
  { id: '5-month', name: '5 Months', color: 'var(--toadstool)', category: 'milestone' },
  { id: '6-month', name: '6 Months', color: 'var(--acorn)', category: 'milestone' },
  { id: '7-month', name: '7 Months', color: 'var(--success)', category: 'milestone' },
  { id: '8-month', name: '8 Months', color: 'var(--warning)', category: 'milestone' },
  { id: '9-month', name: '9 Months', color: 'var(--info)', category: 'milestone' },
  { id: '10-month', name: '10 Months', color: 'var(--primary)', category: 'milestone' },
  { id: '11-month', name: '11 Months', color: 'var(--secondary)', category: 'milestone' },
  { id: '12-month', name: '1 Year', color: 'var(--berry-pop)', category: 'milestone' },
];

// Mock data for development
const mockPhotos: Photo[] = [
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
    title: 'Baby Bump Progress',
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
];

type ViewMode = 'grid' | 'timeline';

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [tags, setTags] = useState<Tag[]>(defaultTags);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(true); // Mock admin status
  const [isFamily, setIsFamily] = useState(true); // Mock family status
  const [editingPhotoTags, setEditingPhotoTags] = useState<string | null>(null);

  // Load photos from API
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const response = await fetch('/api/photos');
        if (response.ok) {
          const photosData = await response.json();
          setPhotos(photosData);
        }
      } catch (error) {
        console.error('Failed to load photos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, []);

  const filteredPhotos = photos.filter(photo => {
    if (selectedTags.length === 0) return true;
    return selectedTags.some(tag => photo.tags.includes(tag));
  });

  const toggleTagFilter = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const selectAllPhotos = () => {
    setSelectedPhotos(filteredPhotos.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedPhotos([]);
  };

  const downloadPhoto = (photo: Photo) => {
    // In a real app, this would trigger actual download
    console.log(`Downloading photo: ${photo.title}`);
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `${photo.title.replace(/\s+/g, '_')}.jpg`;
    link.click();
  };

  const downloadSelectedPhotos = () => {
    const selectedPhotoData = photos.filter(p => selectedPhotos.includes(p.id));
    console.log(`Downloading ${selectedPhotoData.length} photos`);
    
    // In a real app, this would create a zip file
    selectedPhotoData.forEach((photo, index) => {
      setTimeout(() => downloadPhoto(photo), index * 200);
    });
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        console.log(`Uploading: ${file.name}`);
        
        // In a real app, you'd upload the file to storage first
        // For now, we'll just create a mock photo entry
        const response = await fetch('/api/photos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: file.name.replace(/\.[^/.]+$/, ""),
            uploadedBy: isAdmin ? 'Admin' : 'Family',
            tags: [],
          }),
        });
        
        if (response.ok) {
          const newPhoto = await response.json();
          setPhotos(prev => [newPhoto, ...prev]);
        }
        
        // Small delay for UI feedback
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setShowUploadModal(false);
    }
  };

  const updatePhotoTags = async (photoId: string, newTags: string[]) => {
    try {
      const response = await fetch('/api/photos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoId, tags: newTags }),
      });
      
      if (response.ok) {
        const updatedPhoto = await response.json();
        setPhotos(prev => prev.map(photo => 
          photo.id === photoId ? updatedPhoto : photo
        ));
        setEditingPhotoTags(null);
      }
    } catch (error) {
      console.error('Failed to update photo tags:', error);
    }
  };

  const togglePhotoTag = (photoId: string, tagId: string) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;
    
    const newTags = photo.tags.includes(tagId)
      ? photo.tags.filter(t => t !== tagId)
      : [...photo.tags, tagId];
    
    updatePhotoTags(photoId, newTags);
  };

  const getTagById = (tagId: string) => tags.find(tag => tag.id === tagId);

  const groupPhotosByTimeline = () => {
    const grouped = filteredPhotos.reduce((acc, photo) => {
      const date = new Date(photo.uploadedAt);
      const monthYear = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(photo);
      return acc;
    }, {} as Record<string, Photo[]>);

    return Object.entries(grouped).sort((a, b) => new Date(b[1][0].uploadedAt).getTime() - new Date(a[1][0].uploadedAt).getTime());
  };

  return (
    <div className={styles.galleryPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div className={styles.titleSection}>
            <h1>Photo Gallery</h1>
            <p>Capturing every precious moment of our journey together</p>
          </div>
          
          {(isAdmin || isFamily) && (
            <button
              onClick={() => setShowUploadModal(true)}
              className={`${styles.uploadButton} button-jelly button-primary`}
            >
              <span>📸</span>
              Upload Photos
            </button>
          )}
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          {/* Tag filters */}
          <div className={styles.tagFilters}>
            <h3>Filter by Milestone</h3>
            <div className={styles.tagGrid}>
              {tags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTagFilter(tag.id)}
                  className={`${styles.tagChip} ${selectedTags.includes(tag.id) ? styles.active : ''}`}
                  style={{ '--tag-color': tag.color } as React.CSSProperties}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* View controls */}
          <div className={styles.viewControls}>
            <div className={styles.viewModeToggle}>
              <button
                onClick={() => setViewMode('grid')}
                className={`${styles.viewModeButton} ${viewMode === 'grid' ? styles.active : ''}`}
              >
                <span>🔳</span>
                Grid
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`${styles.viewModeButton} ${viewMode === 'timeline' ? styles.active : ''}`}
              >
                <span>📅</span>
                Timeline
              </button>
            </div>

            {/* Selection controls */}
            <div className={styles.selectionControls}>
              {selectedPhotos.length > 0 && (
                <>
                  <span className={styles.selectionCount}>
                    {selectedPhotos.length} selected
                  </span>
                  <button
                    onClick={downloadSelectedPhotos}
                    className={`${styles.downloadButton} button-jelly button-success`}
                  >
                    <span>📥</span>
                    Download Selected
                  </button>
                  <button
                    onClick={clearSelection}
                    className={`${styles.clearButton} button-jelly button-ghost`}
                  >
                    Clear
                  </button>
                </>
              )}
              {selectedPhotos.length === 0 && filteredPhotos.length > 0 && (
                <button
                  onClick={selectAllPhotos}
                  className={`${styles.selectAllButton} button-jelly button-secondary`}
                >
                  Select All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Photo Grid/Timeline */}
        <div className={styles.photoContent}>
          {loading ? (
            <div className={styles.loadingGrid}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.photoSkeleton}></div>
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className={styles.photoGrid}>
              {filteredPhotos.map(photo => (
                <div
                  key={photo.id}
                  className={`${styles.photoCard} ${selectedPhotos.includes(photo.id) ? styles.selected : ''}`}
                >
                  <div className={styles.photoImageWrapper}>
                    <Image
                      src={photo.url}
                      alt={photo.title}
                      width={photo.width}
                      height={photo.height}
                      className={styles.photoImage}
                    />
                    <div className={styles.photoOverlay}>
                      <button
                        onClick={() => togglePhotoSelection(photo.id)}
                        className={styles.selectButton}
                      >
                        {selectedPhotos.includes(photo.id) ? '✓' : '○'}
                      </button>
                      <button
                        onClick={() => downloadPhoto(photo)}
                        className={styles.downloadSingleButton}
                      >
                        📥
                      </button>
                      {(isAdmin || isFamily) && (
                        <button
                          onClick={() => setEditingPhotoTags(photo.id)}
                          className={styles.editTagsButton}
                        >
                          🏷️
                        </button>
                      )}
                    </div>
                  </div>
                  <div className={styles.photoInfo}>
                    <h4>{photo.title}</h4>
                    <p className={styles.photoMeta}>
                      By {photo.uploadedBy} • {new Date(photo.uploadedAt).toLocaleDateString()}
                    </p>
                    <div className={styles.photoTags}>
                      {photo.tags.map(tagId => {
                        const tag = getTagById(tagId);
                        return tag ? (
                          <span
                            key={tagId}
                            className={styles.photoTag}
                            style={{ '--tag-color': tag.color } as React.CSSProperties}
                          >
                            {tag.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.timeline}>
              {groupPhotosByTimeline().map(([monthYear, monthPhotos]) => (
                <div key={monthYear} className={styles.timelineSection}>
                  <div className={styles.timelineHeader}>
                    <h3>{monthYear}</h3>
                    <span className={styles.photoCount}>{monthPhotos.length} photos</span>
                  </div>
                  <div className={styles.timelinePhotos}>
                    {monthPhotos.map(photo => (
                      <div
                        key={photo.id}
                        className={`${styles.timelinePhoto} ${selectedPhotos.includes(photo.id) ? styles.selected : ''}`}
                      >
                        <div className={styles.photoImageWrapper}>
                          <Image
                            src={photo.url}
                            alt={photo.title}
                            width={photo.width}
                            height={photo.height}
                            className={styles.photoImage}
                          />
                          <div className={styles.photoOverlay}>
                            <button
                              onClick={() => togglePhotoSelection(photo.id)}
                              className={styles.selectButton}
                            >
                              {selectedPhotos.includes(photo.id) ? '✓' : '○'}
                            </button>
                            <button
                              onClick={() => downloadPhoto(photo)}
                              className={styles.downloadSingleButton}
                            >
                              📥
                            </button>
                            {(isAdmin || isFamily) && (
                              <button
                                onClick={() => setEditingPhotoTags(photo.id)}
                                className={styles.editTagsButton}
                              >
                                🏷️
                              </button>
                            )}
                          </div>
                        </div>
                        <div className={styles.timelinePhotoInfo}>
                          <h5>{photo.title}</h5>
                          <div className={styles.photoTags}>
                            {photo.tags.map(tagId => {
                              const tag = getTagById(tagId);
                              return tag ? (
                                <span
                                  key={tagId}
                                  className={styles.photoTag}
                                  style={{ '--tag-color': tag.color } as React.CSSProperties}
                                >
                                  {tag.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredPhotos.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📷</div>
              <h3>No photos found</h3>
              <p>
                {selectedTags.length > 0 
                  ? 'Try adjusting your filter tags or upload some photos!'
                  : 'Upload your first photos to get started!'
                }
              </p>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className={styles.modalOverlay} onClick={() => setShowUploadModal(false)}>
            <div className={styles.uploadModal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Upload Photos</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className={styles.closeButton}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalContent}>
                <div
                  className={styles.dropZone}
                  onDrop={(e) => {
                    e.preventDefault();
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                      handleFileUpload(files);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className={styles.dropZoneContent}>
                    <span className={styles.dropZoneIcon}>📸</span>
                    <p>Drag & drop photos here, or click to select</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFileUpload(e.target.files);
                        }
                      }}
                      className={styles.fileInput}
                    />
                  </div>
                </div>
                {isUploading && (
                  <div className={styles.uploadProgress}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill}></div>
                    </div>
                    <p>Uploading photos...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tag Editor Modal */}
        {editingPhotoTags && (
          <div className={styles.modalOverlay} onClick={() => setEditingPhotoTags(null)}>
            <div className={styles.tagEditorModal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Edit Tags</h3>
                <button
                  onClick={() => setEditingPhotoTags(null)}
                  className={styles.closeButton}
                >
                  ✕
                </button>
              </div>
              <div className={styles.modalContent}>
                <div className={styles.tagEditor}>
                  {tags.map(tag => {
                    const photo = photos.find(p => p.id === editingPhotoTags);
                    const isSelected = photo?.tags.includes(tag.id) || false;
                    
                    return (
                      <button
                        key={tag.id}
                        onClick={() => togglePhotoTag(editingPhotoTags, tag.id)}
                        className={`${styles.tagEditorChip} ${isSelected ? styles.selected : ''}`}
                        style={{ '--tag-color': tag.color } as React.CSSProperties}
                      >
                        {tag.name}
                        {isSelected && <span className={styles.checkmark}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}