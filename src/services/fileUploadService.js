import axios from 'axios';

const FILE_UPLOAD_URL = 'https://tmpfiles.org/api/v1/upload';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

class FileUploadService {
  /**
   * Upload a file to tmpfiles.org
   * @param {File} file - The file to upload
   * @returns {Promise<{success: boolean, url: string, message: string}>}
   */
  async uploadFile(file) {
    try {
      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          message: `File size exceeds the maximum allowed size of 100MB`
        };
      }
      
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(FILE_UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // According to the tmpfiles.org API documentation, the response should contain a data object with a url property
      if (response.data && response.data.data && response.data.data.url) {
        // Convert URL to direct download format by adding "/dl/" after "tmpfiles.org"
        const originalUrl = response.data.data.url;
        const downloadUrl = originalUrl.replace(/tmpfiles\.org\/(\d+)\//, 'tmpfiles.org/dl/$1/');
        
        return {
          success: true,
          url: downloadUrl,
          message: 'File uploaded successfully'
        };
      } else {
        console.error('Invalid response format:', response.data);
        return {
          success: false,
          message: 'Invalid response from server'
        };
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload file'
      };
    }
  }
  
  /**
   * Upload multiple files to tmpfiles.org
   * @param {FileList|File[]} files - Array or FileList of files to upload
   * @returns {Promise<{success: boolean, results: Array<{fileName: string, success: boolean, url: string, message: string}>}>}
   */
  async uploadMultipleFiles(files) {
    if (!files || files.length === 0) {
      return {
        success: false,
        results: [],
        message: 'No files provided'
      };
    }
    
    const results = [];
    let successCount = 0;
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await this.uploadFile(file);
      
      results.push({
        fileName: file.name,
        success: result.success,
        url: result.url,
        message: result.message
      });
      
      if (result.success) {
        successCount++;
      }
    }
    
    return {
      success: successCount > 0,
      results,
      message: `Successfully uploaded ${successCount} of ${files.length} files`
    };
  }
}

// Create a singleton instance
const fileUploadService = new FileUploadService();
export default fileUploadService;
