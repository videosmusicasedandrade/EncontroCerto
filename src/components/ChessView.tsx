import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, Coins, User, Search, X, Volume2, VolumeX, RotateCcw, Flag, Award, Sparkles, Check, ChevronRight } from 'lucide-react';
import { UserProfile } from '../types';

interface ChessViewProps {
  currentUser: UserProfile;
  usuarios: UserProfile[];
  onAddCertcoins: (amount: number) => void;
  onClose?: () => void;
}

export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type Board = (Piece | null)[][];

export interface Position {
  r: number; // 0..7
  c: number; // 0..7
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece | null;
  isCheck?: boolean;
}

// Crisp Unicode Symbols for Chess Pieces
const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  w: {
    k: '♔',
    q: '♕',
    r: '♖',
    b: '♗',
    n: '♘',
    p: '♙',
  },
  b: {
    k: '♚',
    q: '♛',
    r: '♜',
    b: '♝',
    n: '♞',
    p: '♟',
  },
};

const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Initial Standard Chess Board State
function createInitialBoard(): Board {
  const b: Board = Array(8).fill(null).map(() => Array(8).fill(null));

  // Black Back Rank
  b[0][0] = { type: 'r', color: 'b' };
  b[0][1] = { type: 'n', color: 'b' };
  b[0][2] = { type: 'b', color: 'b' };
  b[0][3] = { type: 'q', color: 'b' };
  b[0][4] = { type: 'k', color: 'b' };
  b[0][5] = { type: 'b', color: 'b' };
  b[0][6] = { type: 'n', color: 'b' };
  b[0][7] = { type: 'r', color: 'b' };

  // Black Pawns
  for (let c = 0; c < 8; c++) {
    b[1][c] = { type: 'p', color: 'b' };
  }

  // White Pawns
  for (let c = 0; c < 8; c++) {
    b[6][c] = { type: 'p', color: 'w' };
  }

  // White Back Rank
  b[7][0] = { type: 'r', color: 'w' };
  b[7][1] = { type: 'n', color: 'w' };
  b[7][2] = { type: 'b', color: 'w' };
  b[7][3] = { type: 'q', color: 'w' };
  b[7][4] = { type: 'k', color: 'w' };
  b[7][5] = { type: 'b', color: 'w' };
  b[7][6] = { type: 'n', color: 'w' };
  b[7][7] = { type: 'r', color: 'w' };

  return b;
}

function isInsideBoard(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

// Pseudo-legal move generator for a specific piece
function getPseudoLegalMoves(board: Board, r: number, c: number): Position[] {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: Position[] = [];
  const color = piece.color;
  const oppColor: PieceColor = color === 'w' ? 'b' : 'w';

  if (piece.type === 'p') {
    const dir = color === 'w' ? -1 : 1;
    const startRank = color === 'w' ? 6 : 1;

    // Move forward 1 step
    if (isInsideBoard(r + dir, c) && !board[r + dir][c]) {
      moves.push({ r: r + dir, c });
      // Move forward 2 steps if starting rank
      if (r === startRank && !board[r + dir * 2][c]) {
        moves.push({ r: r + dir * 2, c });
      }
    }

    // Capture diagonals
    for (const dc of [-1, 1]) {
      const nr = r + dir;
      const nc = c + dc;
      if (isInsideBoard(nr, nc)) {
        const target = board[nr][nc];
        if (target && target.color === oppColor) {
          moves.push({ r: nr, c: nc });
        }
      }
    }
  } else if (piece.type === 'n') {
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    for (const [dr, dc] of knightOffsets) {
      const nr = r + dr;
      const nc = c + dc;
      if (isInsideBoard(nr, nc)) {
        const target = board[nr][nc];
        if (!target || target.color === oppColor) {
          moves.push({ r: nr, c: nc });
        }
      }
    }
  } else if (piece.type === 'k') {
    const kingOffsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1],
    ];
    for (const [dr, dc] of kingOffsets) {
      const nr = r + dr;
      const nc = c + dc;
      if (isInsideBoard(nr, nc)) {
        const target = board[nr][nc];
        if (!target || target.color === oppColor) {
          moves.push({ r: nr, c: nc });
        }
      }
    }
  } else {
    // Sliding pieces: Rook, Bishop, Queen
    let dirs: [number, number][] = [];
    if (piece.type === 'r' || piece.type === 'q') {
      dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    }
    if (piece.type === 'b' || piece.type === 'q') {
      dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }

    for (const [dr, dc] of dirs) {
      let step = 1;
      while (true) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (!isInsideBoard(nr, nc)) break;
        const target = board[nr][nc];
        if (!target) {
          moves.push({ r: nr, c: nc });
        } else {
          if (target.color === oppColor) {
            moves.push({ r: nr, c: nc });
          }
          break; // Blocked by piece
        }
        step++;
      }
    }
  }

  return moves;
}

