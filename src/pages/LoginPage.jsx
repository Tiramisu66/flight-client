import React, { useState } from 'react';
import LoginPopup from './LoginPopup';

const LoginPage = () => {
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(true);

  const handleCloseLoginPopup = () => {
    setIsLoginPopupOpen(false);
  };

  return (
    <div>
      <LoginPopup isOpen={isLoginPopupOpen} onClose={handleCloseLoginPopup} />
    </div>
  );
};

export default LoginPage;