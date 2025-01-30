import {styled} from "@mui/material/styles";
import {Box, Button, TextField, Typography} from "@mui/material";

export const AccessibleButton = styled(Button)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 'auto',
  height: 'auto',
  backgroundColor: '#000000',
  color: '#FFFFFF',
  fontSize: '1.5rem', // Increased size for better accessibility
  padding: '16px 32px', // Adjusted padding
  margin: '10px 0',
  marginTop: '16px',
  marginBottom: '16px',  // Added padding below the button
  textAlign: 'center',
  cursor: 'pointer',
  borderRadius: '12px',
  background: 'linear-gradient(145deg, #1a1a1a, #121212)',  // Almost black gradient background
  boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.2), -2px -2px 10px rgba(255, 255, 255, 0.2)', // Shadow effect
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
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'black', // Black outline on focus
  },
  '& .Mui-focused .MuiInputLabel-root': {
    color: 'black !important' , // Black label text on focus
  },
});

export const AccessibleTypography = styled(Typography)({
  fontSize: '1.8rem', // Increased size for better readability
  lineHeight: 1.6,
  color: '#000000',
  fontWeight: 500,
  width: "100%", // Adjusted for full width
});

// styles for sections
export const SectionContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(4),
  marginBottom: theme.spacing(2),
  borderRadius: "16px", // Rounded corners
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Subtle shadow
}));

export const BlueSection = styled(SectionContainer)({
  // background: "linear-gradient(135deg, #3A7BD5, #3A6073)", // Blue gradient
  background: "linear-gradient(135deg, #001f4d, #87CEEB)",
  color: "#FFFFFF", // White text for contrast
});

export const GraySection = styled(SectionContainer)({
  background: "linear-gradient(to bottom, #a9a9a9, #cfcfcf)",
  color: "#000000",
});

export const GreenSection = styled(SectionContainer)({
  background: "linear-gradient(to bottom, #56ab2f, #66bb6a)",
  color: "#FFFFFF",
});

