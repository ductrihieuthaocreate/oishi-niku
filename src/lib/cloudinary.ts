import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

export async function uploadProductImage(
  fileBuffer: Buffer,
  fileName: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'oishi-niku/products',
          public_id: fileName.replace(/\.[^/.]+$/, ''),
          overwrite: true,
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' },
          ],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error('Upload failed'))
          } else {
            resolve(result.secure_url)
          }
        }
      )
      .end(fileBuffer)
  })
}

export function getOptimizedUrl(url: string, width = 800, height = 800): string {
  if (!url.includes('cloudinary.com')) return url
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`)
}
