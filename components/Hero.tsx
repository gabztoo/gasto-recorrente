import React, { useState, useCallback } from 'react';
import { ArrowRight, ShieldCheck, Search, Repeat, History, UploadCloud, FileCheck, Eye, EyeOff, Shield } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configurar o worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

interface HeroProps {
  onAnalyze: (text: string) => void;
  onDemo: () => void;
  isAnalyzing: boolean;
}

const Hero: React.FC<HeroProps> = ({ onAnalyze, onDemo, isAnalyzing }) => {
  const [text, setText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [fileCount, setFileCount] = useState(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += `\n--- Página ${i} ---\n${pageText}`;
      }
      return fullText;
    } catch (error) {
      console.error("Erro ao ler PDF:", error);
      throw new Error("Não foi possível ler o arquivo PDF.");
    }
  };

  const handleFiles = async (files: File[]) => {
    setIsReadingFile(true);
    let newContent = "";
    
    try {
      for (const file of files) {
        if (file.type === 'application/pdf') {
          const pdfText = await extractTextFromPDF(file);
          newContent += `\n\n=== ${file.name} ===\n` + pdfText;
        } else {
          const textContent = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
          });
          newContent += `\n\n=== ${file.name} ===\n` + textContent;
        }
      }

      setText(prev => prev + newContent);
      setFileCount(prev => prev + files.length);

    } catch (error) {
      alert("Erro ao processar arquivo: " + (error as Error).message);
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onAnalyze(text);
    }
  };

  return (
    <div className="relative pt-12 pb-20">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        {/* Top Badge */}
        <div className="flex justify-center mb-6">
          <div className="bg-surface/50 border border-primary/20 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center space-x-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-mono font-medium text-primary tracking-wide">GASTO_RECORRENTE // ACTIVE</span>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4 leading-tight max-w-5xl">
          Detector de Assinaturas <br className="hidden md:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-light">
            & Custos Recorrentes
          </span>
        </h1>

        <p className="max-w-2xl text-base text-gray-400 mb-8 leading-relaxed">
          Analise seus extratos bancários e descubra quanto você gasta em assinaturas todo mês.
        </p>

        {/* Upload Zone Integrado */}
        <div className="w-full max-w-2xl mb-8">
          <div 
            className={`relative flex flex-col items-center justify-center w-full min-h-[180px] border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
              ${dragActive 
                ? 'border-primary bg-primary/10' 
                : fileCount > 0 
                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                  : 'border-white/20 hover:border-white/40 bg-surface/30 hover:bg-surface/50'
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleFileChange}
              accept=".csv,.txt,.pdf"
              multiple 
            />
            
            <div className="flex flex-col items-center justify-center pointer-events-none p-6">
              {isReadingFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-sm text-primary font-medium">Lendo arquivo...</p>
                </div>
              ) : (
                <>
                  <div className={`mb-3 p-3 rounded-full transition-colors ${
                    fileCount > 0 ? 'bg-emerald-500/20 text-emerald-400' : dragActive ? 'bg-primary/20 text-primary' : 'bg-white/5 text-gray-400'
                  }`}>
                    {fileCount > 0 ? <FileCheck className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
                  </div>
                  <p className="mb-1 text-base text-white font-medium">
                    {fileCount > 0 ? `${fileCount} arquivo(s) carregado(s)` : 'Arraste seu extrato aqui'}
                  </p>
                  <p className="text-xs text-gray-500">
                    ou clique para selecionar • PDF, TXT, CSV
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Privacy Badge */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
            <EyeOff className="w-3 h-3" />
            <span>Seus dados não são salvos. Processamento 100% local.</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full justify-center">
          <button
            onClick={handleSubmit}
            disabled={!text.trim() || isAnalyzing || isReadingFile}
            className={`group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold transition-all duration-200 rounded-lg overflow-hidden
              ${!text.trim() || isAnalyzing || isReadingFile
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20'
              }`}
          >
            <span className="relative flex items-center">
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Analisando...
                </>
              ) : (
                <>
                  Analisar Extrato
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
          
          <button
            onClick={onDemo}
            className="flex items-center space-x-2 text-gray-400 hover:text-white text-sm px-6 py-4 border border-white/10 hover:border-white/20 bg-surface/30 hover:bg-surface/50 rounded-lg transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Exemplo</span>
          </button>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full max-w-6xl">
          
          <div className="tech-panel-highlight p-6 rounded-xl hover:border-primary/30 transition-all group bg-surface/40">
            <div className="w-10 h-10 bg-surfaceHighlight rounded-lg border border-white/5 flex items-center justify-center mb-4 group-hover:border-primary/30 transition-colors">
              <Search className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">Busca Profunda</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Detecta nomes complexos como "Google *Gsuite", "Amzn Digital", "PAG* Spotify".
            </p>
          </div>
          
          <div className="tech-panel-highlight p-6 rounded-xl hover:border-primary/30 transition-all group bg-surface/40">
            <div className="w-10 h-10 bg-surfaceHighlight rounded-lg border border-white/5 flex items-center justify-center mb-4 group-hover:border-primary/30 transition-colors">
              <Repeat className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">Análise de Recorrência</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Diferencia compras únicas de assinaturas mensais ou anuais.
            </p>
          </div>

          <div className="tech-panel-highlight p-6 rounded-xl hover:border-primary/30 transition-all group bg-surface/40">
            <div className="w-10 h-10 bg-surfaceHighlight rounded-lg border border-white/5 flex items-center justify-center mb-4 group-hover:border-primary/30 transition-colors">
              <History className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">Assinaturas Fantasmas</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Identifica serviços esquecidos que continuam cobrando mensalmente.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Hero;
