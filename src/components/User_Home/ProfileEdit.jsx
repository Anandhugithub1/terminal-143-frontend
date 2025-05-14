import React from 'react';
import { ChevronRight } from 'lucide-react';

export  function EditableField({ icon: Icon, label, value, onEdit }) {
  return (
    <div
      onClick={onEdit}
      className="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition cursor-pointer"
    >
      <div className="flex items-center space-x-3">
        <Icon size={20} className="text-gray-700" />
        <span className="text-gray-700 font-medium">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-gray-500">{value}</span>
        <ChevronRight size={20} className="text-gray-400" />
      </div>
    </div>
  );
}




export  function UploadOptions({ onCamera, onGallery, onCancel }) {
  return (
    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-2xl shadow-lg z-10 w-52">
      <h3 className="text-center font-semibold mb-2">Upload Photo</h3>
      <button onClick={onCamera} className="w-full py-2 mb-2 bg-gray-100 rounded-lg hover:bg-gray-200">
        Use Camera
      </button>
      <button onClick={onGallery} className="w-full py-2 mb-2 bg-gray-100 rounded-lg hover:bg-gray-200">
        Choose from Gallery
      </button>
      <button onClick={onCancel} className="w-full py-2 bg-red-100 rounded-lg hover:bg-red-200">
        Cancel
      </button>
    </div>
  );
}
