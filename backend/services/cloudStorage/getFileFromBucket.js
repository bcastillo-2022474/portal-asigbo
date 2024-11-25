import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
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

const getFileFromBucket = async (key) => {
  const params = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  const response = await client.send(params);
  return response.Body.transformToByteArray();
};

export default getFileFromBucket;
