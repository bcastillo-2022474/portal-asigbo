module.exports = {
  host: 'https://asigbo.org',
  dbConnectionUri: process.env.PROD_DB_CONNECTION_URI,
  allowInsecureConnections: false,
  sendErrorObj: false,
  verbose: 1,
  awsBucketAccess: process.env.AWS_BUCKET_ACCESS,
  awsBucketSecret: process.env.AWS_BUCKET_SECRET,
  bucketName: process.env.BUCKET_NAME,
  avoidCors: false,
};
