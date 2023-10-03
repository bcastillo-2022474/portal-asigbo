import React from 'react';
import PropTypes from 'prop-types';
import { AiFillDelete as DeleteIcon } from 'react-icons/ai';
import styles from './ImagePickerCard.module.css';

function ImagePickerCard({ id, imageUrl, onDelete }) {
  return (
    <button type="button" className={styles.card} onClick={() => onDelete(id)}>
      <img className={styles.cardImage} src={imageUrl} alt="preview" />
      <div className={styles.deleteCard} title="retirar imagen">
        <DeleteIcon />
      </div>
    </button>
  );
}

export default ImagePickerCard;

ImagePickerCard.propTypes = {
  id: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
};

ImagePickerCard.defaultProps = {

};
