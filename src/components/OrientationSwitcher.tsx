import React, { useState } from 'react';

import { useDeviceOrientation } from '../hooks/useDeviceOrientation';
import { Button } from '@mui/material';

type OrientationSwitcherProps = {
  onToggle: (toggleState: boolean) => void,
  labelOn?: string,
  labelOff?: string,
};

const OrientationSwitcher = (props: OrientationSwitcherProps): React.ReactElement => {
  const { onToggle: onSwitchToggle, labelOn = 'Using orientation', labelOff = 'Use orientation' } = props;

  const {
    error,
    requestAccess,
    revokeAccess,
    orientation
  } = useDeviceOrientation();

  const [orientationAvailable, setOrientationAvailable] = useState(false);

  const onToggle = (toggleState: boolean): void => {
    if (toggleState) {
      requestAccess().then((granted: boolean) => {
        if (granted) {
          setOrientationAvailable(true);
          console.log(orientation)
        } else {
          setOrientationAvailable(false);
        }
      });
    } else {
      revokeAccess().then(() => {
        setOrientationAvailable(false);
      });
    }
    onSwitchToggle(toggleState);
  };

  const errorElement = error ? (
    <div className="mt-6">
      error: {error.message}
    </div>
  ) : null;

  return (
    <div>
      <Button
              variant="contained"
              // color={cameraEnabled ? 'success' : 'error'}
              onClick={()=> onToggle(!orientationAvailable)}
              sx={{
                fontWeight: 'bold',
                fontSize: '1.0rem', //enlarged for readability
                letterSpacing: '0.05em',
                textAlign: 'center',
                marginY: 1,
                width: '100%',
                background: orientationAvailable
                  ? 'linear-gradient(to bottom, #56ab2f, #66bb6a)'
                  : 'linear-gradient(to bottom, #e53935, #d32f2f)', // Green or red gradient
                color: 'white',
                boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2)',
                '&:hover': {
                  background: orientationAvailable
                    ? 'linear-gradient(to bottom, #66bb6a, #56ab2f)'
                    : 'linear-gradient(to bottom, #d32f2f, #e53935)',
                },
              }}
            >
        {orientationAvailable ? "orientation enabled" : "enable orientation"}
      </Button>
      {errorElement}
    </div>
  );
};

export default OrientationSwitcher;