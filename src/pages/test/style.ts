import {styled} from "@mui/material/styles";
import {Box, Button, TextField, Typography} from "@mui/material";

export const AccessibleButton = styled(Button)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  maxWidth: '600px',
  padding: '16px',
  fontSize: '1.5rem',
  marginTop: '16px',
  marginBottom: '16px',
  backgroundColor: 'white',
  color: 'black',
  borderRadius: '16px',
  border: '3px solid white',
  fontWeight: 'bold',
  letterSpacing: '0.05em',
  cursor: 'pointer',
  boxShadow: '2px 2px 12px rgba(255, 255, 255, 0.1)',
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
  color: 'white',
  fontWeight: 500,
  width: "100%", // Adjusted for full width
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  margin: '20px',
});

// styles for sections
export const SectionContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "16px", // Rounded corners
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Subtle shadow
  marginTop: "16px",
}));

export const BlueSection = styled(SectionContainer)({
  // background: "linear-gradient(135deg, #001f4d, #87CEEB)",
  background: "black",
  color: "white", // for contrast
});

export const GraySection = styled(SectionContainer)({
  // background: "linear-gradient(to bottom, #a9a9a9, #cfcfcf)",
  background: "black",
  color: "white", // for contrast
  border: '2px solid white',
});

export const GreenSection = styled(SectionContainer)({
  background: "black",
  color: "white", // for contrast
});
