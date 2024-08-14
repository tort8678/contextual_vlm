import {styled} from "@mui/material/styles";
import {Button, TextField, Typography} from "@mui/material";

export const AccessibleButton = styled(Button)({
  backgroundColor: '#000000',
  color: '#FFFFFF',
  fontSize: '1.5rem', // Increased size for better accessibility
  padding: '16px 32px', // Adjusted padding
  margin: '10px 0',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: '#303030',
  },
  '&:focus': {
    outline: '3px solid #FFA500',
    outlineOffset: '2px',
  },
});

export const AccessibleTextField = styled(TextField)({
  '& .MuiInputBase-input': {
    fontSize: '1.5rem', // Increased font size
  },
  '& .MuiInputLabel-root': {
    fontSize: '1.5rem', // Increased label size
  },
});

export const AccessibleTypography = styled(Typography)({
  fontSize: '1.8rem', // Increased size for better readability
  lineHeight: 1.6,
  color: '#000000',
  fontWeight: 500,
  width: "100%", // Adjusted for full width
});
