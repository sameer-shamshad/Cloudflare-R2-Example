import { Request, Response } from 'express';
import { r2Client } from '../config/r2Client';
import { R2_BUCKET, BUCKET_PUBLIC_URL } from '../config/env.config';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

export const uploadFile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized - User authentication required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!R2_BUCKET) {
      return res.status(500).json({ message: 'Bucket configuration is missing' });
    }

    const userId = req.user.id;
    const timestamp = Date.now();
    const originalName = req.file.originalname;
    
    // Format: filename-userId-Date.now()
    const fileKey = `${originalName}-${userId}-${timestamp}`;

    await r2Client.putObject({
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
