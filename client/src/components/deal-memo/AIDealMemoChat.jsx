import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Sparkles, Send, X, Bot, User, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/lib/axios';
import { cn, formatCurrency } from '@/lib/utils';

const SUGGESTED_PROMPTS = [
  'Create deal for [name] as [role] on [production]',
  'Set up a 55hr week deal for a Camera Operator',
  'Deal memo for a Gaffer on a feature film',
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block size-1.5 rounded-full bg-muted-foreground/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function FormDataCard({ formData, onApply }) {
  if (!formData) return null;

  const labels = formData.labels || {};
  const fields = [
    { label: 'Production', value: labels.production },
    { label: 'Person', value: labels.person },
    { label: 'Union', value: labels.union },
    { label: 'Department', value: labels.department },
    { label: 'Designation', value: labels.designation },
    { label: 'Budget Tier', value: labels.budgetTier },
    { label: 'Weekly Rate', value: formData.weeklyRate ? formatCurrency(formData.weeklyRate) : null },
    { label: 'Daily Rate', value: formData.dailyRate ? formatCurrency(formData.dailyRate) : null },
    { label: 'Hourly Rate', value: formData.hourlyRate ? formatCurrency(formData.hourlyRate) : null },
  ].filter((f) => f.value);

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm font-semibold">Auto-filled Deal Memo</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          {fields.map((f) => (
            <div key={f.label} className="text-xs">
              <span className="text-muted-foreground">{f.label}:</span>{' '}
              <span className="font-medium">{f.value}</span>
            </div>
          ))}
        </div>
        {formData.summary && (
          <p className="text-xs text-muted-foreground italic">{formData.summary}</p>
        )}
        <Button size="sm" className="w-full gap-2" onClick={() => onApply(formData)}>
          <Check className="size-3.5" />
          Apply to Form
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AIDealMemoChat({ open, onClose, onApplyFormData }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  // Focus input when panel opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = (text || input).trim();
      if (!trimmed || isLoading) return;

      const userMsg = { role: 'user', content: trimmed };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsLoading(true);

      try {
        const { data } = await api.post('/ai/deal-memo', { message: trimmed });
        const aiMsg = {
          role: 'assistant',
          content: data.data?.message || 'Done.',
          formData: data.data?.formData || null,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (err) {
        const errorText =
          err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.';
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: errorText, isError: true },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendMessage();
    }
    // Also send on plain Enter if single line
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleApply = (formData) => {
    onApplyFormData(formData);
    toast.success('AI data applied to the form');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[420px] max-w-[95vw] z-50 flex flex-col bg-background border-l shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <h2 className="font-semibold text-sm">AI Deal Assistant</h2>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Beta
                </Badge>
              </div>
              <Button variant="ghost" size="icon" className="size-7" onClick={onClose}>
                <X className="size-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 px-4 py-3">
              <div className="space-y-4">
                {/* Welcome message */}
                {messages.length === 0 && (
                  <div className="space-y-4">
                    <div className="flex gap-2.5">
                      <div className="shrink-0 size-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="size-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Describe the deal memo you want to create and I will look up the correct
                          production, person, union rates and rules from your database.
                        </p>
                      </div>
                    </div>

                    {/* Suggested prompts */}
                    <div className="space-y-1.5 pl-9">
                      <p className="text-xs text-muted-foreground font-medium">Try something like:</p>
                      {SUGGESTED_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => {
                            setInput(prompt);
                            inputRef.current?.focus();
                          }}
                          className="block w-full text-left text-xs px-3 py-2 rounded-md border border-dashed border-muted-foreground/25 text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-primary/40 transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat messages */}
                {messages.map((msg, i) => (
                  <div key={i} className="space-y-2">
                    <div
                      className={cn(
                        'flex gap-2.5',
                        msg.role === 'user' && 'flex-row-reverse'
                      )}
                    >
                      <div
                        className={cn(
                          'shrink-0 size-7 rounded-full flex items-center justify-center',
                          msg.role === 'user'
                            ? 'bg-foreground/10'
                            : 'bg-primary/10'
                        )}
                      >
                        {msg.role === 'user' ? (
                          <User className="size-4 text-foreground/70" />
                        ) : (
                          <Bot className="size-4 text-primary" />
                        )}
                      </div>
                      <div
                        className={cn(
                          'flex-1 text-sm leading-relaxed rounded-lg px-3 py-2',
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : msg.isError
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-muted/50 text-foreground'
                        )}
                      >
                        {msg.content}
                      </div>
                    </div>

                    {/* Form data card */}
                    {msg.formData && (
                      <div className="pl-9">
                        <FormDataCard formData={msg.formData} onApply={handleApply} />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div className="flex gap-2.5">
                    <div className="shrink-0 size-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="size-4 text-primary" />
                    </div>
                    <div className="bg-muted/50 rounded-lg">
                      <TypingIndicator />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t px-4 py-3 bg-muted/20">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe the deal memo..."
                  rows={1}
                  disabled={isLoading}
                  className={cn(
                    'flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm',
                    'placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'min-h-[38px] max-h-[120px]'
                  )}
                  style={{ fieldSizing: 'content' }}
                />
                <Button
                  size="icon"
                  className="size-[38px] shrink-0"
                  disabled={!input.trim() || isLoading}
                  onClick={() => sendMessage()}
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-1.5 text-center">
                Press Enter to send
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
