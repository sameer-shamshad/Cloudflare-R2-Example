import { Request, Response } from 'express';
import { r2Client } from '../config/r2Client';
import { R2_BUCKET, BUCKET_PUBLIC_URL } from '../config/env.config';
import { generateUniqueId, generateUniqueFileName } from '../utils/file.utils';

export const uploadFile = async (req: Request, res: Response) => {
  try {
    // const user = req.user;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!R2_BUCKET) {
      return res.status(500).json({ message: 'Bucket configuration is missing' });
    }

    let fileKey = req.file.originalname;

    try { // Check if file exists
      await r2Client.headObject({
        Bucket: R2_BUCKET,
        Key: fileKey,
      }).promise();
      
      const uniqueId = await generateUniqueId(); // File exists, generate unique name with 4-digit ID
      fileKey = await generateUniqueFileName(req.file.originalname, uniqueId);
    } catch (error: any) { // File doesn't exist (404) or other error
      if (error.code !== 'NotFound') {
        console.error('Error checking file existence:', error);
        return res.status(500).json({ message: 'Failed to check file existence' });
      }
    }

    // File doesn't exist, proceed with original name
    await r2Client.putObject({ // Upload file
      Bucket: R2_BUCKET,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }).promise();

    const fileUrl = `${BUCKET_PUBLIC_URL}/${fileKey}`;

    return res.status(200).json({ 
      message: 'File uploaded successfully',
      fileKey,
      fileUrl,
      fileName: req.file.originalname,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    
    if (error.code === 'UriParameterError') {
      return res.status(500).json({ message: 'Invalid bucket configuration' });
    }
    
    return res.status(500).json({ message: 'Failed to upload file' });
  }
};

export const getFile = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({ message: 'File name is required' });
    }

    if (!R2_BUCKET) {
      return res.status(500).json({ message: 'Bucket configuration is missing' });
    }

    const object = await r2Client.getObject({
      Bucket: R2_BUCKET,
      Key: name,
    }).promise();

    // Set appropriate headers
    res.setHeader('Content-Type', object.ContentType || 'application/octet-stream');
    if (object.ContentLength) {
      res.setHeader('Content-Length', object.ContentLength);
    }

    return res.status(200).send(object.Body);
  } catch (error: any) {
    console.error('Get file error:', error);
    
    if (error.code === 'NoSuchKey' || error.code === 'NotFound') {
      return res.status(404).json({ message: 'File not found' });
    }
    
    if (error.code === 'UriParameterError') {
      return res.status(500).json({ message: 'Invalid bucket configuration' });
    }
    
    return res.status(500).json({ message: 'Failed to get file' });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({ message: 'File name is required' });
    }

    if (!R2_BUCKET) {
      return res.status(500).json({ message: 'Bucket configuration is missing' });
    }

    try { // Check if file exists before deleting
      await r2Client.headObject({
        Bucket: R2_BUCKET,
        Key: name,
      }).promise();
    } catch (error: any) {
      if (error.code === 'NoSuchKey' || error.code === 'NotFound') {
        return res.status(404).json({ message: 'File not found' });
      }
      throw error;
    }

    await r2Client.deleteObject({
      Bucket: R2_BUCKET,
      Key: name,
    }).promise();

    return res.status(200).json({ message: 'File deleted successfully' });
  } catch (error: any) {
    console.error('Delete file error:', error);
    
    if (error.code === 'UriParameterError') {
      return res.status(500).json({ message: 'Invalid bucket configuration' });
    }
    
    return res.status(500).json({ message: 'Failed to delete file' });
  }
};
