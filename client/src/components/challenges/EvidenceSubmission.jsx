import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle2,
  Send,
  Camera,
  FileCheck,
} from 'lucide-react';
import { challengesAPI } from '../../services/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

const EvidenceSubmission = ({ challenge, onSubmissionSuccess, onCancel }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const validateAndSelectFile = (selectedFile) => {
    setError(null);

    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, or WebP photo.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`Image exceeds 5 MB limit (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB). Please choose a smaller photo.`);
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Please select an evidence photograph.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('Please provide a brief description (at least 10 characters) explaining your activity.');
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Upload Image
      const formData = new FormData();
      formData.append('evidenceImage', file);

      const uploadRes = await challengesAPI.uploadEvidence(formData);
      if (!uploadRes.data?.success || !uploadRes.data?.imageUrl) {
        throw new Error(uploadRes.data?.message || 'Failed to upload photo evidence.');
      }

      const uploadedImageUrl = uploadRes.data.imageUrl;

      // Step 2: Submit Challenge Record
      const submitRes = await challengesAPI.submit(challenge._id, {
        challengeId: challenge._id,
        imageUrl: uploadedImageUrl,
        description: description.trim(),
      });

      if (submitRes.data?.success) {
        if (onSubmissionSuccess) {
          onSubmissionSuccess(submitRes.data.submission);
        }
      } else {
        throw new Error(submitRes.data?.message || 'Failed to record evidence submission.');
      }
    } catch (err) {
      console.error('Evidence submission error:', err);
      setError(err.response?.data?.message || err.message || 'Error uploading evidence. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Image Upload Box / Preview */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
          Evidence Photograph <span className="text-emerald-700">*</span>
        </label>

        {!previewUrl ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-3xl p-8 text-center cursor-pointer bg-emerald-50/40 hover:bg-emerald-50/70 transition-all group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto mb-3 group-hover:scale-105 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-800">
              Click to select or drag and drop a photo
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports JPEG, PNG, and WebP (up to 5 MB)
            </p>
          </div>
        ) : (
          <div className="relative rounded-3xl overflow-hidden border border-emerald-200 bg-gray-900 shadow-md group">
            <img
              src={previewUrl}
              alt="Evidence preview"
              className="w-full h-56 sm:h-64 object-contain bg-black/40"
            />
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold backdrop-blur-sm flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5" />
                Valid Photo Selected
              </span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                title="Change image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Description Textarea */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5 flex items-center justify-between">
          <span>Activity Description <span className="text-emerald-700">*</span></span>
          <span className="text-[11px] text-gray-400 font-normal">
            {description.length} / 1000 characters
          </span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Briefly describe what you did, when, and where on campus this photo was captured..."
          className="w-full p-3.5 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all text-xs sm:text-sm text-gray-800 resize-none"
          required
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isUploading}
            className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isUploading || !file || description.trim().length < 10}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Uploading & Submitting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit for Verification</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default EvidenceSubmission;
