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

  const handleClick = () => {
    speak("Calling Access-A-Ride.");
  };

  return (
    <>
      <a
        href="tel:8773372017"
        className="call-button"
        aria-label="Call Access-A-Ride"
        onClick={handleClick}
      >
        <BiSolidPhoneCall size={35} color="black" />
        <span className="call-label">AAR</span>
      </a>

      <style>{`
         .call-button {
           position: fixed;
           bottom: 10px;
           right: 10px;
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
           font-weight: 900; 
           letter-spacing: 0.1em;
           fontSize: 2rem;
           cursor: pointer;
           color: black;
           margin-top: 4px;
         }
       `}</style>
    </>
  );
};

export default CallAccessARideButton;