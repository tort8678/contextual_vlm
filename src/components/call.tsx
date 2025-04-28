import React from 'react';
import { BiSolidPhoneCall } from "react-icons/bi";
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';


const CallAccessARideButton: React.FC = () => {
  const handleCall = () => {
    window.location.href = 'tel:+18773372017';
  };

  const CallButton = styled(Button)({
    position: 'fixed',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90%',
    maxWidth: '600px',
    padding: '16px',
    fontSize: '1.3rem',
    backgroundColor: 'white',
    color: 'black',
    borderRadius: '16px',
    border: '3px solid white',
    fontWeight: 'bold',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    boxShadow: '2px 2px 12px rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    zIndex: 1000,
    textAlign: 'center',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
    '&:active': {
      backgroundColor: '#e0e0e0',
    },
    // '&:focus': {
    //   outline: '3px solid #FFA500',
    //   outlineOffset: '2px',
    // },
  });

  return (
    <CallButton
      onClick={handleCall}
      aria-label="Call Access-A-Ride"
    >
      <BiSolidPhoneCall size={30} />
      <span>Call Access-A-Ride</span>
    </CallButton>
  );
};

export default CallAccessARideButton;

