import { useState } from 'react';
import { Button, Stack, TextField } from '@mui/material';
import QRCode from 'qrcode';

const QRGenerator = ({ onGenerated }) => {
  const [value, setValue] = useState('{{admissionNumber}}');

  const generate = async () => {
    const dataUrl = await QRCode.toDataURL(value);
    onGenerated(dataUrl, value);
  };

  return (
    <Stack direction="row" spacing={1}>
      <TextField size="small" label="QR Data" value={value} onChange={(e) => setValue(e.target.value)} />
      <Button size="small" variant="outlined" onClick={generate}>Generate QR</Button>
    </Stack>
  );
};

export default QRGenerator;
