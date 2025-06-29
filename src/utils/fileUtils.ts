import { FileAttachment } from '../types';

export const createFileAttachment = (file: File): FileAttachment => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: file.name,
  type: file.type,
  size: file.size,
  url: URL.createObjectURL(file),
  uploadedAt: new Date().toISOString()
});

export const convertFilesToAttachments = (files: File[]): FileAttachment[] => {
  return files.map(createFileAttachment);
}; 