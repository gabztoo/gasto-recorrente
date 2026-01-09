import React, { useState, useCallback } from 'react';
import { UploadCloud, Shield, EyeOff, ScanLine, FileCheck, Terminal } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configurar o worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

interface UploadSectionProps {
  onAnalyze: (text: string) => void;
  isAnalyzing: boolean;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onAnalyze, isAnalyzing }) => {
  const [text, setText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [fileCount, setFileCount] = useState(0);
  const [privacyMode, setPrivacyMode] = useState(true);

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
      throw new Error("Não foi possível ler o arquivo PDF. Verifique se não está protegido por senha.");
    }
  };

  const handleFiles = async (files: File[]) => {
    setIsReadingFile(true);
    let newContent = "";
    
    try {
      for (const file of files) {
        if (file.type === 'application/pdf') {
          const pdfText = await extractTextFromPDF(file);
          newContent += `\n\n=== INÍCIO FATURA: ${file.name} ===\n` + pdfText;
        } else {
          const textContent = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
          });
          newContent += `\n\n=== INÍCIO FATURA: ${file.name} ===\n` + textContent;
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
        <div>
           <h2 className="text-2xl font-semibold text-white">Carregar Dados</h2>
           <p className="text-sm text-gray-500 font-mono mt-1">Selecione a fonte de dados para ingestão</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-primary bg-primary/10 px-3 py-1.5 rounded border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>SECURE_CONN_ESTABLISHED</span>
        </div>
      </div>

      <div className="tech-panel rounded-xl overflow-hidden shadow-2xl">
        <div className="p-8">
          
          {/* Privacy Banner */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-emerald-500/20 mr-4">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-emerald-400 text-sm font-semibold flex items-center">
                  <EyeOff className="w-4 h-4 mr-2" />
                  Sua privacidade é nossa prioridade
                </h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Seus arquivos <strong className="text-white">não são salvos</strong> em nenhum servidor. 
                  O processamento é feito localmente no seu navegador e os dados são <strong className="text-white">descartados imediatamente</strong> após a análise. 
                  Nós nunca teremos acesso ao conteúdo do seu extrato.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Upload Zone */}
            <div className="flex flex-col">
              <label className="text-xs font-mono text-gray-400 mb-2 uppercase">Arquivo Fonte (PDF/TXT)</label>
              <div 
                className={`flex-1 relative flex flex-col items-center justify-center w-full min-h-[250px] border border-dashed rounded-lg cursor-pointer transition-all duration-200
                  ${dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-white/20 hover:border-white/40 bg-background/50 hover:bg-background/80'
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
                
                <div className="flex flex-col items-center justify-center pointer-events-none relative z-20">
                  {isReadingFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-xs text-primary font-mono">PROCESSANDO_BUFFER...</p>
                    </div>
                  ) : (
                    <>
                      <div className={`mb-4 transition-colors ${dragActive ? 'text-primary' : 'text-gray-500'}`}>
                        {fileCount > 0 ? <FileCheck className="w-10 h-10" /> : <UploadCloud className="w-10 h-10" />}
                      </div>
                      <p className="mb-1 text-sm text-white font-medium">
                        {fileCount > 0 ? `${fileCount} arquivos carregados` : 'Arraste ou clique para upload'}
                      </p>
                      <p className="text-xs text-gray-600 font-mono">
                        .PDF, .TXT, .CSV suportados
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Manual Paste Zone */}
            <div className="flex flex-col">
              <label className="text-xs font-mono text-gray-400 mb-2 uppercase">Input Manual (Raw Data)</label>
              <div className="relative flex-1 group">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full h-full min-h-[250px] bg-background border border-white/20 rounded-lg p-4 text-gray-300 placeholder-gray-700 focus:ring-1 focus:ring-primary focus:border-primary transition-all font-mono text-xs resize-none"
                    placeholder={`COLE O CONTEÚDO AQUI...
--------------------------
12/03 Netflix.com ... 55,90
14/03 Uber *Trip .... 14,20`}
                />
                <div className="absolute bottom-3 right-3 opacity-50">
                    <Terminal className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
             <button
              onClick={() => onAnalyze(text)}
              disabled={!text.trim() || isAnalyzing || isReadingFile}
              className={`w-full py-4 rounded-lg text-sm font-semibold tracking-wide uppercase transition-all flex items-center justify-center
                ${!text.trim() || isAnalyzing || isReadingFile
                  ? 'bg-surfaceHighlight text-gray-600 cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20'}
              `}
            >
              {isAnalyzing ? (
                <>
                  <ScanLine className="animate-spin w-4 h-4 mr-3" />
                  <span>Executando Análise Heurística...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Processamento</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UploadSection;