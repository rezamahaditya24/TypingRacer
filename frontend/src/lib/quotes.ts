export interface Quote {
  id: string;
  text: string;
  source: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: 'id' | 'en';
}

export const PRACTICE_QUOTES: Quote[] = [
  {id:"id-e-1",text:"Belajar tanpa berpikir itu sia-sia.",source:"Confucius",difficulty:"easy",language:"id"},
  {id:"id-e-2",text:"Hidup bukan tentang menemukan dirimu, tapi tentang menciptakan dirimu.",source:"George Bernard Shaw",difficulty:"easy",language:"id"},
  {id:"id-e-3",text:"Berpikirlah positif, maka hidupmu akan positif.",source:"Anonim",difficulty:"easy",language:"id"},
  {id:"id-e-4",text:"Siapa yang bersabar pasti beruntung.",source:"Peribahasa",difficulty:"easy",language:"id"},
  {id:"id-e-5",text:"Kesempatan tidak datang dua kali.",source:"Peribahasa",difficulty:"easy",language:"id"},
  {id:"id-e-6",text:"Sedikit demi sedikit lama-lama menjadi bukit.",source:"Peribahasa",difficulty:"easy",language:"id"},
  {id:"id-e-7",text:"Di mana ada kemauan, di situ ada jalan.",source:"Peribahasa",difficulty:"easy",language:"id"},
  {id:"id-e-8",text:"Habis manis sepah dibuang.",source:"Peribahasa",difficulty:"easy",language:"id"},
  {id:"id-e-9",text:"Bersatu kita teguh, bercerai kita runtuh.",source:"Peribahasa",difficulty:"easy",language:"id"},
  {id:"id-e-10",text:"Tak kenal maka tak sayang.",source:"Peribahasa",difficulty:"easy",language:"id"},
  {id:"en-e-1",text:"The quick brown fox jumps over the lazy dog.",source:"Pangram",difficulty:"easy",language:"en"},
  {id:"en-e-2",text:"A journey of a thousand miles begins with a single step.",source:"Lao Tzu",difficulty:"easy",language:"en"},
  {id:"en-e-3",text:"To be or not to be, that is the question.",source:"Shakespeare",difficulty:"easy",language:"en"},
  {id:"en-e-4",text:"Knowledge is power.",source:"Francis Bacon",difficulty:"easy",language:"en"},
  {id:"en-e-5",text:"Practice makes perfect.",source:"Proverb",difficulty:"easy",language:"en"},
  {id:"id-m-1",text:"Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia.",source:"Nelson Mandela",difficulty:"medium",language:"id"},
  {id:"id-m-2",text:"Kita tidak bisa menjadi apa yang kita inginkan jika kita selalu menjadi apa yang kita sekarang.",source:"Anonim",difficulty:"medium",language:"id"},
  {id:"id-m-3",text:"Jangan menyerah, karena hari ini adalah hari esok yang kamu khawatirkan kemarin.",source:"Anonim",difficulty:"medium",language:"id"},
  {id:"id-m-4",text:"Orang sukses adalah mereka yang bisa bangkit setelah terjatuh berkali-kali.",source:"Anonim",difficulty:"medium",language:"id"},
  {id:"id-m-5",text:"Bermimpilah setinggi langit, jika engkau jatuh engkau akan jatuh di antara bintang-bintang.",source:"Ir. Soekarno",difficulty:"medium",language:"id"},
  {id:"en-m-1",text:"In the middle of difficulty lies opportunity. The greatest glory in living lies not in never falling, but in rising every time we fall.",source:"Albert Einstein",difficulty:"medium",language:"en"},
  {id:"en-m-2",text:"The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",source:"Steve Jobs",difficulty:"medium",language:"en"},
  {id:"en-m-3",text:"Life is what happens when you are busy making other plans. The future belongs to those who believe in the beauty of their dreams.",source:"Eleanor Roosevelt",difficulty:"medium",language:"en"},
  {id:"en-m-4",text:"Success is not final, failure is not fatal. It is the courage to continue that counts.",source:"Winston Churchill",difficulty:"medium",language:"en"},
  {id:"en-m-5",text:"The best time to plant a tree was twenty years ago. The second best time is now.",source:"Chinese Proverb",difficulty:"medium",language:"en"},
  {id:"en-m-6",text:"Imagination is more important than knowledge. For knowledge is limited, whereas imagination embraces the entire world.",source:"Albert Einstein",difficulty:"medium",language:"en"},
  {id:"en-m-7",text:"Code is like humor. When you have to explain it, it is bad.",source:"Cory House",difficulty:"medium",language:"en"},
  {id:"id-h-1",text:"Janganlah kamu bersedih, sesungguhnya Allah bersama kita. Allah tidak akan membebani seseorang melainkan sesuai dengan kesanggupannya.",source:"Al-Quran",difficulty:"hard",language:"id"},
  {id:"id-h-2",text:"Menulislah karena menulis adalah terapi jiwa. Dengan menulis kita bisa menuangkan segala isi hati dan pikiran tanpa dibatasi ruang dan waktu.",source:"Anonim",difficulty:"hard",language:"id"},
  {id:"id-h-3",text:"Generasi yang hebat adalah generasi yang bisa membaca tanda zaman dan mempersiapkan diri menghadapi tantangan masa depan dengan penuh keyakinan dan keberanian.",source:"Anonim",difficulty:"hard",language:"id"},
  {id:"en-h-1",text:"The dinosaurs roamed the earth for millions of years before their sudden extinction. In the lush jungles of the prehistoric world, these magnificent creatures ruled with power and grace.",source:"Dino Dash",difficulty:"hard",language:"en"},
  {id:"en-h-2",text:"Once upon a time in a land before time, three little dinosaurs set out on a grand adventure to discover who was the fastest runner in all the land. Friendship and determination matter more than winning.",source:"Dino Dash",difficulty:"hard",language:"en"},
  {id:"en-h-3",text:"Your time is limited, so do not waste it living someone else's life. Have the courage to follow your heart and intuition. They somehow already know what you truly want to become.",source:"Steve Jobs",difficulty:"hard",language:"en"},
  {id:"en-h-4",text:"The first rule of any technology used in a business is that automation applied to an efficient operation will magnify the efficiency. The second rule is that automation applied to an inefficient operation will magnify the inefficiency.",source:"Bill Gates",difficulty:"hard",language:"en"},
  {id:"en-h-5",text:"Python is an experiment in how much freedom programmers need. Too much freedom and nobody can read another's code; too little and expressiveness is endangered.",source:"Guido van Rossum",difficulty:"hard",language:"en"},
];

