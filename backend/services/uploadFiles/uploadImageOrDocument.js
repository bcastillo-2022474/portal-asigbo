import multer from 'multer';
import { imageFileFilter } from './fileFilter.js';
import storage from './storage.js';
import consts from '../../utils/consts.js';

const limits = {
  fileSize: consts.uploadFileSizeLimit.files,
};

export default multer({ storage, fileFilter: imageFileFilter, limits });
