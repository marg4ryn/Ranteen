/**
 * Universal file upload service for handling file uploads to the backend
 */
class FileUploadService {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Upload a file to the server
   * @param {File} file - The file to upload
   * @param {string} uploadType - Type of upload (e.g., 'dish-image', 'user-avatar', etc.)
   * @param {object} options - Additional options for the upload
   * @returns {Promise<Object>} Upload response with file URL and metadata
   */
  async uploadFile(file, uploadType = 'general', options = {}) {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', uploadType);
    
    // Add any additional options to the form data
    Object.keys(options).forEach(key => {
      formData.append(key, options[key]);
    });

    try {
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Upload failed';
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Delete a file from the server
   * @param {string} fileUrl - URL or path of the file to delete
   * @returns {Promise<Object>} Deletion response
   */
  async deleteFile(fileUrl) {
    if (!fileUrl) {
      throw new Error('No file URL provided for deletion');
    }

    try {
      const response = await fetch(`${this.baseUrl}/upload/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'File deletion failed';
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('File deletion error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   * @param {File[]} files - Array of files to upload
   * @param {string} uploadType - Type of upload
   * @param {object} options - Additional options
   * @returns {Promise<Object[]>} Array of upload responses
   */
  async uploadMultipleFiles(files, uploadType = 'general', options = {}) {
    if (!files || files.length === 0) {
      throw new Error('No files provided for upload');
    }

    const uploadPromises = files.map(file => 
      this.uploadFile(file, uploadType, options)
    );

    try {
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Multiple file upload error:', error);
      throw error;
    }
  }

  /**
   * Get upload progress (for future implementation with progress tracking)
   * @param {File} file - The file being uploaded
   * @param {string} uploadType - Type of upload
   * @param {Function} onProgress - Progress callback function
   * @returns {Promise<Object>} Upload response
   */
  async uploadFileWithProgress(file, uploadType = 'general', onProgress) {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', uploadType);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress && xhr.upload) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.message || 'Upload failed'));
          } catch (error) {
            reject(new Error('Upload failed'));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.open('POST', `${this.baseUrl}/upload`);
      xhr.withCredentials = true; // Include cookies
      xhr.send(formData);
    });
  }

  /**
   * Validate file before upload
   * @param {File} file - File to validate
   * @param {object} constraints - Validation constraints
   * @returns {object} Validation result
   */
  validateFile(file, constraints = {}) {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes = ['image/*'],
      maxWidth = null,
      maxHeight = null
    } = constraints;

    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds limit of ${(maxSize / (1024 * 1024)).toFixed(1)}MB`);
    }

    // Check file type
    const isValidType = allowedTypes.some(type => {
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return file.type.startsWith(baseType);
      }
      return file.type === type;
    });

    if (!isValidType) {
      errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

const fileUploadService = new FileUploadService();
export default fileUploadService;
