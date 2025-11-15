import React, { useState, useCallback, useMemo } from 'react';
import { GenerationStyle, LineThickness } from './types';
import { generateImage } from './services/geminiService';

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full animate-spin border-4 border-dashed border-sky-400 border-t-transparent"></div>
        <p className="text-slate-300 font-medium">AI is creating your masterpiece...</p>
    </div>
);

const Header: React.FC = () => (
  <header className="py-6 px-4 text-center">
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
      Stencil & Woodcut AI Artist
    </h1>
    <p className="mt-3 text-lg text-slate-300 max-w-2xl mx-auto">
      Upload a photo and watch as AI transforms it into a production-ready stencil or a classic woodcut artwork.
    </p>
  </header>
);

interface ImageUploaderProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  originalImage: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileChange, originalImage }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div 
      className="w-full aspect-square bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-2xl flex items-center justify-center text-slate-400 hover:border-sky-500 hover:bg-slate-800 transition-all duration-300 cursor-pointer relative overflow-hidden group"
      onClick={handleClick}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={onFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      {originalImage ? (
        <>
            <img src={originalImage} alt="Uploaded preview" className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white font-semibold text-lg">Change Image</span>
            </div>
        </>
      ) : (
        <div className="text-center">
          <UploadIcon className="mx-auto h-12 w-12" />
          <p className="mt-2 font-semibold">Click to upload an image</p>
          <p className="text-sm text-slate-500">PNG, JPG, or WEBP</p>
        </div>
      )}
    </div>
  );
};

interface StyleSelectorProps {
  selectedStyle: GenerationStyle;
  onStyleChange: (style: GenerationStyle) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onStyleChange }) => {
  const styles = [
    { id: GenerationStyle.STENCIL, label: 'Laser-Cut Stencil', description: 'Detailed & clean for laser cutting.' },
    { id: GenerationStyle.STENCIL_V2, label: 'High-Contrast Stencil', description: 'Bold, connected shapes for CNC.' },
    { id: GenerationStyle.STENCIL_V3, label: 'Simple Silhouette', description: 'Simplified for max cut-ability.' },
    { id: GenerationStyle.WOODCUT, label: 'Woodcut Art', description: 'Artistic carved look on a wood texture.' },
  ];

  return (
    <div className="w-full space-y-4">
        <h3 className="text-lg font-semibold text-white">Choose a Style</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {styles.map((style) => (
            <div
                key={style.id}
                onClick={() => onStyleChange(style.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedStyle === style.id
                    ? 'border-sky-500 bg-sky-500/10'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-500'
                }`}
            >
                <p className={`font-bold ${selectedStyle === style.id ? 'text-sky-400' : 'text-white'}`}>{style.label}</p>
                <p className="text-sm text-slate-400">{style.description}</p>
            </div>
            ))}
        </div>
    </div>
  );
};

interface ThicknessSelectorProps {
    selectedThickness: LineThickness;
    onThicknessChange: (thickness: LineThickness) => void;
}

const ThicknessSelector: React.FC<ThicknessSelectorProps> = ({ selectedThickness, onThicknessChange }) => {
    const thicknesses = [
        { id: LineThickness.THIN, label: 'Thin' },
        { id: LineThickness.MEDIUM, label: 'Medium' },
        { id: LineThickness.BOLD, label: 'Bold' },
    ];

    return (
        <div className="w-full space-y-4">
            <h3 className="text-lg font-semibold text-white">Line Thickness</h3>
            <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                {thicknesses.map((thickness) => (
                    <button
                        key={thickness.id}
                        onClick={() => onThicknessChange(thickness.id)}
                        className={`w-full text-center py-2.5 rounded-md text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                            selectedThickness === thickness.id
                                ? 'bg-sky-500 text-white'
                                : 'text-slate-300 hover:bg-slate-700/50'
                        }`}
                    >
                        {thickness.label}
                    </button>
                ))}
            </div>
        </div>
    );
};


interface ResultDisplayProps {
    isLoading: boolean;
    error: string | null;
    generatedImage: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, error, generatedImage }) => {
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'generated-artwork.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
    
  return (
    <div className="w-full aspect-square bg-slate-800/50 border-2 border-slate-700 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden">
        {isLoading && <Loader />}
        {!isLoading && error && <p className="text-center text-red-400 font-medium px-4">{error}</p>}
        {!isLoading && !error && generatedImage && (
            <>
                <img src={generatedImage} alt="Generated stencil" className="w-full h-full object-contain" />
                <button
                    onClick={handleDownload}
                    className="absolute bottom-4 right-4 bg-sky-500 text-white font-bold py-2 px-4 rounded-full hover:bg-sky-600 transition-transform duration-200 active:scale-95 flex items-center gap-2 shadow-lg"
                >
                    <DownloadIcon className="h-5 w-5" />
                    Download
                </button>
            </>
        )}
        {!isLoading && !error && !generatedImage && (
            <div className="text-center text-slate-500">
                <p className="text-xl font-medium">Your artwork will appear here</p>
                <p>Upload an image and click "Generate"</p>
            </div>
        )}
    </div>
  );
};

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImageMimeType, setOriginalImageMimeType] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [style, setStyle] = useState<GenerationStyle>(GenerationStyle.STENCIL);
  const [thickness, setThickness] = useState<LineThickness>(LineThickness.MEDIUM);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if(file.size > 4 * 1024 * 1024) { // 4MB limit
          setError("Image size should be less than 4MB.");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setOriginalImageMimeType(file.type);
        setGeneratedImage(null);
        setError(null);
      };
      reader.onerror = () => {
          setError("Failed to read the image file.");
      }
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGenerateClick = useCallback(async () => {
    if (!originalImage || !originalImageMimeType) {
        setError("Please upload an image first.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const base64Data = originalImage.split(',')[1];
      const resultBase64 = await generateImage(base64Data, originalImageMimeType, style, thickness);
      setGeneratedImage(`data:image/png;base64,${resultBase64}`);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, originalImageMimeType, style, thickness]);

  const isGenerateDisabled = useMemo(() => isLoading || !originalImage, [isLoading, originalImage]);
  const isStencilStyle = useMemo(() =>
    [GenerationStyle.STENCIL, GenerationStyle.STENCIL_V2, GenerationStyle.STENCIL_V3].includes(style),
    [style]
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Controls Column */}
          <div className="flex flex-col gap-6">
            <ImageUploader onFileChange={handleFileChange} originalImage={originalImage} />
            <StyleSelector selectedStyle={style} onStyleChange={setStyle} />
            {isStencilStyle && <ThicknessSelector selectedThickness={thickness} onThicknessChange={setThickness} />}
            <button
              onClick={handleGenerateClick}
              disabled={isGenerateDisabled}
              className="w-full py-4 px-6 text-xl font-bold rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 disabled:scale-100 shadow-lg disabled:shadow-none"
            >
              {isLoading ? 'Generating...' : '✨ Generate Artwork'}
            </button>
          </div>

          {/* Result Column */}
          <div className="flex flex-col">
            <ResultDisplay 
              isLoading={isLoading}
              error={error}
              generatedImage={generatedImage}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
