import { DinoType } from './types';

export const DINO_LIST: { type: DinoType; emoji: string; label: string }[] = [
  { type: 't-rex', emoji: '🦖', label: 'T-Rex' },
  { type: 'triceratops', emoji: '🦕', label: 'Triceratops' },
  { type: 'raptor', emoji: '🦖', label: 'Raptor' },
  { type: 'stegosaurus', emoji: '🦕', label: 'Stegosaurus' },
  { type: 'brontosaurus', emoji: '🦕', label: 'Brontosaurus' },
];

export const DINO_COLORS: Record<DinoType, string> = {
  't-rex': '#FB923C',
  'triceratops': '#2DD4BF',
  'raptor': '#A3E635',
  'stegosaurus': '#F87171',
  'brontosaurus': '#A78BFA',
};

export const CAR_EMOJIS = ['🦖', '🦕', '🚗', '🚙', '🏎️', '🚕', '🚌', '🛻'];

export function randomName(): string {
  const a = ['Cepat', 'Garang', 'Lincah', 'Hebat', 'Tangguh', 'Galak', 'Pintar'];
  const n = ['Dino', 'Rex', 'Saurus', 'Raptor', 'Tops', 'Don'];
  return `${a[Math.floor(Math.random() * a.length)]}${n[Math.floor(Math.random() * n.length)]}`;
}
