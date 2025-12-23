import React, { useState, useEffect, useRef } from 'react';
import { Download, Upload } from 'lucide-react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      // Text settings
      ctx.fillStyle = 'white';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.textAlign = 'left';

      // Draw Name
      ctx.font = 'bold 50px Inter, sans-serif';
      const name = `${firstName} ${lastName}`.trim() || 'Dein Name';
      ctx.fillText(name, 80, 100);

      // Draw Profession
      ctx.font = '30px Inter, sans-serif';
      const prof = profession.trim() || 'Dein Beruf';
      ctx.fillText(prof, 80, 150);
    };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setCustomBgUrl(url);
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

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div>
          <h1>Teams Backgrounds</h1>
          <p className="info-text">Erstelle deinen personalisierten Hintergrund</p>
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
          <label>Wähle einen Hintergrund oder lade einen hoch</label>
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
          </div>

          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <div
            className={`upload-area ${customBgUrl ? 'active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="icon" size={24} />
            <span>Eigenes Bild hochladen</span>
          </div>
        </div>

        <button className="download-btn" onClick={handleDownload}>
          <Download size={20} />
          Hintergrund herunterladen
        </button>
      </aside>

      <main className="main-content">
        <div className="preview-container">
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
          />
        </div>
        <div className="info-text">
          <p>Tipp: Die Vorschau ist im Format 1920x1080 optimiert für Microsoft Teams.</p>
        </div>
      </main>
    </div>
  );
}

export default App;
