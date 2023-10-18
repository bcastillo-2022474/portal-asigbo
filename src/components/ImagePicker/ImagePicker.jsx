import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { scrollbarGray } from '@styles/scrollbar.module.css';
import { BiSolidCloudUpload as CloudIcon } from 'react-icons/bi';
import randomString from '@helpers/randomString';
import styles from './ImagePicker.module.css';
import ImagePickerCard from './ImagePickerCard';

/**
 * Componente utilizado para seleccionar imágenes.
 * Es posible agregar imágenes por default, las cuales, si son removidas, son retornadas a través
 * del callback.
 * @param {function} onChange: Callback a ejecutar cuando se produce un cambio.
 * En el primer parámetro devuelve la lista de imágenes.
 * En el segundo parámetro devuelve las imágenes por default que fueron removidas.
 * @param {Number} maxFiles: número máximo de archivos.
 * @param {Array[string]} defaultImages: Arreglo de url's de imágenes default a colocar en el
 * componente. Estas se toman en cuenta como si hubieran sido seleccionadas por el usuario.
 * En el caso de que se eliminen, la url es retornada en un arreglo en el segundo parámetro del
 * callback.
 */
function ImagePicker({
  onChange, maxFiles, defaultImages, className,
}) {
  const [files, setFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [urlImages, setUrlImages] = useState(defaultImages);
  const [deletedUrlImages, setDeletedUrlImages] = useState([]);

  const totalImages = Object.entries(imagePreviews).length + (urlImages?.length ?? 0);

  useEffect(() => {
    setUrlImages(defaultImages);
  }, [defaultImages]);

  const addImageCard = (id, image) => {
    setImagePreviews((lastVal) => ({ ...lastVal, [id]: image }));
  };

  const addFile = (id, fileImage) => {
    setFiles((lastVal) => ({ ...lastVal, [id]: fileImage }));
  };

  const deleteImage = (id) => {
    setFiles((lastVal) => {
      const value = { ...lastVal };
      delete value[id];
      return value;
    });

    setImagePreviews((lastVal) => {
      const value = { ...lastVal };
      delete value[id];
      return value;
    });
  };

  const deleteDefaultImage = (id) => {
    setDeletedUrlImages((lastVal) => [...lastVal, id]);
    setUrlImages((lastVal) => lastVal.filter((val) => val !== id));
  };

  const handleOnChange = (evt) => {
    const images = evt.target.files;
    if (!images) return;
    Object.values(images).forEach((image, index) => {
      if (totalImages + index >= maxFiles) return; // Evitar que se selecciones más imágenes

      const id = randomString(10);
      const fileReader = new FileReader();

      // cargar preview de la imagen
      fileReader.onload = (event) => {
        if (event.target.readyState === 2) {
          addImageCard(id, event.target.result);
        }
      };

      fileReader.readAsDataURL(image);
      addFile(id, image);
    });
  };

  useEffect(() => {
    if (onChange) onChange(Object.values(files), deletedUrlImages);
  }, [files, deletedUrlImages]);

  return (
    <div
      className={`${className} ${styles.imagePicker} ${
        totalImages > 0
          ? styles.galleryStyle
          : ''
      }`}
    >
      <div className={`${scrollbarGray} ${styles.cardsContainer}`}>
        {urlImages?.map((defaultImage) => (
          <ImagePickerCard
            key={randomString()}
            id={defaultImage}
            imageUrl={defaultImage}
            onDelete={deleteDefaultImage}
          />
        ))}
        {Object.entries(imagePreviews).map((item) => (
          <ImagePickerCard key={item[0]} id={item[0]} imageUrl={item[1]} onDelete={deleteImage} />
        ))}
        {totalImages < maxFiles && (
          <div className={`${styles.inputFileContainer}`}>
            <div className={styles.fileInputInfo}>
              <CloudIcon className={styles.uploadIcon} />
              <span className={styles.boldSpan}>Añade una foto</span>
              <span>Haz click o arrastra y suelta una imagen</span>
            </div>
            <input
              type="file"
              className={styles.inputFile}
              name="files"
              multiple={(maxFiles - totalImages) > 1}
              onChange={handleOnChange}
              accept="image/*"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ImagePicker;

ImagePicker.propTypes = {
  onChange: PropTypes.func,
  maxFiles: PropTypes.number,
  className: PropTypes.string,
  defaultImages: PropTypes.arrayOf(PropTypes.string),
};

ImagePicker.defaultProps = {
  maxFiles: 10,
  className: '',
  onChange: null,
  defaultImages: null,
};
