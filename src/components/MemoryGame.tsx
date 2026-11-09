import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw, Brain, Coins } from 'lucide-react';

interface Card {
  id: number;
  uniqueId: number;
  name: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MG_SPOTS = [
  { name: 'Inhotim', emoji: '🎨' },
  { name: 'Mineirão', emoji: '⚽' },
  { name: 'Ouro Preto', emoji: '⛪' },
  { name: 'Pico da Bandeira', emoji: '⛰️' },
  { name: 'Mercado Central', emoji: '🧀' },
  { name: 'Igreja da Pampulha', emoji: '🏗️' },
  { name: 'Serra da Canastra', emoji: '🐆' },
  { name: 'Gruta do Maquiné', emoji: '🔦' },
];

interface MemoryGameProps {
  onWin: (coins: number) => void;
  onClose: () => void;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ onWin, onClose }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [canFlip, setCanFlip] = useState(true);

  const initGame = () => {
    const gameCards = [...MG_SPOTS, ...MG_SPOTS]
      .sort(() => Math.random() - 0.5)
      .map((spot, index) => ({
        ...spot,
        id: index,
        uniqueId: index,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setGameOver(false);
    setCanFlip(true);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardClick = (id: number) => {
    if (!canFlip || gameOver) return;
    if (cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setCanFlip(false);
      setMoves(prev => prev + 1);

      const [firstId, secondId] = newFlipped;
      if (cards[firstId].name === cards[secondId].name) {
        // Match!
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstId].isMatched = true;
          matchedCards[secondId].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          setCanFlip(true);

          if (matchedCards.every(card => card.isMatched)) {
            setGameOver(true);
            onWin(10);
          }
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstId].isFlipped = false;
          resetCards[secondId].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
          setCanFlip(true);
        }, 1000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#120F0D] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1E1915] rounded-3xl border border-[#382E24] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-[#E8A838]" />
            <h2 className="text-xl font-black text-[#F5E9D3]">Jogo da Memória</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#2A231D] rounded-xl text-[#C8B8A0]">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-between items-center bg-[#120F0D] p-3 rounded-2xl border border-[#382E24]">
          <div className="text-sm font-bold text-[#C8B8A0]">Jogadas: <span className="text-[#E8A838]">{moves}</span></div>
          <div className="flex items-center gap-1.5 text-sm font-black text-[#E8A838]">
            <Coins className="w-4 h-4" />
            <span>Prêmio: 10 Certcoins</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3" style={{ perspective: '1000px' }}>
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`
                aspect-square rounded-xl cursor-pointer transition-all duration-300 transform preserve-3d
                ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
                ${card.isMatched ? 'opacity-50 grayscale' : 'hover:scale-105 active:scale-95'}
              `}
            >
              <div className="relative w-full h-full text-center transition-transform duration-500 transform-style-3d">
                {/* Back of card */}
                <div className={`
                  absolute inset-0 backface-hidden bg-[#120F0D] border-2 border-[#382E24] rounded-xl flex items-center justify-center
                  ${card.isFlipped || card.isMatched ? 'invisible' : 'visible'}
                `}>
                  <div className="w-8 h-8 rounded-full bg-[#E8A838]/10 flex items-center justify-center border border-[#E8A838]/20">
                    <span className="text-[#E8A838] font-black">?</span>
                  </div>
                </div>
                {/* Front of card */}
                <div className={`
                  absolute inset-0 backface-hidden bg-gradient-to-br from-[#2A231D] to-[#1E1915] border-2 border-[#E8A838] rounded-xl flex flex-col items-center justify-center gap-1
                  ${card.isFlipped || card.isMatched ? 'visible' : 'invisible'}
                `}>
                  <span className="text-2xl">{card.emoji}</span>
                  <span className="text-[8px] uppercase font-black text-[#E8A838] text-center px-1 leading-tight">{card.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {gameOver && (
          <div className="mt-6 p-4 bg-[#E8A838]/10 border border-[#E8A838]/30 rounded-2xl text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="inline-flex p-3 bg-[#E8A838] rounded-full">
              <Trophy className="w-8 h-8 text-[#120F0D]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#F5E9D3]">Parabéns, Uai! 🎉</h3>
              <p className="text-sm text-[#C8B8A0]">Você encontrou todos os pontos turísticos!</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[#E8A838] font-black">
              <Coins className="w-5 h-5" />
              <span>+10 Certcoins adicionados!</span>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-[#E8A838] text-[#120F0D] font-black rounded-xl hover:brightness-110 transition-all"
            >
              Coletar Prêmio & Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
