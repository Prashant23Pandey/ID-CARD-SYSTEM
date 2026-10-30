import { Button, ButtonGroup, Stack } from '@mui/material';

const Toolbar = ({ actions }) => (
  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
    <ButtonGroup variant="outlined" size="small">
      <Button onClick={actions.addText}>Text</Button>
      <Button onClick={actions.addImage}>Image</Button>
      <Button onClick={actions.addQr}>QR</Button>
      <Button onClick={actions.addBarcode}>Barcode</Button>
      <Button onClick={actions.addRect}>Rectangle</Button>
      <Button onClick={actions.addCircle}>Circle</Button>
      <Button onClick={actions.addLine}>Line</Button>
    </ButtonGroup>
    <ButtonGroup variant="outlined" size="small">
      <Button onClick={actions.copy}>Copy</Button>
      <Button onClick={actions.paste}>Paste</Button>
      <Button onClick={actions.duplicate}>Duplicate</Button>
      <Button onClick={actions.remove}>Delete</Button>
      <Button onClick={actions.lock}>Lock/Unlock</Button>
      <Button onClick={actions.bringForward}>Bring+</Button>
      <Button onClick={actions.sendBackward}>Send-</Button>
      <Button onClick={actions.alignLeft}>Align Left</Button>
      <Button onClick={actions.alignCenter}>Align Center</Button>
      <Button onClick={actions.alignRight}>Align Right</Button>
      <Button onClick={actions.group}>Group</Button>
      <Button onClick={actions.ungroup}>Ungroup</Button>
    </ButtonGroup>
    <ButtonGroup variant="contained" size="small">
      <Button onClick={actions.undo}>Undo</Button>
      <Button onClick={actions.redo}>Redo</Button>
      <Button onClick={actions.zoomIn}>Zoom+</Button>
      <Button onClick={actions.zoomOut}>Zoom-</Button>
      <Button onClick={actions.togglePan}>Pan</Button>
      <Button onClick={actions.toggleGrid}>Grid</Button>
      <Button onClick={actions.exportPng}>PNG</Button>
      <Button onClick={actions.exportJpeg}>JPEG</Button>
      <Button onClick={actions.exportPdf}>PDF</Button>
      <Button onClick={actions.preview}>Preview</Button>
      <Button onClick={actions.save}>Save</Button>
      <Button onClick={actions.publish}>Publish</Button>
    </ButtonGroup>
  </Stack>
);

export default Toolbar;
