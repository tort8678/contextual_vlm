import {styled} from "@mui/material/styles";
import {Button, TextField, Typography} from "@mui/material";

export const AccessibleButton = styled(Button)({
  backgroundColor: '#000000',
  color: '#FFFFFF',
  fontSize: '1.2rem',
  padding: '12px 24px',
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
    fontSize: '1.2rem',
  },
  '& .MuiInputLabel-root': {
    fontSize: '1.2rem',
  },
});

export const AccessibleTypography = styled(Typography)({
  fontSize: '1.6rem',
  lineHeight: 1.6,
  color: '#000000',
  fontWeight: 500,
  width:"50vw"
});
