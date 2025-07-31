import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { AccessibleButton, AccessibleTextField } from '../pages/main/style';
import { useState } from 'react';
import { flagMessage } from '../api/chatLog';

interface ReportMessageProps {
  openAIResponse: string;
  currentMessageId: string;
  currentChatId: string;
}

export default function ReportMessage({
  openAIResponse,
  currentMessageId,
  currentChatId,
}: ReportMessageProps): JSX.Element {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [messageReported, setMessageReported] = useState(false)

  async function submitFlag() {
    try {
      const res = await flagMessage({
        messageId: currentMessageId,
        chatlogId: currentChatId,
        flagReason
      });
      if (res) {
        console.log('Flag submitted successfully:', res);
        setMessageReported(true)
      }
    } catch (e) {
      console.error('Error submitting flag:', e);
    }
  }

  return (
    <>
      {openAIResponse !== '' && !messageReported && (
        <AccessibleButton onClick={() => setDialogOpen(true)}>
          Report Response
        </AccessibleButton>
      )}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        sx={{ color: 'white' }}
      >
        <DialogTitle sx={{fontSize:"2rem"}}>Report an Error in the Response</DialogTitle>
        <DialogContent>
          <AccessibleTextField
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            sx={{ bgcolor: 'white', marginY: 2, width: "95%", marginLeft: 0, fontSize: "2rem" }}
            aria-label="Reason for reporting"
            placeholder="Type Report"
          />
          <AccessibleButton
            sx= {{border: "2px"}}
            onClick={() => {
              submitFlag();
              setDialogOpen(false);
            }}
          >
            Submit Report
          </AccessibleButton>
        </DialogContent>
      </Dialog>
    </>
  );
}
