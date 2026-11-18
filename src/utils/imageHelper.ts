export interface EncodedImage {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export async function fileToEncodedImage(file: File): Promise<EncodedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        reject(new Error('Could not read the selected image file.'));
        return;
      }
      resolve({
        mimeType: match[1],
        base64: match[2],
        previewUrl: dataUrl,
      });
    };
    reader.onerror = () => reject(new Error('Failed to load image file.'));
    reader.readAsDataURL(file);
  });
}

export async function urlToEncodedImage(url: string): Promise<EncodedImage> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Could not load sample notebook image.');
  }
  const blob = await response.blob();
  const file = new File([blob], 'sample.jpg', { type: blob.type || 'image/jpeg' });
  return fileToEncodedImage(file);
}
