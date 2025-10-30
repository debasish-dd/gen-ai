'use client';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

export default function FileDropzone({ onFiles }) {
  const onDrop = useCallback((acceptedFiles) => {
    onFiles(acceptedFiles);
  }, [onFiles]);

  const onDropRejected = useCallback((fileRejections) => {
    if (fileRejections.length === 0) return;

    fileRejections.forEach(({ errors }) => {
      errors.forEach(error => {
        if (error.code === "too-many-files")
          toast.error("You can only upload one file at a time.");
        if (error.code === "file-too-large")
          toast.error("File size exceeds the 2MB limit.");
      });
    });
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
      className={`bg-transparent h-80 w-110 m-5 text-center items-center flex justify-center shadow-xl rounded border-2 border-dashed ${isDragActive? 'border-cyan-700 border-solid bg-orange-400 ': 'hover:border-cyan-400'} sm:ml-15 `}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className='text-center m-2'>Drop the files here ...</p>
      ) : (
        <div>
          <p className='text-center m-2'>Drag 'n' drop some files here, or click to select files</p>
          <button className='bg-blue-600 font-semibold p-2 rounded-lg cursor-pointer m-3'>
            Select File
          </button>
        </div>
      )}
    </div>
  );
}
