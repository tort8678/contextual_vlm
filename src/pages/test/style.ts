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

// 3 separate sections
export const Section = styled('div')({
  width: '100%', // Full width of the page
});

export const BlueSection = styled(Section)({
  backgroundColor: '#add8e6',
  flex: 1, // 1 part of the height
});

export const GraySection = styled(Section)({
  backgroundColor: '#d3d3d3',
  flex: 2, // 2 parts of the height
});

export const GreenSection = styled(Section)({
  backgroundColor: '#32cd32',
  flex: 1, // 1 part of the height
});
