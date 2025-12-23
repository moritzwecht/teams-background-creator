import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload, Sun, Moon } from 'lucide-react';
import './index.css';

const RESOLVED_BACKGROUNDS = [
  { id: 'abstract', url: '/backgrounds/modern_abstract_background_1766484707661.png', name: 'Modern Abstract' },
  { id: 'office', url: '/backgrounds/professional_office_background_1766484723087.png', name: 'Professional Office' },
  { id: 'gradient', url: '/backgrounds/minimalist_gradient_background_v2_1766484735796.png', name: 'Minimalist Gradient' }
];

function App() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profession, setProfession] = useState('');
  const [selectedBgUrl, setSelectedBgUrl] = useState(RESOLVED_BACKGROUNDS[0].url);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-mode' : '';
  }, [theme]);

  useEffect(() => {
    drawCanvas();
  }, [firstName, lastName, profession, selectedBgUrl, customBgUrl]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = customBgUrl || selectedBgUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate aspect ratio for background image to fill 1920x1080
      const canvasAspect = 1920 / 1080;
      const imgAspect = img.width / img.height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgAspect > canvasAspect) {
        drawHeight = 1080;
        drawWidth = 1080 * imgAspect;
        offsetX = (1920 - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = 1920;
        drawHeight = 1920 / imgAspect;
        offsetX = 0;
        offsetY = (1080 - drawHeight) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      // Analyze background brightness in the text area
      const textAreaX = 80;
      const textAreaY = 50;
      const textAreaWidth = 600;
      const textAreaHeight = 150;

      let isDark = true;
      try {
        const imageData = ctx.getImageData(textAreaX, textAreaY, textAreaWidth, textAreaHeight);
        const data = imageData.data;
        let brightness = 0;
        for (let i = 0; i < data.length; i += 4) {
          // Standard luminance formula
          brightness += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        }
        const avgBrightness = brightness / (data.length / 4);
        isDark = avgBrightness < 128; // Threshold (0-255)
      } catch (e) {
        // Fallback if getImageData fails (e.g. CORS)
        console.warn('Could not analyze brightness, falling back to white text', e);
      }

      // Ensure fonts are loaded before drawing text
      document.fonts.ready.then(() => {
        // Text settings
        ctx.fillStyle = isDark ? 'white' : '#1e293b';
        ctx.shadowColor = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.3)';
        ctx.shadowBlur = isDark ? 10 : 2;
        ctx.textAlign = 'left';

        // Draw Name
        ctx.font = 'bold 50px "Noto Serif", serif';
        const name = `${firstName} ${lastName}`.trim() || '[Dein Name]';
        ctx.fillText(name, 80, 100);

        // Draw Profession
        ctx.font = '30px "Noto Sans", sans-serif';
        const prof = profession.trim() || '[Dein Beruf]';
        ctx.fillText(prof, 80, 150);
      });
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setCustomBgUrl(url);
        setSelectedBgUrl(''); // Deselect preset if custom is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `Teams-Background-${firstName}-${lastName}.png`.replace(/\s+/g, '-');
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="header-row">
          <h1>Teams Background</h1>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>

        <div className="input-group">
          <label htmlFor="firstName">Vorname</label>
          <input
            id="firstName"
            type="text"
            placeholder="z.B. Max"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="lastName">Nachname</label>
          <input
            id="lastName"
            type="text"
            placeholder="z.B. Mustermann"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label htmlFor="profession">Beruf</label>
          <input
            id="profession"
            type="text"
            placeholder="z.B. Software Engineer"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
          />
        </div>

        <div className="background-selection">
          <div className="background-grid">
            {RESOLVED_BACKGROUNDS.map((bg) => (
              <div
                key={bg.id}
                className={`background-item ${!customBgUrl && selectedBgUrl === bg.url ? 'active' : ''}`}
                onClick={() => {
                  setSelectedBgUrl(bg.url);
                  setCustomBgUrl(null);
                }}
              >
                <img src={bg.url} alt={bg.name} title={bg.name} />
              </div>
            ))}
            <div
              className={`background-item upload-area ${customBgUrl ? 'active' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="icon" size={20} />
              <span>Bild hochladen</span>
            </div>
          </div>

          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </div>
      </aside>

      <main className="main-content">
        <div className="preview-container">
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
          />
        </div>

        <button className="download-btn" onClick={handleDownload}>
          <Download size={20} />
          Hintergrund herunterladen
        </button>
      </main>
    </div>
  );
}

export default App;
