import React from 'react';
import { BiSolidPhoneCall } from 'react-icons/bi';


const CallAccessARideButton: React.FC = () => {
  // TTS function for speaking
  function speak(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported in this browser.');
    }
  }

  const handleCall = () => {
    speak("Calling Access-A-Ride.");
    setTimeout(() => {
      window.location.href = 'tel:+18773372017';
    }, 1500); // give TTS time to speak before triggering the call
  };
  return (
    <>
      <button
        className="call-button"
        onClick={handleCall}
        aria-label="Call Access-A-Ride"
      >
        <BiSolidPhoneCall size={40} color="black" />
        <span className="call-label">AAR</span>
      </button>

      <style>{`
        .call-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 80px;
          height: 80px;
          background-color: white;
          border: 2px solid black;
          border-radius: 50%;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          cursor: pointer;
          transition: background-color 0.2s ease;
          text-decoration: none;
        }

        .call-button:hover {
          background-color: #f2f2f2;
        }

        .call-label {
        font-size: 25px;
        font-weight: bold;
        letter-spacing: 0.1em;
        cursor: pointer;
        color: black;
        margin-top: 4px;
        }
      `}</style>
    </>
  );
};

export default CallAccessARideButton;