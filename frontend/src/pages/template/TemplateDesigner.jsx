import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, CardContent, Grid, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { fabric } from 'fabric';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { useNavigate, useParams } from 'react-router-dom';
import CanvasEditor from '../../components/template/CanvasEditor';
import Toolbar from '../../components/template/Toolbar';
import PropertiesPanel from '../../components/template/PropertiesPanel';
import LayersPanel from '../../components/template/LayersPanel';
import DynamicFieldPanel from '../../components/template/DynamicFieldPanel';
import PreviewPanel from '../../components/template/PreviewPanel';
import VersionHistoryDialog from '../../components/template/VersionHistoryDialog';
import ImportExportDialog from '../../components/template/ImportExportDialog';
import { fetchTemplateById, saveTemplate } from '../../features/template/templateSlice';
import { fetchTemplatePreview } from '../../features/template/previewSlice';
import { fetchVersionHistory, restoreTemplateVersion, selectVersionState } from '../../features/template/versionSlice';
import templateService from '../../services/templateService';

const emptyJson = { version: '6.0.0', objects: [], background: '#FFFFFF' };

const TemplateDesigner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedTemplate } = useSelector((state) => state.template);
  const previewState = useSelector((state) => state.preview);
  const versionState = useSelector(selectVersionState);

  const [name, setName] = useState('New ID Template');
  const [code, setCode] = useState('NEW_TEMPLATE');
  const [activeSide, setActiveSide] = useState('front');
  const [frontJson, setFrontJson] = useState(emptyJson);
  const [backJson, setBackJson] = useState(emptyJson);
  const [selectedObject, setSelectedObject] = useState(null);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [layers, setLayers] = useState([]);
  const [panMode, setPanMode] = useState(false);
  const [zoom, setZoom] = useState(1);

  const canvasRef = useRef(null);
  const copiedRef = useRef(null);
  const lastStatesRef = useRef([]);
  const futureRef = useRef([]);

  useEffect(() => {
    if (id) dispatch(fetchTemplateById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!selectedTemplate) return;
    setName(selectedTemplate.templateName);
    setCode(selectedTemplate.templateCode);
    setFrontJson(selectedTemplate.templateJson.front || emptyJson);
    setBackJson(selectedTemplate.templateJson.back || emptyJson);
  }, [selectedTemplate]);

  const currentJson = useMemo(() => (activeSide === 'front' ? frontJson : backJson), [activeSide, frontJson, backJson]);

  const syncLayers = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const nextLayers = canvas.getObjects().map((obj, idx) => ({
      id: obj.id || `${obj.type}_${idx}`,
      name: obj.name || `${obj.type}-${idx + 1}`,
      type: obj.type,
      visible: obj.visible !== false,
    })).reverse();
    setLayers(nextLayers);
  };

  const captureHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    lastStatesRef.current.push(JSON.stringify(canvas.toJSON(['id', 'name', 'bindingKey', 'locked'])));
    if (lastStatesRef.current.length > 50) lastStatesRef.current.shift();
    futureRef.current = [];
    syncLayers();
  };

  const addObject = (obj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    obj.set({ left: 50, top: 50, id: crypto.randomUUID(), name: `${obj.type}-${Date.now()}` });
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.renderAll();
    captureHistory();
  };

  const exportImage = (format) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({ format, quality: 1, multiplier: 2 });
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${code}_${activeSide}.${format === 'jpeg' ? 'jpg' : format}`;
    link.click();
  };

  const toolbarActions = {
    addText: () => addObject(new fabric.Textbox('New Text', { fontSize: 16, fill: '#000000' })),
    addImage: () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          fabric.Image.fromURL(reader.result, (img) => {
            img.scaleToWidth(120);
            addObject(img);
          });
        };
        reader.readAsDataURL(file);
      };
      input.click();
    },
    addQr: async () => {
      const url = await QRCode.toDataURL('https://example.com/student/{{admissionNumber}}');
      fabric.Image.fromURL(url, (img) => {
        img.set({ bindingKey: 'qrCode' });
        img.scaleToWidth(100);
        addObject(img);
      });
    },
    addBarcode: () => {
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, '{{admissionNumber}}', { format: 'CODE128', displayValue: true });
      fabric.Image.fromURL(canvas.toDataURL('image/png'), (img) => {
        img.set({ bindingKey: 'barcode' });
        img.scaleToWidth(180);
        addObject(img);
      });
    },
    addRect: () => addObject(new fabric.Rect({ width: 120, height: 60, fill: '#E3F2FD', stroke: '#0D47A1' })),
    addCircle: () => addObject(new fabric.Circle({ radius: 40, fill: '#FFF3E0', stroke: '#E65100' })),
    addLine: () => addObject(new fabric.Line([0, 0, 140, 0], { stroke: '#1f1f1f', strokeWidth: 2 })),
    copy: () => {
      const active = canvasRef.current?.getActiveObject();
      if (!active) return;
      active.clone((clone) => { copiedRef.current = clone; });
    },
    paste: () => {
      if (!copiedRef.current || !canvasRef.current) return;
      copiedRef.current.clone((clonedObj) => {
        clonedObj.set({ left: (clonedObj.left || 0) + 12, top: (clonedObj.top || 0) + 12, id: crypto.randomUUID() });
        canvasRef.current.add(clonedObj);
        canvasRef.current.setActiveObject(clonedObj);
        canvasRef.current.renderAll();
        captureHistory();
      });
    },
    duplicate: () => toolbarActions.copy() || toolbarActions.paste(),
    remove: () => {
      const active = canvasRef.current?.getActiveObject();
      if (!active || !canvasRef.current) return;
      canvasRef.current.remove(active);
      captureHistory();
    },
    lock: () => {
      const active = canvasRef.current?.getActiveObject();
      if (!active || !canvasRef.current) return;
      const locked = !active.selectable;
      active.set({ selectable: locked, evented: locked, hasControls: locked, locked });
      canvasRef.current.renderAll();
      captureHistory();
    },
    bringForward: () => { const active = canvasRef.current?.getActiveObject(); if (active) { canvasRef.current.bringForward(active); captureHistory(); } },
    sendBackward: () => { const active = canvasRef.current?.getActiveObject(); if (active) { canvasRef.current.sendBackwards(active); captureHistory(); } },
    alignLeft: () => {
      const active = canvasRef.current?.getActiveObject();
      if (!active || !canvasRef.current) return;
      active.set({ left: 0 });
      canvasRef.current.renderAll();
      captureHistory();
    },
    alignCenter: () => {
      const active = canvasRef.current?.getActiveObject();
      if (!active || !canvasRef.current) return;
      active.set({ left: (canvasRef.current.width - active.getScaledWidth()) / 2 });
      canvasRef.current.renderAll();
      captureHistory();
    },
    alignRight: () => {
      const active = canvasRef.current?.getActiveObject();
      if (!active || !canvasRef.current) return;
      active.set({ left: canvasRef.current.width - active.getScaledWidth() });
      canvasRef.current.renderAll();
      captureHistory();
    },
    group: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active || active.type !== 'activeSelection') return;
      active.toGroup();
      canvas.renderAll();
      captureHistory();
    },
    ungroup: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active || active.type !== 'group') return;
      active.toActiveSelection();
      canvas.renderAll();
      captureHistory();
    },
    undo: () => {
      const canvas = canvasRef.current;
      if (!canvas || !lastStatesRef.current.length) return;
      const current = JSON.stringify(canvas.toJSON(['id', 'name', 'bindingKey', 'locked']));
      futureRef.current.unshift(current);
      const prev = lastStatesRef.current.pop();
      canvas.loadFromJSON(prev, () => { canvas.renderAll(); syncLayers(); });
    },
    redo: () => {
      const canvas = canvasRef.current;
      if (!canvas || !futureRef.current.length) return;
      const current = JSON.stringify(canvas.toJSON(['id', 'name', 'bindingKey', 'locked']));
      lastStatesRef.current.push(current);
      const next = futureRef.current.shift();
      canvas.loadFromJSON(next, () => { canvas.renderAll(); syncLayers(); });
    },
    toggleGrid: () => setGridEnabled((prev) => !prev),
    zoomIn: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const next = Math.min(zoom + 0.1, 3);
      canvas.setZoom(next);
      setZoom(next);
    },
    zoomOut: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const next = Math.max(zoom - 0.1, 0.2);
      canvas.setZoom(next);
      setZoom(next);
    },
    togglePan: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const next = !panMode;
      setPanMode(next);
      canvas.defaultCursor = next ? 'grab' : 'default';
      let panning = false;
      canvas.off('mouse:down');
      canvas.off('mouse:move');
      canvas.off('mouse:up');
      if (next) {
        canvas.on('mouse:down', () => { panning = true; });
        canvas.on('mouse:move', (opt) => {
          if (!panning) return;
          const e = opt.e;
          canvas.relativePan({ x: e.movementX, y: e.movementY });
        });
        canvas.on('mouse:up', () => { panning = false; });
      }
    },
    exportPng: () => exportImage('png'),
    exportJpeg: () => exportImage('jpeg'),
    exportPdf: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const data = canvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(data, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${code}_${activeSide}.pdf`);
    },
    preview: () => {
      if (!id) return;
      dispatch(fetchTemplatePreview({ templateId: id, data: { studentName: 'Aarav Sharma', admissionNumber: 'ADM2026-001', class: '10', section: 'A', schoolName: 'Riverside Public School' } }));
    },
    save: async () => {
      const payload = {
        templateName: name,
        templateCode: code,
        templateType: 'STUDENT_ID_CARD',
        canvasWidth: 860,
        canvasHeight: 540,
        orientation: 'LANDSCAPE',
        templateJson: { front: frontJson, back: backJson },
      };
      const result = await dispatch(saveTemplate({ id, data: payload }));
      if (!id && result.payload?._id) navigate(`/templates/${result.payload._id}/designer`);
    },
    publish: async () => {
      if (!id) return;
      await templateService.publish(id);
    },
  };

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <TextField value={name} onChange={(e) => setName(e.target.value)} label="Template Name" />
            <TextField value={code} onChange={(e) => setCode(e.target.value)} label="Template Code" />
            <Button onClick={() => { if (id) dispatch(fetchVersionHistory({ templateId: id, page: 1, limit: 20 })); setShowVersions(true); }}>Versions</Button>
            <Button onClick={() => setShowImportExport(true)}>Import / Export</Button>
          </Stack>
        </CardContent>
      </Card>

      <Toolbar actions={toolbarActions} />

      <Tabs value={activeSide} onChange={(_, v) => setActiveSide(v)}>
        <Tab label="Front Side" value="front" />
        <Tab label="Back Side" value="back" />
      </Tabs>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <CanvasEditor
            width={860}
            height={540}
            canvasJson={currentJson}
            gridEnabled={gridEnabled}
            onReady={(canvas) => { canvasRef.current = canvas; syncLayers(); }}
            onSelectionChange={setSelectedObject}
            onChange={(json) => {
              if (activeSide === 'front') setFrontJson(json); else setBackJson(json);
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <PropertiesPanel
              selectedObject={selectedObject}
              onChange={(key, value) => {
                const active = canvasRef.current?.getActiveObject();
                if (!active) return;
                active.set(key, value);
                canvasRef.current.renderAll();
                captureHistory();
              }}
            />
            <DynamicFieldPanel
              onInsertField={(value) => {
                const active = canvasRef.current?.getActiveObject();
                if (!active || active.type !== 'textbox') return;
                active.set('text', `${active.text || ''}${value}`);
                canvasRef.current.renderAll();
                captureHistory();
              }}
            />
            <Typography variant="subtitle2">Layers</Typography>
            <LayersPanel
              layers={layers}
              activeObjectId={selectedObject?.id}
              onSelect={(idValue) => {
                const obj = canvasRef.current?.getObjects().find((item) => item.id === idValue);
                if (obj) canvasRef.current.setActiveObject(obj);
                canvasRef.current?.renderAll();
              }}
              onRename={(idValue, newName) => {
                const obj = canvasRef.current?.getObjects().find((item) => item.id === idValue);
                if (!obj) return;
                obj.set('name', newName);
                captureHistory();
              }}
              onToggleVisibility={(idValue) => {
                const obj = canvasRef.current?.getObjects().find((item) => item.id === idValue);
                if (!obj) return;
                obj.set('visible', !obj.visible);
                canvasRef.current.renderAll();
                syncLayers();
              }}
              onDelete={(idValue) => {
                const obj = canvasRef.current?.getObjects().find((item) => item.id === idValue);
                if (!obj) return;
                canvasRef.current.remove(obj);
                captureHistory();
              }}
            />
          </Stack>
        </Grid>
      </Grid>

      <PreviewPanel preview={previewState.data} />
      <VersionHistoryDialog
        open={showVersions}
        onClose={() => setShowVersions(false)}
        versions={versionState.history}
        onRestore={(version) => dispatch(restoreTemplateVersion({ templateId: id, version }))}
      />
      <ImportExportDialog
        open={showImportExport}
        onClose={() => setShowImportExport(false)}
        onImport={(jsonString) => {
          const parsed = JSON.parse(jsonString);
          setFrontJson(parsed.templateJson?.front || parsed.front || emptyJson);
          setBackJson(parsed.templateJson?.back || parsed.back || emptyJson);
        }}
        onExport={() => {
          const blob = new Blob([JSON.stringify({ templateJson: { front: frontJson, back: backJson } }, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${code}.json`;
          link.click();
          URL.revokeObjectURL(url);
        }}
      />
    </Stack>
  );
};

export default TemplateDesigner;
