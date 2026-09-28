import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Calendar,
  Compass,
  Briefcase,
  Scale,
  RefreshCw,
  Plus,
  CheckCircle2,
  X,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedEvents?: Array<{
    title: string;
    category: 'study' | 'routine' | 'group_work' | 'health' | 'artist' | 'personal';
    startTime: string;
    endTime: string;
    description?: string;
  }>;
  timestamp: string;
}

export const AIAssistantModal: React.FC = () => {
  const {
    isAIAssistantOpen,
    setIsAIAssistantOpen,
    language,
    selectedRole,
    currentLocation,
    addEvent,
    isOnline,
  } = useApp();

  const isVi = language === 'vi';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: isVi
        ? `Xin chào! Tôi là Trợ lý AI SmartPlanna của bạn 🌟. Tôi có thể hỗ trợ bạn:
• Sắp xếp lịch học tập, ca làm thêm, giờ ăn ngủ và tập gym cân bằng.
• Lên kế hoạch rehearsal và show diễn cho nghệ sĩ.
• Gợi ý homestay, món ngon địa phương tại ${currentLocation}.
• Tìm kiếm việc làm sinh viên linh hoạt ca làm.

Hôm nay bạn cần tôi hỗ trợ sắp xếp điều gì?`
        : `Hello! I am your SmartPlanna AI Assistant 🌟. I can help you schedule classes, manage study/life balance, organize artist shows, recommend travel spots, and find student jobs. How can I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAIAssistantOpen) {
      scrollToBottom();
    }
  }, [messages, isAIAssistantOpen]);

  if (!isAIAssistantOpen) return null;

  const quickPrompts = [
    {
      label: isVi ? '🎓 Sắp xếp lịch học & sinh hoạt cân bằng' : '🎓 Balanced student study schedule',
      prompt: isVi
        ? 'Hãy gợi ý cho tôi lịch trình 1 ngày tối ưu cho sinh viên gồm: 4 tiếng học trên trường, 2 tiếng tự học/làm bài nhóm, 1 tiếng tập gym/vận động, 1 tiếng ăn uống nghỉ ngơi.'
        : 'Generate a balanced daily routine for a university student including 4h classes, 2h self-study, 1h gym, and rest.',
    },
    {
      label: isVi ? '🎨 Lịch trình cho Nghệ sĩ (Show & Tập nhảy)' : '🎨 Artist show & dance rehearsal schedule',
      prompt: isVi
        ? 'Hãy lên lịch trình 1 ngày cho nghệ sĩ biểu diễn: 14h-16h tập nhảy/vũ đạo, 17h make-up chuẩn bị trang phục, 19h soundcheck và 20h biểu diễn tại minishow.'
        : 'Plan a 1-day itinerary for a performing artist: dance rehearsal at 14h, makeup at 17h, soundcheck at 19h, and live acoustic show at 20h.',
    },
    {
      label: isVi ? '✈️ Lịch trình du lịch Đà Lạt kèm homestay & ăn uống' : '✈️ Da Lat 2-day travel plan with homestay',
      prompt: isVi
        ? 'Gợi ý lịch trình du lịch Đà Lạt 2 ngày 1 đêm: check-in homestay săn mây, ăn bánh ướt lòng gà, lẩu bò Ba Toa, và quán cafe ngắm hoàng hôn.'
        : 'Suggest a 2-day Da Lat itinerary with cloud-hunting homestays, local cuisine, and sunset cafes.',
    },
    {
      label: isVi ? '💼 Gợi ý việc làm sinh viên ca tối không trùng lịch' : '💼 Evening student job recommendations',
      prompt: isVi
        ? 'Tôi rảnh từ 18h đến 22h các ngày trong tuần. Hãy gợi ý các công việc làm thêm phù hợp như Barista, gia sư hoặc trợ lý nội dung.'
        : 'I have free time from 18:00 to 22:00 on weekdays. Recommend suitable part-time jobs like barista or tutoring.',
    },
  ];

  const handleSendMessage = async (userText: string) => {
    const text = userText.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          role: selectedRole,
          location: currentLocation,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || (isVi ? 'Tôi đã nhận được yêu cầu của bạn.' : 'I received your request.'),
        suggestedEvents: data.suggestedEvents || undefined,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI chat error:', err);
      // Fallback offline / mock response
      const fallbackReply = isVi
        ? `Tôi đã phân tích yêu cầu của bạn ("${text}"). Dưới đây là gợi ý tối ưu lịch trình cho bạn:
1. Sáng (08:00 - 11:30): Học tập / Luyện tập chuyên môn tập trung cao.
2. Trưa (11:30 - 13:30): Ăn trưa bổ dưỡng và nghỉ ngơi 30 phút.
3. Chiều (14:00 - 17:00): Làm bài tập nhóm, rehearsal hoặc ca làm thêm.
4. Tối (17:30 - 19:00): Tập gym, chạy bộ hoặc tập vũ đạo giải phóng năng lượng.
5. Đêm (19:30 - 22:30): Ăn tối, thư giãn cùng gia đình, bạn bè và chuẩn bị cho ngày mai.`
        : `Here is a balanced recommendation for your schedule based on "${text}": Focus on core tasks in the morning, team sync in the afternoon, fitness at 17:30, and personal recovery at night.`;

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          role: 'assistant',
          content: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestedEvents = (eventsToApply: any[]) => {
    const today = new Date().toISOString().split('T')[0];
    eventsToApply.forEach((ev) => {
      addEvent({
        title: ev.title,
        description: ev.description || 'Gợi ý thông minh từ Trợ lý AI SmartPlanna',
        category: ev.category || 'study',
        date: today,
        startTime: ev.startTime || '08:00',
        endTime: ev.endTime || '10:00',
        targetRole: selectedRole,
        color: '#8B5CF6',
      });
    });

    alert(
      isVi
        ? `Đã thêm thành công ${eventsToApply.length} sự kiện vào Lịch Trình của bạn!`
        : `Successfully added ${eventsToApply.length} events to your schedule!`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full h-[620px] shadow-2xl border border-purple-100 flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-500 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Sparkles className="w-5 h-5 text-pink-200 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base leading-tight">
                  {isVi ? 'Trợ Lý AI SmartPlanna' : 'SmartPlanna AI Assistant'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-pink-100">
                  Gemini Flash
                </span>
              </div>
              <p className="text-[11px] text-purple-100">
                {isVi ? 'Tư vấn lịch trình, cân bằng cuộc sống & gợi ý du lịch, việc làm' : 'Schedule, life balance & travel concierge'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAIAssistantOpen(false)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-xs'
                    : 'bg-white text-purple-700 border border-purple-200 shadow-xs'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="max-w-[82%] space-y-2">
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-tr-none shadow-md shadow-purple-500/10'
                      : 'bg-white text-slate-800 rounded-tl-none border border-purple-100 shadow-xs'
                  }`}
                >
                  {msg.content}
                </div>

                {/* If AI provided structured schedule events */}
                {msg.suggestedEvents && msg.suggestedEvents.length > 0 && (
                  <div className="bg-purple-50/90 border border-purple-200 rounded-2xl p-3 space-y-2 text-xs">
                    <p className="font-bold text-purple-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>{isVi ? 'Lịch trình được AI đề xuất:' : 'AI Suggested Events:'}</span>
                    </p>
                    <div className="space-y-1.5">
                      {msg.suggestedEvents.map((ev, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-white rounded-xl border border-purple-100 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-800">{ev.title}</span>
                            <span className="text-[10px] text-purple-600 block">
                              {ev.startTime} - {ev.endTime}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 uppercase">
                            {ev.category}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleApplySuggestedEvents(msg.suggestedEvents!)}
                      className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs shadow-xs hover:opacity-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isVi ? 'Áp Dụng Toàn Bộ Vào Lịch Trình' : 'Import All to Schedule'}</span>
                    </button>
                  </div>
                )}

                <span className="text-[10px] text-slate-400 block px-1">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-purple-600 font-semibold p-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{isVi ? 'AI đang suy nghĩ và sắp xếp kế hoạch...' : 'AI is thinking and scheduling...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-purple-50/60 border-t border-purple-100 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
          <span className="font-bold text-slate-500 flex-shrink-0 text-[10px] pl-1">
            {isVi ? 'Gợi ý nhanh:' : 'Quick:'}
          </span>
          {quickPrompts.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q.prompt)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-purple-100 text-purple-700 border border-purple-200 font-medium whitespace-nowrap transition cursor-pointer"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-purple-100 flex items-center gap-2">
          <input
            type="text"
            placeholder={
              isVi
                ? 'Nhập yêu cầu sắp xếp lịch, gợi ý du lịch, việc làm...'
                : 'Ask for scheduling, Da Lat homestays, student jobs...'
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(inputMessage);
              }
            }}
            className="flex-1 px-4 py-2.5 rounded-2xl border border-purple-200 text-xs sm:text-sm bg-purple-50/30 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />

          <button
            onClick={() => handleSendMessage(inputMessage)}
            disabled={isLoading || !inputMessage.trim()}
            className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md hover:opacity-95 disabled:opacity-50 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