export function getRandomQuote(): Quote {
  return PRACTICE_QUOTES[Math.floor(Math.random() * PRACTICE_QUOTES.length)];
}

export function getRandomQuoteByLanguage(lang: 'id' | 'en'): Quote {
  const filtered = PRACTICE_QUOTES.filter(q => q.language === lang);
  const pool = filtered.length > 0 ? filtered : PRACTICE_QUOTES;
  return pool[Math.floor(Math.random() * pool.length)];
}

const MOTIVATIONAL_QUOTES: { id: string; idn: string; en: string }[] = [
  { id: 'q1', idn: 'Setiap kata yang kau ketik adalah langkah menuju kecepatan', en: 'Every word you type is a step toward speed' },
  { id: 'q2', idn: 'Jangan pernah menyerah, jari-jarimu masih bisa lebih cepat', en: 'Never give up, your fingers can still go faster' },
  { id: 'q3', idn: 'Hidup adalah tentang belajar dari setiap kesalahan', en: 'Life is about learning from every mistake' },
  { id: 'q4', idn: 'Latihan membuat sempurna, teruslah mengetik', en: 'Practice makes perfect, keep typing' },
  { id: 'q5', idn: 'Cepat atau lambat, yang penting konsisten', en: 'Fast or slow, consistency is key' },
  { id: 'q6', idn: 'Jangan bandingkan dirimu dengan orang lain, bandingkan dengan dirimu kemarin', en: 'Compare yourself to who you were yesterday, not others' },
  { id: 'q7', idn: 'Setiap juara dulunya adalah pemula yang tidak pernah berhenti', en: 'Every champion was once a beginner who never stopped' },
  { id: 'q8', idn: 'Fokus pada proses, hasil akan mengikuti', en: 'Focus on the process, results will follow' },
];

export function getMotivationalQuote(lang: 'id' | 'en'): string {
  const q = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  return lang === 'id' ? q.idn : q.en;
}
