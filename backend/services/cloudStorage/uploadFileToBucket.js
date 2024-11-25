import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import config from 'config';

const awsBucketAccess = config.get('awsBucketAccess');
const awsBucketSecret = config.get('awsBucketSecret');
const bucketName = config.get('bucketName');
const isLocalDevelopment = process.NODE_ENV !== 'production';

const client = new S3Client({
  ...(isLocalDevelopment ? {
    endpoint: 'http://localhost:9000', // MINIO
    forcePathStyle: true,
  } : {
    region: 'us-west-1', // Keep your production region
  }),
  credentials: {
    accessKeyId: awsBucketAccess,
    secretAccessKey: awsBucketSecret,
  },
});

const uploadFileToBucket = async (key, filePath, contentType) => {
  const fileBuffer = fs.readFileSync(filePath);

  const params = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    contentType,
  });

  return client.send(params);
};

export default uploadFileToBucket;