function findKing(board: Board, color: PieceColor): Position | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === color) {
        return { r, c };
      }
    }
  }
  return null;
}

function isKingInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const oppColor: PieceColor = color === 'w' ? 'b' : 'w';
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === oppColor) {
        const pMoves = getPseudoLegalMoves(board, r, c);
        if (pMoves.some((m) => m.r === kingPos.r && m.c === kingPos.c)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Get fully legal moves (filtering out moves that leave own King in check)
function getLegalMoves(board: Board, r: number, c: number): Position[] {
  const piece = board[r][c];
  if (!piece) return [];
  const pseudoMoves = getPseudoLegalMoves(board, r, c);
  const legal: Position[] = [];

  for (const m of pseudoMoves) {
    // Clone board and apply move
    const newBoard = board.map((row) => [...row]);
    newBoard[m.r][m.c] = newBoard[r][c];
    newBoard[r][c] = null;

    if (!isKingInCheck(newBoard, piece.color)) {
      legal.push(m);
    }
  }

  return legal;
}

// Check if a color has any legal moves
function hasAnyLegalMoves(board: Board, color: PieceColor): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.color === color) {
        if (getLegalMoves(board, r, c).length > 0) {
          return true;
        }
      }
    }
  }
  return false;
}

export const ChessView: React.FC<ChessViewProps> = ({ currentUser, usuarios, onAddCertcoins, onClose }) => {
  const [gameState, setGameState] = useState<'menu' | 'searching' | 'betting' | 'playing' | 'gameover'>('menu');
  const [opponent, setOpponent] = useState<UserProfile | null>(null);
  const [betAmount, setBetAmount] = useState(1);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Saída garantida do jogo de xadrez para o menu de jogos
  const handleExitGame = () => {
    if (gameState === 'playing' || gameState === 'searching' || gameState === 'betting') {
      if (confirm('Deseja realmente sair da partida de xadrez?')) {
        setIsMusicPlaying(false);
        setGameState('menu');
        if (onClose) onClose();
      }
    } else {
      setIsMusicPlaying(false);
      if (onClose) onClose();
    }
  };

  // Chess Game State
  const [board, setBoard] = useState<Board>(createInitialBoard());
  const [turn, setTurn] = useState<PieceColor>('w'); // 'w' = Player, 'b' = Opponent AI
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<Piece[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<Piece[]>([]);
  const [inCheck, setInCheck] = useState<boolean>(false);
  const [winner, setWinner] = useState<PieceColor | 'draw' | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);

  // Audio Synthesizer for Chess Sound Effects
  const playMoveSound = useCallback((isCapture = false, isCheckSound = false) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isCapture ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isCheckSound ? 587 : isCapture ? 160 : 220, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }, []);

  // Electronic Background Music Loop
  useEffect(() => {
    let ctx: AudioContext | null = null;
    let timer: any = null;

    if (isMusicPlaying) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        ctx = new AudioCtx();
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.connect(ctx.destination);

        const notes = [220, 261.63, 329.63, 392.0];
        let idx = 0;

        timer = setInterval(() => {
          if (!ctx || ctx.state === 'closed') return;
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const nGain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(notes[idx % notes.length], now);
          idx++;

          nGain.gain.setValueAtTime(0.02, now);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(nGain);
          nGain.connect(gain);
          osc.start(now);
          osc.stop(now + 0.38);
        }, 500);
      } catch (e) {}
    }

    return () => {
      if (timer) clearInterval(timer);
      if (ctx && ctx.state !== 'closed') {
        try { ctx.close(); } catch (e) {}
      }
    };
  }, [isMusicPlaying]);

  // Start Searching Opponent
  const startSearch = () => {
    setGameState('searching');
    setTimeout(() => {
      const availableOpponents = usuarios.filter((u) => u.id !== currentUser.id);
      const fallbackOpponent: UserProfile = {
        id: 'bot-chess',
        nome: 'Camila Mendonça',
        nascimento: '1996-03-12',
        idade: 29,
        cidade: 'Belo Horizonte',
        estado_sigla: 'MG',
        latitude: -19.92,
        longitude: -43.94,
        raio_busca: 50,
        tipo_corporal: 'Normal',
        foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        tipo_perfil: 'publico',
        exibir_na_busca: true,
        criado_em: new Date().toISOString(),
      };
      const randomOpponent = availableOpponents.length > 0
        ? availableOpponents[Math.floor(Math.random() * availableOpponents.length)]
        : fallbackOpponent;
      setOpponent(randomOpponent);
      setGameState('betting');
    }, 1500);
  };

  const confirmBetAndStart = (amount: number) => {
    setBetAmount(amount);
    setBoard(createInitialBoard());
    setTurn('w');
    setSelectedSquare(null);
    setValidMoves([]);
    setMoveHistory([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setInCheck(false);
    setWinner(null);
    setLastMove(null);
    setGameState('playing');
    setIsMusicPlaying(true);
  };

  // Execute Move
  const makeMove = useCallback(
    (from: Position, to: Position) => {
      setBoard((prevBoard) => {
        const piece = prevBoard[from.r][from.c];
        if (!piece) return prevBoard;

        const targetPiece = prevBoard[to.r][to.c];
        const newBoard = prevBoard.map((row) => [...row]);

        // Pawn promotion to Queen
        let movedPiece = { ...piece };
        if (piece.type === 'p' && (to.r === 0 || to.r === 7)) {
          movedPiece.type = 'q';
        }

        newBoard[to.r][to.c] = movedPiece;
        newBoard[from.r][from.c] = null;

        // Track captured pieces
        if (targetPiece) {
          if (targetPiece.color === 'w') {
            setCapturedWhite((prev) => [...prev, targetPiece]);
          } else {
            setCapturedBlack((prev) => [...prev, targetPiece]);
          }
        }

        const nextTurn: PieceColor = piece.color === 'w' ? 'b' : 'w';
        const isCheckNext = isKingInCheck(newBoard, nextTurn);
        setInCheck(isCheckNext);

        playMoveSound(Boolean(targetPiece), isCheckNext);
        setLastMove({ from, to });

        // Record Move History
        const moveRecord: Move = {
          from,
          to,
          piece,
          captured: targetPiece,
          isCheck: isCheckNext,
        };
        setMoveHistory((prev) => [...prev, moveRecord]);

        // Checkmate or Stalemate Check
        if (!hasAnyLegalMoves(newBoard, nextTurn)) {
          if (isCheckNext) {
            setWinner(piece.color);
            setGameState('gameover');
            if (piece.color === 'w') {
              onAddCertcoins(betAmount * 2);
            }
          } else {
            setWinner('draw');
            setGameState('gameover');
          }
        } else {
          setTurn(nextTurn);
        }

        return newBoard;
      });
    },
    [betAmount, onAddCertcoins, playMoveSound]
  );

  // Player Click Handler
  const handleSquareClick = (r: number, c: number) => {
    if (gameState !== 'playing' || turn !== 'w') return;

    // If square is one of the valid destination moves
    if (selectedSquare && validMoves.some((m) => m.r === r && m.c === c)) {
      makeMove(selectedSquare, { r, c });
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    // Select White Piece
    const piece = board[r][c];
    if (piece && piece.color === 'w') {
      setSelectedSquare({ r, c });
      const moves = getLegalMoves(board, r, c);
      setValidMoves(moves);
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  // AI Opponent Move Generation (Black 'b')
  useEffect(() => {
    if (gameState !== 'playing' || turn !== 'b' || winner) return;

    const timer = setTimeout(() => {
      // Find all possible legal moves for Black
      const allMoves: { from: Position; to: Position; score: number }[] = [];

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const piece = board[r][c];
          if (piece && piece.color === 'b') {
            const moves = getLegalMoves(board, r, c);
            moves.forEach((m) => {
              const target = board[m.r][m.c];
              let score = 0;
              // Value captures
              if (target) {
                score += PIECE_VALUES[target.type];
              }
              // Center control
              if ((m.r === 3 || m.r === 4) && (m.c === 3 || m.c === 4)) {
                score += 30;
              }
              // Slight randomness for natural play
              score += Math.random() * 25;

              allMoves.push({ from: { r, c }, to: m, score });
            });
          }
        }
      }

      if (allMoves.length > 0) {
        allMoves.sort((a, b) => b.score - a.score);
        const bestMove = allMoves[0];
        makeMove(bestMove.from, bestMove.to);
      } else {
        // No moves -> Checkmate or Stalemate
        if (inCheck) {
          setWinner('w');
          onAddCertcoins(betAmount * 2);
        } else {
          setWinner('draw');
        }
        setGameState('gameover');
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [gameState, turn, board, winner, inCheck, makeMove, betAmount, onAddCertcoins]);

  // Convert File / Rank to notation (e.g. e4)
  const toAlgebraic = (r: number, c: number) => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return `${files[c]}${8 - r}`;
  };

  return (
    <div className="min-h-screen bg-[#120F0D] flex flex-col items-center justify-center p-3 sm:p-6 text-[#F5E9D3] select-none">
      
      {/* Top Controls: Music Toggle & Close */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4">
        <button
          onClick={() => setIsMusicPlaying(!isMusicPlaying)}
          className="px-3.5 py-1.5 bg-[#1E1915] border border-[#382E24] rounded-2xl text-xs font-bold flex items-center space-x-1.5 text-[#E8A838]"
        >
          {isMusicPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          <span>{isMusicPlaying ? 'Música Eletrônica ON' : 'Música Muta'}</span>
        </button>

        <button
          onClick={handleExitGame}
          className="px-4 py-2 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 rounded-2xl text-xs font-black flex items-center space-x-1.5 shadow-lg active:scale-95 transition-all"
          title="Sair do Xadrez e voltar ao menu"
        >
          <X className="w-4 h-4 text-red-400" />
          <span>Sair do Xadrez</span>
        </button>
      </div>

      {/* MENU INICIAL */}
      {gameState === 'menu' && (
        <div className="w-full max-w-md bg-[#1E1915] border-2 border-[#382E24] rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#E8A838] to-[#D1704A] flex items-center justify-center mx-auto text-4xl shadow-xl border border-amber-300">
            ♔
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-[#F5E9D3]">Xadrez 1x1 Eletrônico</h2>
            <p className="text-xs text-[#C8B8A0] leading-relaxed">
              Desafie oponentes online do Brasil inteiro, aposte Certcoins e vença no tabuleiro com som eletrônico e regras completas!
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={startSearch}
              className="w-full py-4 golden-button rounded-2xl text-sm font-black shadow-xl flex items-center justify-center space-x-2 active:scale-95 transition-transform"
            >
              <Search className="w-5 h-5 text-[#120F0D]" />
              <span>Buscar Oponente 🚀</span>
            </button>

            <button
              onClick={handleExitGame}
              className="w-full py-3 bg-[#2A231D] hover:bg-[#382E24] text-[#C8B8A0] hover:text-[#F5E9D3] font-bold text-xs rounded-2xl border border-[#382E24] transition-all flex items-center justify-center space-x-2"
            >
              <X className="w-4 h-4 text-red-400" />
              <span>Voltar ao Menu Principal de Jogos 🚪</span>
            </button>
          </div>
        </div>
      )}

      {/* BUSCANDO OPONENTE */}
      {gameState === 'searching' && (
        <div className="w-full max-w-md bg-[#1E1915] border border-[#382E24] rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fadeIn">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/30 border-t-[#E8A838] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center text-xl">♔</div>
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[#F5E9D3]">Buscando Oponente…</h3>
            <p className="text-xs text-[#C8B8A0]">Procurando jogador conectado no seu estado...</p>
          </div>
        </div>
      )}

      {/* APOSTA */}
      {gameState === 'betting' && opponent && (
        <div className="w-full max-w-md bg-[#1E1915] border-2 border-[#E8A838]/60 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl animate-fadeIn">
          <div className="flex items-center justify-center space-x-3 bg-[#120F0D] p-3 rounded-2xl border border-[#382E24]">
            <img src={opponent.foto} alt={opponent.nome} className="w-12 h-12 rounded-full object-cover border-2 border-[#E8A838]" />
            <div className="text-left">
              <h3 className="font-black text-sm text-[#F5E9D3]">{opponent.nome}</h3>
              <p className="text-xs text-[#C8B8A0]">{opponent.cidade} ({opponent.estado_sigla}) 🟢 Online</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-[#E8A838] tracking-wider">Quanto deseja apostar na partida?</h4>
            <p className="text-xs text-[#C8B8A0]">O vencedor fica com o prêmio dobrado em Certcoins! 🪙</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[1, 5, 10].map((amount) => (
              <button
                key={amount}
                onClick={() => confirmBetAndStart(amount)}
                className="py-3 bg-[#2A231D] hover:bg-[#382E24] border border-[#E8A838]/50 hover:border-[#E8A838] text-[#E8A838] font-black text-sm rounded-2xl transition-all shadow-md active:scale-95"
              >
                {amount} 🪙
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TELA DE JOGO - TABULEIRO DE XADREZ INTERATIVO */}
      {(gameState === 'playing' || gameState === 'gameover') && opponent && (
        <div className="w-full max-w-lg space-y-3 animate-fadeIn">
          
          {/* Header da Partida & Apostas */}
          <div className="bg-[#1E1915] border border-[#382E24] rounded-2xl p-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2.5">
              <img src={opponent.foto} alt={opponent.nome} className="w-9 h-9 rounded-full object-cover border border-[#E8A838]" />
              <div>
                <h4 className="font-bold text-xs text-[#F5E9D3]">{opponent.nome} (Pretas)</h4>
                <div className="flex items-center space-x-1 text-[10px] text-zinc-400">
                  {capturedWhite.map((p, i) => (
                    <span key={i} className="text-amber-200">{PIECE_SYMBOLS.w[p.type]}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 bg-[#120F0D] border border-amber-500/40 text-amber-400 text-xs font-black rounded-xl">
                Aposta: {betAmount} 🪙
              </span>
            </div>
          </div>

          {/* Banner de XEQUE */}
          {inCheck && !winner && (
            <div className="bg-amber-950/90 border-2 border-amber-400 text-amber-300 font-black text-xs py-1.5 text-center rounded-xl animate-pulse shadow-md">
              ⚠️ XEQUE! O Rei está sob ataque!
            </div>
          )}

          {/* TABULEIRO 8x8 */}
          <div className="bg-[#1E1915] p-2 sm:p-3 rounded-3xl border-2 border-[#382E24] shadow-2xl relative">
            <div className="grid grid-cols-8 gap-0 rounded-2xl overflow-hidden border border-[#382E24]">
              {board.map((row, r) =>
                row.map((square, c) => {
                  const isDarkSquare = (r + c) % 2 === 1;
                  const isSelected = selectedSquare?.r === r && selectedSquare?.c === c;
                  const isValidMove = validMoves.some((m) => m.r === r && m.c === c);
                  const isLastMove = lastMove && ((lastMove.from.r === r && lastMove.from.c === c) || (lastMove.to.r === r && lastMove.to.c === c));
                  const isKingCheckSquare = square && square.type === 'k' && isKingInCheck(board, square.color);

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleSquareClick(r, c)}
                      className={`relative aspect-square flex items-center justify-center text-3xl sm:text-4xl transition-all duration-150 select-none ${
                        isDarkSquare ? 'bg-[#7A5230]' : 'bg-[#E0C398]'
                      } ${isSelected ? '!bg-amber-500/80 ring-2 ring-amber-300' : ''} ${
                        isLastMove ? 'bg-amber-300/40' : ''
                      } ${isKingCheckSquare ? '!bg-red-600/90 animate-pulse' : ''}`}
                    >
                      {/* Grid Notation on board edges */}
                      {c === 0 && (
                        <span className={`absolute top-0.5 left-1 text-[8px] font-mono font-bold ${isDarkSquare ? 'text-[#E0C398]' : 'text-[#7A5230]'}`}>
                          {8 - r}
                        </span>
                      )}
                      {r === 7 && (
                        <span className={`absolute bottom-0.5 right-1 text-[8px] font-mono font-bold ${isDarkSquare ? 'text-[#E0C398]' : 'text-[#7A5230]'}`}>
                          {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][c]}
                        </span>
                      )}

                      {/* Piece Icon */}
                      {square && (
                        <span
                          className={`drop-shadow-md transition-transform ${
                            square.color === 'w' ? 'text-amber-100' : 'text-zinc-950'
                          } ${isSelected ? 'scale-110' : ''}`}
                        >
                          {PIECE_SYMBOLS[square.color][square.type]}
                        </span>
                      )}

                      {/* Valid Move Indicator Dot / Capture Ring */}
                      {isValidMove && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          {square ? (
                            <div className="w-full h-full border-4 border-red-500 rounded-full animate-ping opacity-75" />
                          ) : (
                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-amber-400 rounded-full opacity-80 shadow-md" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer do Jogador (Sua Vez / Vez do Oponente) */}
          <div className="bg-[#1E1915] border border-[#382E24] rounded-2xl p-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2.5">
              <img src={currentUser.foto} alt={currentUser.nome} className="w-9 h-9 rounded-full object-cover border border-[#E8A838]" />
              <div>
                <h4 className="font-bold text-xs text-[#F5E9D3]">{currentUser.nome} (Sua vez - Brancas)</h4>
                <div className="flex items-center space-x-1 text-[10px] text-zinc-400">
                  {capturedBlack.map((p, i) => (
                    <span key={i} className="text-zinc-900 font-bold">{PIECE_SYMBOLS.b[p.type]}</span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              {turn === 'w' ? (
                <span className="px-3 py-1 bg-amber-500 text-black font-black text-xs rounded-xl animate-pulse">
                  Sua Vez ♟️
                </span>
              ) : (
                <span className="px-3 py-1 bg-[#120F0D] text-zinc-400 font-bold text-xs rounded-xl border border-[#382E24]">
                  Oponente pensando…
                </span>
              )}
            </div>
          </div>

          {/* Histórico de Jogadas Recentes */}
          {moveHistory.length > 0 && (
            <div className="bg-[#120F0D] border border-[#382E24] rounded-xl p-2 text-[10px] font-mono text-[#C8B8A0] flex items-center space-x-2 overflow-x-auto whitespace-nowrap">
              <span className="font-bold text-[#E8A838]">HISTÓRICO:</span>
              {moveHistory.slice(-6).map((m, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-[#1E1915] rounded border border-[#382E24]">
                  {m.piece.color === 'w' ? '⚪' : '🖤'} {toAlgebraic(m.from.r, m.from.c)} ➔ {toAlgebraic(m.to.r, m.to.c)}
                  {m.captured ? ' ⚔️' : ''}
                </span>
              ))}
            </div>
          )}

          {/* Botão Desistir */}
          {gameState === 'playing' && (
            <div className="text-center pt-2">
              <button
                onClick={() => {
                  if (confirm('Deseja realmente desistir da partida?')) {
                    setWinner('b');
                    setGameState('gameover');
                  }
                }}
                className="text-xs text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
              >
                Desistir da Partida
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE GAMEOVER (FIM DE JOGO / VITÓRIA / DERROTA) */}
      {gameState === 'gameover' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1E1915] rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border-2 border-[#E8A838] shadow-2xl animate-bounce-short">
            <div className="w-16 h-16 rounded-full bg-[#E8A838]/20 border border-[#E8A838] flex items-center justify-center mx-auto text-3xl shadow-lg">
              {winner === 'w' ? '🏆' : winner === 'b' ? '💔' : '🤝'}
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-[#F5E9D3]">
                {winner === 'w'
                  ? 'Xeque-Mate! Vitória Suas!'
                  : winner === 'b'
                  ? 'Xeque-Mate! Vitória do Oponente'
                  : 'Empate no Tabuleiro!'}
              </h3>
              <p className="text-xs text-[#C8B8A0] leading-relaxed">
                {winner === 'w' ? (
                  <>
                    Você venceu a partida contra <strong>{opponent?.nome}</strong> e faturou{' '}
                    <strong className="text-[#E8A838] underline">+{betAmount * 2} Certcoins</strong>! 🪙
                  </>
                ) : winner === 'b' ? (
                  `Não foi desta vez! O oponente venceu a disputa.`
                ) : (
                  `A partida terminou em empate por afogamento.`
                )}
              </p>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => {
                  setGameState('menu');
                  setIsMusicPlaying(false);
                }}
                className="flex-1 py-3 bg-[#2A231D] text-[#C8B8A0] font-bold text-xs rounded-2xl border border-[#382E24]"
              >
                Voltar ao Menu
              </button>
              <button
                onClick={() => confirmBetAndStart(betAmount)}
                className="flex-1 py-3 golden-button font-black text-xs rounded-2xl shadow-lg"
              >
                Jogar Novamente 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
