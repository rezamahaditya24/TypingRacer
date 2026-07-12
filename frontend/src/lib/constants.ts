import { DinoType } from './types';

export const DINO_LIST: { type: DinoType; label: string; color: string }[] = [
  { type: 't-rex', label: 'T-Rex', color: '#f97316' },
  { type: 'triceratops', label: 'Triceratops', color: '#22d3ee' },
  { type: 'raptor', label: 'Raptor', color: '#4ade80' },
  { type: 'stegosaurus', label: 'Stegosaurus', color: '#fbbf24' },
  { type: 'brontosaurus', label: 'Brontosaurus', color: '#a78bfa' },
];

export const DINO_COLORS: Record<DinoType, string> = {
  't-rex': '#f97316',
  'triceratops': '#22d3ee',
  'raptor': '#4ade80',
  'stegosaurus': '#fbbf24',
  'brontosaurus': '#a78bfa',
};

export function randomName(): string {
  const a = ['Cepat', 'Garang', 'Lincah', 'Hebat', 'Tangguh', 'Galak', 'Pintar', 'Besar', 'Kecil', 'Mungil'];
  const n = ['Dino', 'Rex', 'Saurus', 'Raptor', 'Tops', 'Don', 'Pede', 'Kong', 'Rexy', 'Saur'];
  return `${a[Math.floor(Math.random() * a.length)]}${n[Math.floor(Math.random() * n.length)]}`;
}
