import { useRef, useState } from 'react';
import { apiFetch } from '../../api';

const BulkUpload = ({ endpoint, onComplete, onResult, label = "Bulk Upload" }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert("Please upload a CSV file.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    console.log(`Frontend: Uploading to ${endpoint}`, file.name);

    try {
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: formData
      });
      console.log("Frontend: Upload Response", res);
      alert(res.msg || "Upload successful!");
      if (onResult) onResult(res);
      if (onComplete) onComplete();
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bulk-upload-wrapper">
      <input 
        type="file" 
        accept=".csv" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange}
      />
      <button 
        className="btn-secondary" 
        onClick={() => fileInputRef.current.click()}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : label}
      </button>
    </div>
  );
};

export default BulkUpload;
