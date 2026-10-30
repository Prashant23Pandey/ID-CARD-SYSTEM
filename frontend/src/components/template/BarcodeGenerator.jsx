import { useState } from 'react';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import JsBarcode from 'jsbarcode';

const FORMATS = ['CODE128', 'EAN13', 'EAN8', 'UPC', 'CODE39'];

const BarcodeGenerator = ({ onGenerated }) => {
  const [value, setValue] = useState('{{admissionNumber}}');
  const [format, setFormat] = useState('CODE128');

  const generate = () => {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, value, { format, displayValue: true });
    onGenerated(canvas.toDataURL('image/png'), value, format);
  };

  return (
    <Stack direction="row" spacing={1}>
      <TextField size="small" label="Barcode Data" value={value} onChange={(e) => setValue(e.target.value)} />
      <TextField size="small" select label="Format" value={format} onChange={(e) => setFormat(e.target.value)}>
        {FORMATS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
      </TextField>
      <Button size="small" variant="outlined" onClick={generate}>Generate Barcode</Button>
    </Stack>
  );
};

export default BarcodeGenerator;
