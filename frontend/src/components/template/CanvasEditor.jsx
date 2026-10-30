import { useEffect, useMemo, useRef } from 'react';
import { fabric } from 'fabric';
import { Box } from '@mui/material';

const GRID_SIZE = 10;

const addGrid = (canvas) => {
  for (let i = 0; i < canvas.width / GRID_SIZE; i += 1) {
    canvas.add(new fabric.Line([i * GRID_SIZE, 0, i * GRID_SIZE, canvas.height], { stroke: '#f0f0f0', selectable: false, evented: false }));
  }
  for (let i = 0; i < canvas.height / GRID_SIZE; i += 1) {
    canvas.add(new fabric.Line([0, i * GRID_SIZE, canvas.width, i * GRID_SIZE], { stroke: '#f0f0f0', selectable: false, evented: false }));
  }
  canvas.sendToBack(...canvas.getObjects('line'));
};

const CanvasEditor = ({ width, height, canvasJson, gridEnabled, onReady, onChange, onSelectionChange }) => {
  const htmlCanvasRef = useRef(null);
  const fabricRef = useRef(null);
  const loadedRef = useRef(false);

  const sizeKey = useMemo(() => `${width}x${height}`, [width, height]);

  useEffect(() => {
    if (!htmlCanvasRef.current) return undefined;
    const fabricCanvas = new fabric.Canvas(htmlCanvasRef.current, {
      width,
      height,
      preserveObjectStacking: true,
      selection: true,
    });
    fabricRef.current = fabricCanvas;
    onReady?.(fabricCanvas);

    const handleChange = () => {
      if (!loadedRef.current) return;
      onChange?.(fabricCanvas.toJSON(['id', 'bindingKey', 'locked']));
    };

    const handleSelection = () => {
      const active = fabricCanvas.getActiveObject();
      onSelectionChange?.(active || null);
    };

    fabricCanvas.on('object:added', handleChange);
    fabricCanvas.on('object:modified', handleChange);
    fabricCanvas.on('object:removed', handleChange);
    fabricCanvas.on('selection:created', handleSelection);
    fabricCanvas.on('selection:updated', handleSelection);
    fabricCanvas.on('selection:cleared', () => onSelectionChange?.(null));

    loadedRef.current = false;
    if (canvasJson?.objects?.length) {
      fabricCanvas.loadFromJSON(canvasJson, () => {
        loadedRef.current = true;
        fabricCanvas.renderAll();
      });
    } else {
      loadedRef.current = true;
    }

    return () => {
      fabricCanvas.dispose();
      fabricRef.current = null;
    };
  }, [sizeKey]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !loadedRef.current) return;
    canvas.getObjects('line').forEach((line) => {
      if (line.selectable === false && line.evented === false) canvas.remove(line);
    });
    if (gridEnabled) addGrid(canvas);
    canvas.renderAll();
  }, [gridEnabled]);

  return (
    <Box sx={{ p: 2, bgcolor: '#f6f8fa', borderRadius: 2, overflow: 'auto' }}>
      <canvas ref={htmlCanvasRef} />
    </Box>
  );
};

export default CanvasEditor;
