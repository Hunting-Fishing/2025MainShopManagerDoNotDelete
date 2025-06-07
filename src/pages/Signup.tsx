
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page with signup tab
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
}
