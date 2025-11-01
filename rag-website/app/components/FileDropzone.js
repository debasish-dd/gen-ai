'use client';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

export default function FileDropzone({ onFiles }) {
  const onDrop = useCallback((acceptedFiles) => {
    console.log('📥 Files dropped:', acceptedFiles);
    
    if (acceptedFiles.length > 0) {  // ✅ FIXED THIS LINE
      onFiles(acceptedFiles);
      toast.success('File uploaded successfully.', { position: "top-center" });
    }
  }, [onFiles]);

  const onDropRejected = useCallback((fileRejections) => {
    if (fileRejections.length === 0) return;

    const errorTypes = new Set();
  
    fileRejections.forEach(({ errors }) => {
      errors.forEach(error => {
        errorTypes.add(error.code);
      });
    });
    
    if (errorTypes.has("too-many-files")) {
      toast.error("You can only upload one file at a time.", { position: "top-center" });
    } else if (errorTypes.has("file-too-large")) {
      toast.error("File size exceeds the 2MB limit.", { position: "top-center" });
    } else if (errorTypes.has("file-invalid-type")) {
      toast.error("Invalid file type. Only PDF, CSV, PPT, and DOC files are allowed.", { position: "top-center" });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    maxFiles: 1,
    maxSize: 2 * 1024 * 1024,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`bg-transparent h-80 w-110 m-5 text-center items-center flex justify-center shadow-xl rounded border-2 border-dashed ${isDragActive ? 'border-cyan-700 border-solid bg-orange-400' : 'hover:border-cyan-400'} sm:ml-15 cursor-pointer`}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className='text-center m-2'>Drop the files here ...</p>
      ) : (
        <div>
          <p>Drag & drop a file here, or click to select</p>
          <p className="text-sm text-gray-500 mt-2">
            Supported: PDF, DOCX, DOC, CSV, PPT, PPTX
          </p>
        </div>
      )}
    </div>
  );
}