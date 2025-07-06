import React, { useState } from 'react';
import { Upload, X, FileText, FileImage, File } from 'lucide-react';
import { FileAttachment } from '../types';

interface FileUploadProps {
  documents: FileAttachment[];
  onDocumentsChange: (documents: FileAttachment[]) => void;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  documents, 
  onDocumentsChange, 
  label = "Anexos" 
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newDocument: FileAttachment = {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          size: file.size,
          url: e.target?.result as string,
          uploadedAt: new Date().toISOString()
        };
        onDocumentsChange([...documents, newDocument]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeDocument = (id: string) => {
    onDocumentsChange(documents.filter(doc => doc.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <FileImage className="h-4 w-4" />;
    } else if (type.includes('pdf')) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {/* Área de Upload */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
        />
        <div className="space-y-2">
          <Upload className="h-8 w-8 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-600">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="text-xs text-gray-500">
            PDF, DOC, DOCX, TXT, JPG, PNG, GIF (máx. 10MB cada)
          </p>
        </div>
      </div>

      {/* Lista de Documentos */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Documentos anexados:</h4>
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(doc.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {doc.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(doc.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(doc.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remover documento"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 