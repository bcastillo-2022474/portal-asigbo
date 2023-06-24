/* eslint-disable import/no-extraneous-dependencies */
import { watch } from 'chokidar';
import chalk from 'chalk';
import { renderSync } from 'sass';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, relative } from 'path';

const compileScssToCss = (scssFilePath) => {
  const cssFilePath = scssFilePath.replace(/\.scss$/, '.css');
  const result = renderSync({
    file: scssFilePath,
  });

  writeFileSync(cssFilePath, result.css.toString());
  const srcFolderPath = resolve(fileURLToPath(import.meta.url), '..', 'src');
  const relativeSrcPath = relative(srcFolderPath, scssFilePath);
  const relativeOutputPath = relative(srcFolderPath, cssFilePath);
  // eslint-disable-next-line no-console
  console.log(`${chalk.blue.bold('Compiled SCSS to CSS: ')}${chalk.gray(relativeSrcPath)}${chalk.green.bold(' -> ')}${chalk.black(relativeOutputPath)}`);
};

const scssWatcher = watch('src/**/*.scss');

scssWatcher.on('change', (filePath) => {
  const resolvedFilePath = resolve(filePath);
  compileScssToCss(resolvedFilePath);
});
