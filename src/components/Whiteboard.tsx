"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Square, Circle, Eraser, Trash2, Download, Undo, MousePointer2 } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface Shape {
  type: 'pencil' | 'rectangle' | 'circle';
  points: Point[];
  color: string;
  width: number;
}

interface WhiteboardProps {
  initialShapes?: Shape[];
  onUpdate?: (shapes: Shape[], imageData: string) => void;
  readOnly?: boolean;
}

const Whiteboard = ({ initialShapes = [], onUpdate, readOnly = false }: WhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pencil' | 'rectangle' | 'circle' | 'eraser' | 'select'>('pencil');
  const [color, setColor] = useState('#3b82f6'); // Blue 500
  const [width, setWidth] = useState(2);
  const [shapes, setShapes] = useState<Shape[]>(initialShapes);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  
  // Selection and Moving state
  const [selectedShapeIndex, setSelectedShapeIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null); // 'tl', 'tr', 'bl', 'br' for rect, 'r' for circle

  const getResizeHandles = (shape: Shape) => {
    if (shape.type === 'rectangle') {
      const start = shape.points[0];
      const end = shape.points[shape.points.length - 1];
      return {
        tl: { x: Math.min(start.x, end.x), y: Math.min(start.y, end.y) },
        tr: { x: Math.max(start.x, end.x), y: Math.min(start.y, end.y) },
        bl: { x: Math.min(start.x, end.x), y: Math.max(start.y, end.y) },
        br: { x: Math.max(start.x, end.x), y: Math.max(start.y, end.y) },
      };
    } else if (shape.type === 'circle') {
      const center = shape.points[0];
      const edge = shape.points[shape.points.length - 1];
      const radius = Math.sqrt(Math.pow(edge.x - center.x, 2) + Math.pow(edge.y - center.y, 2));
      return {
        r: { x: center.x + radius, y: center.y }
      };
    }
    return {};
  };

  const isPointInHandle = (pos: Point, handle: Point): boolean => {
    const size = 10;
    return pos.x >= handle.x - size && pos.x <= handle.x + size &&
           pos.y >= handle.y - size && pos.y <= handle.y + size;
  };

  useEffect(() => {
    if (initialShapes.length > 0 && shapes.length === 0) {
      setShapes(initialShapes);
    }
  }, [initialShapes]);

  // Notify parent of updates
  useEffect(() => {
    if (onUpdate && !isDrawing) {
      const canvas = canvasRef.current;
      if (canvas) {
        onUpdate(shapes, canvas.toDataURL());
      }
    }
  }, [shapes, isDrawing, onUpdate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match display size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        redraw();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [shapes]);

  const redraw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    [...shapes, ...(currentShape ? [currentShape] : [])].forEach(drawShape);

    // Draw selection highlight
    if (selectedShapeIndex !== null && shapes[selectedShapeIndex]) {
      const shape = shapes[selectedShapeIndex];
      const points = shape.points;
      const minX = Math.min(...points.map(p => p.x)) - 5;
      const maxX = Math.max(...points.map(p => p.x)) + 5;
      const minY = Math.min(...points.map(p => p.y)) - 5;
      const maxY = Math.max(...points.map(p => p.y)) + 5;

      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
      ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
      ctx.setLineDash([]);

      // Draw resize handles
      if (!readOnly) {
        const handles = getResizeHandles(shape);
        ctx.fillStyle = '#3b82f6';
        Object.values(handles).forEach((h: any) => {
          ctx.fillRect(h.x - 4, h.y - 4, 8, 8);
        });
      }
    }
  };

  const drawShape = (shape: Shape) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = shape.color;
    ctx.lineWidth = shape.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (shape.type === 'pencil') {
      ctx.beginPath();
      shape.points.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    } else if (shape.type === 'rectangle') {
      if (shape.points.length < 2) return;
      const start = shape.points[0];
      const end = shape.points[shape.points.length - 1];
      ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
    } else if (shape.type === 'circle') {
      if (shape.points.length < 2) return;
      const start = shape.points[0];
      const end = shape.points[shape.points.length - 1];
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const getMousePos = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const isPointInShape = (pos: Point, shape: Shape): boolean => {
    if (shape.type === 'rectangle') {
      const start = shape.points[0];
      const end = shape.points[shape.points.length - 1];
      const minX = Math.min(start.x, end.x);
      const maxX = Math.max(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const maxY = Math.max(start.y, end.y);
      return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY;
    } else if (shape.type === 'circle') {
      const start = shape.points[0];
      const end = shape.points[shape.points.length - 1];
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      const distance = Math.sqrt(Math.pow(pos.x - start.x, 2) + Math.pow(pos.y - start.y, 2));
      return distance <= radius;
    } else if (shape.type === 'pencil') {
      // Basic bounding box check for pencil for easier selection
      const points = shape.points;
      const minX = Math.min(...points.map(p => p.x)) - 10;
      const maxX = Math.max(...points.map(p => p.x)) + 10;
      const minY = Math.min(...points.map(p => p.y)) - 10;
      const maxY = Math.max(...points.map(p => p.y)) + 10;
      return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY;
    }
    return false;
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (readOnly) return;
    const pos = getMousePos(e);

    if (tool === 'select') {
      // 1. Check if clicking on a resize handle of the CURRENTLY selected shape
      if (selectedShapeIndex !== null) {
        const handles = getResizeHandles(shapes[selectedShapeIndex]);
        for (const [key, handlePos] of Object.entries(handles)) {
          if (isPointInHandle(pos, handlePos as Point)) {
            setIsResizing(true);
            setResizeHandle(key);
            setIsDrawing(true);
            return;
          }
        }
      }

      // 2. Find if clicking on a NEW shape
      for (let i = shapes.length - 1; i >= 0; i--) {
        if (isPointInShape(pos, shapes[i])) {
          setSelectedShapeIndex(i);
          setDragOffset({
             x: pos.x - shapes[i].points[0].x,
             y: pos.y - shapes[i].points[0].y
          });
          setIsDrawing(true);
          setIsResizing(false);
          return;
        }
      }
      setSelectedShapeIndex(null);
      return;
    }

    setIsDrawing(true);
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || '#121212';
    setCurrentShape({
      type: tool === 'eraser' ? 'pencil' : tool,
      points: [pos],
      color: tool === 'eraser' ? bgColor : color,
      width: tool === 'eraser' ? 20 : width,
    });
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (readOnly || !isDrawing) return;
    const pos = getMousePos(e);

    if (tool === 'select' && selectedShapeIndex !== null) {
      const newShapes = [...shapes];
      const shape = newShapes[selectedShapeIndex];

      if (isResizing && resizeHandle) {
        if (shape.type === 'rectangle') {
          const start = { ...shape.points[0] };
          const end = { ...shape.points[shape.points.length - 1] };
          
          if (resizeHandle === 'tl') { start.x = pos.x; start.y = pos.y; }
          else if (resizeHandle === 'tr') { end.x = pos.x; start.y = pos.y; }
          else if (resizeHandle === 'bl') { start.x = pos.x; end.y = pos.y; }
          else if (resizeHandle === 'br') { end.x = pos.x; end.y = pos.y; }
          
          newShapes[selectedShapeIndex] = { ...shape, points: [start, end] };
        } else if (shape.type === 'circle') {
          // Move the edge point to resize radius
          newShapes[selectedShapeIndex] = { ...shape, points: [shape.points[0], pos] };
        }
        setShapes(newShapes);
        redraw();
        return;
      }

      // Moving logic
      const dx = pos.x - (shapes[selectedShapeIndex].points[0].x + dragOffset.x);
      const dy = pos.y - (shapes[selectedShapeIndex].points[0].y + dragOffset.y);
      
      newShapes[selectedShapeIndex] = {
        ...newShapes[selectedShapeIndex],
        points: newShapes[selectedShapeIndex].points.map(p => ({
          x: p.x + dx,
          y: p.y + dy
        }))
      };
      setShapes(newShapes);
      redraw();
      return;
    }

    if (!currentShape) return;

    if (tool === 'pencil' || tool === 'eraser') {
      setCurrentShape({
        ...currentShape,
        points: [...currentShape.points, pos]
      });
    } else {
      setCurrentShape({
        ...currentShape,
        points: [currentShape.points[0], pos]
      });
    }
    redraw();
  };

  const stopDrawing = () => {
    if (tool === 'select') {
      setIsDrawing(false);
      setIsResizing(false);
      setResizeHandle(null);
      return;
    }

    if (currentShape) {
      setShapes([...shapes, currentShape]);
    }
    setIsDrawing(false);
    setCurrentShape(null);
  };

  const clear = () => {
    setShapes([]);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const undo = () => {
    setShapes(shapes.slice(0, -1));
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'system-design-diagram.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className={`flex flex-col w-full bg-[var(--background)] relative overflow-hidden rounded-lg border border-[var(--card-border)] ${readOnly ? 'h-[400px]' : 'h-[500px]'}`}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 p-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-2xl backdrop-blur-md">
          <button 
            onClick={() => setTool('select')}
            className={`p-2 rounded-lg transition-colors ${tool === 'select' ? 'bg-blue-600 text-white' : 'text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5'}`}
            title="Select & Move"
          >
            <MousePointer2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setTool('pencil')}
            className={`p-2 rounded-lg transition-colors ${tool === 'pencil' ? 'bg-blue-600 text-white' : 'text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5'}`}
            title="Pencil"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setTool('rectangle')}
            className={`p-2 rounded-lg transition-colors ${tool === 'rectangle' ? 'bg-blue-600 text-white' : 'text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5'}`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setTool('circle')}
            className={`p-2 rounded-lg transition-colors ${tool === 'circle' ? 'bg-blue-600 text-white' : 'text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5'}`}
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-blue-600 text-white' : 'text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5'}`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-6 bg-[var(--card-border)] mx-1" />
          <div className="flex items-center gap-1.5 px-2">
            {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#ffffff', '#000000'].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full border border-[var(--card-border)] transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-blue-500' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="w-[1px] h-6 bg-[var(--card-border)] mx-1" />
          <button onClick={undo} className="p-2 text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors" title="Undo">
            <Undo className="w-4 h-4" />
          </button>
          <button onClick={clear} className="p-2 text-[var(--foreground)]/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Clear All">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={download} className="p-2 text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5 rounded-lg transition-colors" title="Download">
            <Download className="w-4 h-4" />
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="flex-1 cursor-crosshair touch-none"
      />
      
      <div className="absolute bottom-4 right-4 text-[10px] text-white/20 uppercase tracking-widest pointer-events-none">
        System Design Whiteboard
      </div>
    </div>
  );
};

export default Whiteboard;
