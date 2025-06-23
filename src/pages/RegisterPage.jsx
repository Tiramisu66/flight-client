import React, { useState } from 'react';
import RegisterPopup from './RegisterPopup';

const RegisterPage = () => {
  const [isRegisterPopupOpen, setIsRegisterPopupOpen] = useState(true);

  const handleCloseRegisterPopup = () => {
    setIsRegisterPopupOpen(false);
  };

  return (
    <div>
      <RegisterPopup isOpen={isRegisterPopupOpen} onClose={handleCloseRegisterPopup} />
    </div>
  );
};

export default RegisterPage;