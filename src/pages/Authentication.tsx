
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Authentication() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
}
