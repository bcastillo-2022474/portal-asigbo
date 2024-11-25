import fs from 'fs';

const deleteFiles = (files) => {
  if (Array.isArray(files)) {
    files.forEach((file) => {
      fs.unlink(`${global.dirname}/files/${file.fileName}`, () => { });
      return null;
    });
  } else {
    fs.unlink(`${global.dirname}/files/${files.fileName}`, () => { });
  }
};

export default deleteFiles;
