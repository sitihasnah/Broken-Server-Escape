
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, Code2, BookOpen, ChevronRight, RefreshCw, HelpCircle, Trophy, User, Monitor, ShieldCheck, Info, FileCode, Archive, Sparkles, CheckCircle2 } from 'lucide-react';
import { Act, GameState, FileSystem, ViewState } from './types';
import { LEVELS, INITIAL_FILESYSTEM } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    view: 'INTRO',
    currentLevelIndex: 0,
    score: 1000,
    hintsUsed: 0,
    startTime: Date.now(),
    isFinished: false,
    logs: ['[SYSTEM] Server simulation initialized...', '[SYSTEM] Waiting for PHP execution...'],
    fileSystem: { ...INITIAL_FILESYSTEM },
    collectedClues: [],
    levelCleared: false
  });

  const [code, setCode] = useState(LEVELS[0].starterCode);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isReferenceOpen, setIsReferenceOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentLevel = LEVELS[gameState.currentLevelIndex];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [gameState.logs]);

  const addLog = (msg: string) => {
    setGameState(prev => ({
      ...prev,
      logs: [...prev.logs, msg]
    }));
  };

  const handleRun = useCallback(() => {
    setIsProcessing(true);
    addLog(`> Running PHP script...`);

    setTimeout(() => {
      let passed = true;
      let error = "";

      if (!code.trim().startsWith('<?php')) {
        passed = false;
        error = "PHP Parse error: syntax error, unexpected '...', expecting '<?php'";
      } else if (!code.includes(';')) {
        passed = false;
        error = "PHP Parse error: syntax error, unexpected end of file, expecting ';'";
      } else {
        for (const rule of currentLevel.validationRules) {
          if (!rule.check(code, gameState.fileSystem, gameState.logs)) {
            passed = false;
            error = `PHP Warning: ${rule.message}`;
            break;
          }
        }
      }

      if (passed) {
        addLog(`[OUTPUT]: ${currentLevel.successMessage}`);
        addLog(`[SYSTEM]: Task Objectives Met. Security layer cleared.`);
        
        if (currentLevel.id === 3 || currentLevel.id === 4) {
           setGameState(prev => ({
             ...prev,
             fileSystem: { ...prev.fileSystem, 'evidence.txt': 'INTRUDER_FOUND' }
           }));
        }

        setGameState(prev => ({ ...prev, levelCleared: true }));
        setIsProcessing(false);
      } else {
        addLog(error);
        setIsProcessing(false);
      }
    }, 800);
  }, [code, currentLevel, gameState.fileSystem, gameState.currentLevelIndex]);

  const handleNextLevel = () => {
    if (gameState.currentLevelIndex < LEVELS.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentLevelIndex: prev.currentLevelIndex + 1,
        logs: [`[SYSTEM] New task initialized: Level ${prev.currentLevelIndex + 2}`],
        score: prev.score + 100,
        levelCleared: false
      }));
      setCode(LEVELS[gameState.currentLevelIndex + 1].starterCode);
      setShowHint(false);
    } else {
      setGameState(prev => ({ ...prev, isFinished: true, view: 'FINISHED' }));
    }
  };

  const collectClue = (clue: string) => {
    if (!gameState.collectedClues.includes(clue)) {
      setGameState(prev => ({
        ...prev,
        collectedClues: [...prev.collectedClues, clue],
        score: prev.score + 50
      }));
      addLog(`[INVENTORY] New Clue Secured: ${clue} (+50 score)`);
    }
  };

  const useHint = () => {
    if (!showHint) {
      setShowHint(true);
      setGameState(prev => ({
        ...prev,
        hintsUsed: prev.hintsUsed + 1,
        score: Math.max(0, prev.score - 50)
      }));
    }
  };

  const startGame = () => {
    setGameState(prev => ({ ...prev, view: 'GAME', startTime: Date.now() }));
  };

  const restartGame = () => {
    setGameState({
      view: 'INTRO',
      currentLevelIndex: 0,
      score: 1000,
      hintsUsed: 0,
      startTime: Date.now(),
      isFinished: false,
      logs: ['[SYSTEM] Server simulation reset.', '[SYSTEM] Waiting for PHP execution...'],
      fileSystem: { ...INITIAL_FILESYSTEM },
      collectedClues: [],
      levelCleared: false
    });
    setCode(LEVELS[0].starterCode);
    setShowHint(false);
  };

  const ReferenceSheet = () => (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: 'readfile($f)', desc: 'Direct echo of file content.', code: 'readfile("note.txt");' },
          { name: 'fopen($f, $m)', desc: "Modes: 'r' (read), 'w' (write), 'a' (append).", code: '$f = fopen("data.txt", "r");' },
          { name: 'fread($h, $l)', desc: 'Read up to $l bytes.', code: 'fread($f, 1024);' },
          { name: 'fgets($h)', desc: 'Get a single line.', code: 'fgets($f);' },
          { name: 'fwrite($h, $s)', desc: 'Write binary string.', code: 'fwrite($f, "Data");' },
          { name: 'feof($h)', desc: 'Test for end-of-file.', code: 'while(!feof($f)) { ... }' }
        ].map((item, i) => (
          <div key={i} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" /> {item.name}
            </h3>
            <p className="text-xs text-slate-400 mb-2">{item.desc}</p>
            <code className="text-[10px] block bg-slate-950 p-2 rounded text-amber-300">{item.code}</code>
          </div>
        ))}
      </div>
    </div>
  );

  const CollectionSheet = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">Security items found in server memory:</p>
      {gameState.collectedClues.length === 0 ? (
        <div className="p-12 text-center text-slate-600 italic text-sm border-2 border-dashed border-slate-800 rounded-2xl">
          Archive is currently empty.<br/>Run scripts to find hidden tokens.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {gameState.collectedClues.map((clue, i) => (
            <div key={i} className="flex items-center gap-4 bg-slate-800 p-4 rounded-xl border border-emerald-500/20 group transition-all hover:border-emerald-500/60 hover:bg-slate-700 animate-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Archive className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-mono text-emerald-100 block">{clue}</span>
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Verified Token</span>
              </div>
              <Sparkles className="w-4 h-4 text-emerald-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (gameState.view === 'INTRO') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-4xl w-full bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 p-10 bg-gradient-to-br from-emerald-900/20 to-transparent flex flex-col justify-center">
            <Terminal className="w-16 h-16 text-emerald-500 mb-6" />
            <h1 className="text-4xl font-black text-white mb-4 leading-tight tracking-tight">Escape the<br/><span className="text-emerald-500">Broken Server</span></h1>
            <p className="text-slate-400 mb-8 leading-relaxed">Master PHP file handling. Solve logic puzzles, collect hidden tokens from the logs, and repair the system breach.</p>
            <div className="space-y-4 mb-10">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Study reference notes
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Click tokens in output to collect
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Complete all acts to escape
              </div>
            </div>
            <button 
              onClick={() => setGameState(prev => ({ ...prev, view: 'STUDY' }))}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              Start Mission Briefing <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="hidden md:block w-1/2 bg-slate-800/50 p-10 border-l border-slate-800">
             <div className="h-full border border-emerald-500/10 rounded-2xl p-6 bg-slate-950/50 relative overflow-hidden group flex items-center justify-center">
                <div className="font-mono text-emerald-500/60 text-xs leading-relaxed space-y-2">
                    <p className="animate-pulse">[SYSTEM_BOOT] ... OK</p>
                    <p>[FILE_HANDLE] ... LOADED</p>
                    <p>[SECURITY_LVL] ... FOUNDATION</p>
                    <p className="text-white font-bold animate-bounce mt-4 underline underline-offset-4">CLICK TO COLLECT CLUES</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.view === 'STUDY') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
          <div className="p-8 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-emerald-500" />
              <h2 className="text-2xl font-bold text-white">PHP File Handling Reference</h2>
            </div>
            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">Study Phase</span>
          </div>
          <div className="flex-1 overflow-y-auto p-8 max-h-[60vh]">
            <ReferenceSheet />
          </div>
          <div className="p-8 bg-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-800">
            <p className="text-xs text-slate-500 max-w-sm">Master these functions to recover the security tokens. These will be available in the sidebar during your mission.</p>
            <button 
              onClick={startGame}
              className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-emerald-900/20"
            >
              Enter Server
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.view === 'FINISHED') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-slate-800 rounded-2xl shadow-2xl border border-emerald-500/30 p-8 text-center">
          <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">System Fully Restored</h1>
          <p className="text-slate-400 mb-8">You've escaped the broken server and recovered all critical tokens.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
            {gameState.collectedClues.map((c, i) => (
              <div key={i} className="p-2 bg-slate-950 rounded border border-emerald-500/20 text-emerald-500 font-mono text-[10px] truncate">
                {c}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Score</p>
              <p className="text-2xl font-mono text-emerald-400">{gameState.score}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Clues</p>
              <p className="text-2xl font-mono text-amber-400">{gameState.collectedClues.length}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
              <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Time</p>
              <p className="text-2xl font-mono text-blue-400">{Math.floor((Date.now() - gameState.startTime) / 60000)}m</p>
            </div>
          </div>
          <button onClick={restartGame} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-emerald-900/40">Restart Mission</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-200 selection:bg-emerald-500/30">
      {/* Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">Escape the Broken Server</h1>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Act {currentLevel.act.replace('_', ' ')} • Task {currentLevel.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setIsReferenceOpen(!isReferenceOpen); setIsCollectionOpen(false); }} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-xs font-bold ${isReferenceOpen ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
          >
            <BookOpen className="w-4 h-4" /> Study Notes
          </button>
          <button 
            onClick={() => { setIsCollectionOpen(!isCollectionOpen); setIsReferenceOpen(false); }} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-xs font-bold ${isCollectionOpen ? 'bg-amber-600/20 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
          >
            <Archive className="w-4 h-4" /> Collection ({gameState.collectedClues.length})
          </button>
          <div className="h-8 w-px bg-slate-800 mx-1" />
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Current Score</span>
            <span className="text-emerald-400 font-mono font-bold leading-none">{gameState.score}</span>
          </div>
        </div>
      </header>

      {/* Main Game Layout */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Left Panel */}
        <section className="w-1/4 min-w-[300px] border-r border-slate-800 flex flex-col overflow-y-auto bg-slate-900/10">
          <div className="p-6 space-y-8">
            <div>
              <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-emerald-500" /> Mission Brief
              </h2>
              <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/30 text-slate-300 text-sm leading-relaxed shadow-inner">
                {currentLevel.mission}
              </div>
            </div>
            <div>
              <h2 className="text-[11px] font-black text-amber-500/70 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4" /> Tactical Advice
              </h2>
              <div className="bg-amber-900/5 p-5 rounded-2xl border border-amber-900/20 text-amber-200/70 italic text-sm">
                "{currentLevel.navigatorClue}"
              </div>
            </div>
            <div className="pt-4">
              <button 
                onClick={useHint} 
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all border ${showHint ? 'bg-slate-900 border-slate-800 text-slate-600 cursor-default' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300 active:scale-95'}`}
              >
                {showHint ? "Hint revealed" : "Reveal Logic Hint (-50 pts)"}
              </button>
              {showHint && (
                <div className="mt-3 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-xl text-xs font-mono text-emerald-300 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 mb-2 text-[10px] text-emerald-500 uppercase font-bold tracking-widest opacity-60">
                    <Info className="w-3 h-3" /> Syntax Suggestion
                  </div>
                  {currentLevel.hint}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Center Panel */}
        <section className="flex-1 flex flex-col min-w-[400px]">
          <div className="h-10 border-b border-slate-800 bg-slate-900/40 px-4 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-mono text-slate-400">script.php</span>
          </div>
          <div className="flex-1 relative group bg-slate-950">
            <textarea 
              value={code} 
              onChange={(e) => setCode(e.target.value)} 
              className="w-full h-full bg-transparent p-8 font-mono text-sm resize-none focus:outline-none text-emerald-50/90 leading-relaxed placeholder:text-slate-700" 
              spellCheck={false}
              placeholder="// Write your PHP file handling logic here..."
            />
            
            {gameState.levelCleared ? (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[4px] flex items-center justify-center p-8 animate-in fade-in duration-500 z-30">
                <div className="bg-slate-900 border border-emerald-500/30 p-12 rounded-[2.5rem] shadow-2xl flex flex-col items-center gap-6 transform scale-100 animate-in zoom-in-95">
                   <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 mb-2 relative">
                     <ShieldCheck className="w-12 h-12" />
                     <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-20" />
                   </div>
                   <h2 className="text-3xl font-black text-white tracking-tight">Access Granted</h2>
                   <p className="text-slate-400 text-center max-w-xs text-sm">Security layer bypassed. The task objective has been successfully met.</p>
                   <button 
                    onClick={handleNextLevel} 
                    className="px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black transition-all flex items-center gap-3 text-lg shadow-xl shadow-emerald-900/40 hover:-translate-y-1 active:translate-y-0"
                   >
                     Next Task <ChevronRight className="w-6 h-6" />
                   </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleRun} 
                disabled={isProcessing} 
                className="absolute bottom-8 right-8 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-xl font-black shadow-2xl flex items-center gap-3 transition-all transform hover:-translate-y-1 active:scale-95 z-20"
              >
                {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-6 h-6" />} RUN SCRIPT
              </button>
            )}
          </div>
        </section>

        {/* Right Panel */}
        <section className="w-1/4 min-w-[300px] border-l border-slate-800 flex flex-col bg-slate-950">
          <div className="h-10 border-b border-slate-800 bg-slate-900/40 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-mono text-slate-400 tracking-widest uppercase">Console Output</span>
            </div>
            {isProcessing && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
          </div>
          <div ref={scrollRef} className="flex-1 p-5 font-mono text-[11px] overflow-y-auto space-y-3 custom-scrollbar">
            {gameState.logs.map((log, i) => {
              const isOutput = log.startsWith('[OUTPUT]');
              const clueMatch = currentLevel.clue && log.includes(currentLevel.clue);
              const isCollected = currentLevel.clue && gameState.collectedClues.includes(currentLevel.clue);
              
              return (
                <div key={i} className={`leading-relaxed ${log.startsWith('>') ? 'text-blue-400 opacity-60' : ''} ${log.includes('PHP Warning') ? 'text-rose-400' : ''} ${isOutput ? 'text-emerald-400 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 shadow-sm' : 'text-slate-400'}`}>
                  {isOutput && clueMatch ? (
                    <>
                      {log.split(currentLevel.clue!).map((part, index, array) => (
                        <React.Fragment key={index}>
                          {part}
                          {index < array.length - 1 && (
                            isCollected ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-emerald-400 font-bold">
                                <CheckCircle2 className="w-3 h-3" /> {currentLevel.clue}
                              </span>
                            ) : (
                              <button
                                onClick={() => collectClue(currentLevel.clue!)}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 hover:bg-amber-500 hover:text-white transition-all animate-bounce shadow-lg shadow-amber-900/20 group font-black uppercase text-[9px]"
                                title="Click to secure token"
                              >
                                <Archive className="w-3 h-3 group-hover:scale-125 transition-transform" /> {currentLevel.clue}
                              </button>
                            )
                          )}
                        </React.Fragment>
                      ))}
                    </>
                  ) : log}
                </div>
              );
            })}
          </div>
        </section>

        {/* Overlays */}
        {isReferenceOpen && (
          <div className="absolute inset-y-0 right-0 w-1/2 bg-slate-900 border-l border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-40 p-10 overflow-y-auto animate-in slide-in-from-right-full duration-500">
            <div className="flex items-center justify-between mb-10 border-b border-slate-800 pb-6">
              <h2 className="text-2xl font-black text-emerald-400 flex items-center gap-3"><BookOpen className="w-8 h-8" /> Study Notes</h2>
              <button onClick={() => setIsReferenceOpen(false)} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors">Close</button>
            </div>
            <ReferenceSheet />
          </div>
        )}

        {isCollectionOpen && (
          <div className="absolute inset-y-0 right-0 w-1/2 bg-slate-900 border-l border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-40 p-10 overflow-y-auto animate-in slide-in-from-right-full duration-500">
            <div className="flex items-center justify-between mb-10 border-b border-slate-800 pb-6">
              <h2 className="text-2xl font-black text-amber-400 flex items-center gap-3"><Archive className="w-8 h-8" /> Archive Collection</h2>
              <button onClick={() => setIsCollectionOpen(false)} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors">Close</button>
            </div>
            <CollectionSheet />
          </div>
        )}
      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
};

export default App;
