import multer from 'multer';

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, `${global.dirname}/files`);
  },

  filename(req, file, callback) {
    const newFilename = `${Date.now()}-${file.originalname}`;

    // guardar datos de archivo en req header
    const data = { fileName: newFilename, type: file.mimetype.split('/')[1] };
    if (!Array.isArray(req.uploadedFiles)) {
      req.uploadedFiles = [data];
    } else req.uploadedFiles.push(data);

    callback(null, newFilename);
  },
});

export default storage;
