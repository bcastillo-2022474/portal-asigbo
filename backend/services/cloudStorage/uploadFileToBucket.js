import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import fs from 'fs';
import config from 'config';

const awsBucketAccess = config.get('awsBucketAccess');
const awsBucketSecret = config.get('awsBucketSecret');
const bucketName = config.get('bucketName');

const client = new S3Client({
  region: 'us-west-1',
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
