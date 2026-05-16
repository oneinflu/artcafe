export const slugify = (text) => {
  if (!text) return "";
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

const artFallbacks = [
  "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1518998053901-53f8d369b470?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1577720580479-7d839d829c73?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1547891654-e66ed7ebb965?auto=format&fit=crop&q=80&w=1000"
];

export const resolveImageUrl = (img, id = '') => {
  if (!img || img === "" || img.includes('placeholder')) {
    // Return a deterministic art fallback based on ID
    const index = id ? (id.charCodeAt(0) % artFallbacks.length) : 0;
    return artFallbacks[index];
  }
  if (img.startsWith('http') || img.startsWith('data:') || img.startsWith('/assets')) return img;
  if (img.startsWith('backend/uploads/')) return `http://127.0.0.1:5001/${img.replace('backend/', '')}`;
  if (img.startsWith('uploads/')) return `http://127.0.0.1:5001/${img}`;
  return img;
}
