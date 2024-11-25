import { fileURLToPath } from 'url';
import path from 'path';

const getDirname = (metaUrl) => path.dirname(fileURLToPath(metaUrl));
export default getDirname;
