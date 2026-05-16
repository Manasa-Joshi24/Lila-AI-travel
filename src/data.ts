import { Destination, Emotion } from './types';

export const emotions: Emotion[] = [
  { type: 'Peaceful', label: 'Peaceful', description: 'Quiet corners of the earth', color: '#B5EAD7' },
  { type: 'Aventurous', label: 'Adventurous', description: 'Push your boundaries', color: '#FF9AA2' },
  { type: 'Romantic', label: 'Romantic', description: 'Moments shared together', color: '#FFB7B2' },
  { type: 'Solitary', label: 'Solitary', description: 'Rediscover your inner self', color: '#E2F0CB' },
  { type: 'Spiritual', label: 'Spiritual', description: 'Ancient paths and wisdom', color: '#C7CEEA' },
];

export const destinations: Destination[] = [
  {
    id: '1',
    name: 'Lago di Braies',
    location: 'Prags, Italy',
    emotion: 'Peaceful',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop',
    description: 'Emerald waters reflecting the Dolomite peaks. A place where time stands still.',
    rating: 4.9,
    tags: ['Mountain', 'Lake', 'Serene'],
  },
  {
    id: '2',
    name: 'Karijini Red Gorges',
    location: 'Western Australia',
    emotion: 'Aventurous',
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2074&auto=format&fit=crop',
    description: 'Ancient subterranean landscapes carved by water over billions of years.',
    rating: 4.8,
    tags: ['Hiking', 'Gorge', 'Outback'],
  },
  {
    id: '3',
    name: 'Oia Sunsets',
    location: 'Santorini, Greece',
    emotion: 'Romantic',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2021&auto=format&fit=crop',
    description: 'Whitewashed houses cascading down cliffs towards the Aegean Sea.',
    rating: 4.9,
    tags: ['Island', 'Sunset', 'Iconic'],
  },
  {
    id: '4',
    name: 'Kyoto Zen Gardens',
    location: 'Kyoto, Japan',
    emotion: 'Spiritual',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop',
    description: 'The art of dry landscape. Meditative spaces designed for reflection.',
    rating: 5.0,
    tags: ['Temple', 'Garden', 'Zen'],
  },
  {
    id: '5',
    name: 'Finnish Lapland',
    location: 'Rovaniemi, Finland',
    emotion: 'Solitary',
    imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?q=80&w=2070&auto=format&fit=crop',
    description: 'Infinite white horizons and the dance of the Aurora Borealis.',
    rating: 4.7,
    tags: ['Snow', 'Aurora', 'Arctic'],
  }
];
