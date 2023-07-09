import { useState } from 'react';

/**
 *
 * @param  initialValue
 * @returns [isOpen, function open, function close]
 */
const usePopUp = (initialValue = false) => {
  const [isOpen, setIsOpen] = useState(initialValue);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return [isOpen, open, close];
};

export default usePopUp;
