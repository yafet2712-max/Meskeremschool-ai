import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, User, Bot, Loader2, Volume2, Copy, Check } from 'lucide-react';
import { playAmharicAudio } from '../utils/audio';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const STARTER_QUESTIONS = [
  'ለጀማሪ ተማሪዎች ፊደልን በጨዋታ ለማስተማር 3 ውጤታማ ዘዴዎችን ጥቀስልኝ?',
  'ተማሪዎች በክፍል ውስጥ በአማርኛ በድፍረት እንዲናገሩ እንዴት ላበረታታቸው እችላለሁ?',
  'የአማርኛ ግጥም አወቃቀር (ቤት መምታት) ለ ፯ኛ ክፍል ተማሪዎች እንዴት ይብራራል?',
  'በዲያስፖራ የሚኖሩ ህፃናት አማርኛን በፍጥነት እንዲለምዱ ወላጆች ምን ማድረግ አለባቸው?',
];

export const EducatorChat: React.FC<{ onOpenKeyboard: () => void }> = ({ onOpenKeyboard }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: 'ሰላም ጤና ይስጥልኝ! እኔ የአማርኛ ቋንቋ መምህራን እና ተማሪዎች ረዳት ነኝ። በደረጃ ትምህርት እቅድ፣ በክፍል ውስጥ እንቅስቃሴዎች፣ በሰዋሰው ጥያቄዎች ወይም በማስተማር ዘዴዎች ላይ ማንኛውንም ጥያቄ መጠየቅ ይችላሉ። ዛሬ ምን እንወያይ?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        throw new Error(`Chat returned ${res.status}`);
      }

      const data = await res.json();
      if (data.text) {
        setMessages([...newMessages, { role: 'model', content: data.text }]);
      } else {
        throw new Error('Empty response');
      }
    } catch (err: any) {
      console.error(err);
      setMessages([
        ...newMessages,
        {
          role: 'model',
          content: 'ይቅርታ፣ ጥያቄውን በማስኬድ ላይ ሳለሁ ችግር አጋጥሞኛል። እባክዎ እንደገና ይሞክሩ። (Failed to connect to AI server. Please retry.)',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleAudio = (content: string, idx: number) => {
    setPlayingIdx(idx);
    const snippet = content.slice(0, 300);
    playAmharicAudio(snippet, (playing) => {
      if (!playing) setPlayingIdx(null);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm flex flex-col h-[750px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm font-amharic flex items-center gap-2">
              መምህር አማካሪ (Amharic AI Mentor)
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h3>
            <p className="text-xs text-stone-500">24/7 Unlimited Pedagogical & Curriculum Advisor</p>
          </div>
        </div>

        <button
          onClick={onOpenKeyboard}
          className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-stone-100 text-stone-700 rounded-lg border border-stone-300 transition"
        >
          ⌨️ Fidel Pad
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-stone-50/30">
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser ? 'bg-amber-600 text-white' : 'bg-stone-800 text-amber-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  isUser
                    ? 'bg-amber-600 text-white font-amharic rounded-tr-none'
                    : 'bg-white border border-stone-200/90 text-stone-800 font-amharic rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {!isUser && (
                  <div className="mt-3 pt-2 border-t border-stone-100 flex items-center gap-2 justify-end">
                    <button
                      onClick={() => handleAudio(m.content, idx)}
                      className="p-1 text-stone-400 hover:text-amber-600 transition"
                      title="Pronounce text"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${playingIdx === idx ? 'animate-bounce text-amber-600' : ''}`} />
                    </button>
                    <button
                      onClick={() => handleCopy(m.content, idx)}
                      className="p-1 text-stone-400 hover:text-stone-700 transition"
                      title="Copy response"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 mr-auto max-w-lg items-center">
            <div className="w-8 h-8 rounded-full bg-stone-800 text-amber-300 flex items-center justify-center text-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-stone-200 p-3 rounded-2xl rounded-tl-none text-xs text-stone-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span>መምህሩ በማሰብ ላይ ነው (Thinking)...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Starter Suggestions */}
      {messages.length <= 2 && (
        <div className="p-3 bg-stone-100/60 border-t border-stone-200 overflow-x-auto flex gap-2 no-print">
          {STARTER_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1 bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200 rounded-lg text-xs font-amharic whitespace-nowrap transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-stone-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ጥያቄዎን እዚህ በአማርኛ ወይም በእንግሊዝኛ ይጻፉ (Ask anything in Amharic or English)..."
            className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-amharic focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition shadow disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
