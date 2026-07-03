import { supabase } from "../lib/supabase";

/**
 * Uploads a file to a Supabase Storage bucket and returns the public URL.
 * @param {string} bucket - The name of the bucket (e.g. 'covers', 'pdfs', 'avatars')
 * @param {string} folder - Folder prefix inside the bucket (e.g. 'covers', 'pdfs', 'profiles')
 * @param {File} file - The file object to upload
 * @returns {Promise<string>} The public URL of the uploaded file
 */
export const uploadFile = async (bucket, folder, file) => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.");
  }
  
  if (!file) throw new Error("No file selected for upload.");

  // Generate a unique path to avoid collisions
  const fileExtension = file.name.split(".").pop();
  const cleanName = file.name.split(".").slice(0, -1).join(".").replace(/[^a-zA-Z0-9]/g, "_");
  const uniqueName = `${Date.now()}_${Math.floor(Math.random() * 10000)}_${cleanName}.${fileExtension}`;
  const path = folder ? `${folder}/${uniqueName}` : uniqueName;

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    console.error("Supabase Storage upload error details:", error);
    throw new Error(error.message || "Failed to upload file to Supabase Storage.");
  }

  // Retrieve public url
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  
  if (!urlData || !urlData.publicUrl) {
    throw new Error("Failed to generate public URL for uploaded file.");
  }

  return urlData.publicUrl;
};
