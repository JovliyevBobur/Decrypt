import { useState } from 'react';
import { Lock, Unlock, Copy, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  EncryptionMethod,
  encryptionMethods,
  caesarEncrypt,
  caesarDecrypt,
  vigenereEncrypt,
  vigenereDecrypt,
  aesEncrypt,
  aesDecrypt,
  base64Encode,
  base64Decode,
  textToMorse,
  morseToText,
} from '@/lib/encryption';

export function EncryptionTool() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [method, setMethod] = useState<EncryptionMethod>('caesar');
  const [key, setKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const currentMethod = encryptionMethods[method];

  const processText = (mode: 'encrypt' | 'decrypt') => {
    if (!inputText.trim()) {
      toast({
        title: 'Input Required',
        description: 'Please enter some text to process.',
        variant: 'destructive',
      });
      return;
    }

    if (currentMethod.requiresKey && !key.trim()) {
      toast({
        title: `${currentMethod.keyLabel} Required`,
        description: `Please enter a ${currentMethod.keyLabel.toLowerCase()}.`,
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      let result = '';

      switch (method) {
        case 'caesar': {
          const shift = parseInt(key) || 0;
          result = mode === 'encrypt'
            ? caesarEncrypt(inputText, shift)
            : caesarDecrypt(inputText, shift);
          break;
        }
        case 'vigenere':
          result = mode === 'encrypt'
            ? vigenereEncrypt(inputText, key)
            : vigenereDecrypt(inputText, key);
          break;
        case 'aes':
          result = mode === 'encrypt'
            ? aesEncrypt(inputText, key)
            : aesDecrypt(inputText, key);
          break;
        case 'base64':
          result = mode === 'encrypt'
            ? base64Encode(inputText)
            : base64Decode(inputText);
          break;
        case 'morse':
          result = mode === 'encrypt'
            ? textToMorse(inputText)
            : morseToText(inputText);
          break;
      }

      setOutputText(result);
      toast({
        title: 'Success!',
        description: `Text ${mode === 'encrypt' ? 'encrypted' : 'decrypted'} successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    toast({
      title: 'Copied!',
      description: 'Output copied to clipboard.',
    });
  };

  const resetAll = () => {
    setInputText('');
    setOutputText('');
    setKey('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Method Selection */}
      <div className="glass rounded-2xl p-6 glow">
        <Label className="text-sm font-medium text-muted-foreground mb-3 block">
          Encryption Method
        </Label>
        <Select value={method} onValueChange={(v) => setMethod(v as EncryptionMethod)}>
          <SelectTrigger className="w-full h-12 text-base bg-background/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(encryptionMethods).map(([key, config]) => (
              <SelectItem key={key} value={key} className="py-3">
                <div className="flex flex-col items-start">
                  <span className="font-medium">{config.name}</span>
                  <span className="text-xs text-muted-foreground">{config.description}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <Label className="text-sm font-medium text-muted-foreground">
            Input Text
          </Label>
          <Textarea
            placeholder="Enter text to encrypt or decrypt..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[200px] bg-background/50 font-mono text-sm resize-none"
          />

          {/* Key/Password Input */}
          {currentMethod.requiresKey && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                {currentMethod.keyLabel}
              </Label>
              <Input
                type={currentMethod.keyType === 'number' ? 'number' : 'text'}
                placeholder={currentMethod.keyPlaceholder}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="bg-background/50"
                min={currentMethod.keyType === 'number' ? 1 : undefined}
                max={currentMethod.keyType === 'number' ? 25 : undefined}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => processText('encrypt')}
              disabled={isProcessing}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Lock className="w-4 h-4 mr-2" />
              {method === 'base64' ? 'Encode' : method === 'morse' ? 'To Morse' : 'Encrypt'}
            </Button>
            <Button
              onClick={() => processText('decrypt')}
              disabled={isProcessing}
              variant="secondary"
              className="flex-1"
            >
              <Unlock className="w-4 h-4 mr-2" />
              {method === 'base64' ? 'Decode' : method === 'morse' ? 'To Text' : 'Decrypt'}
            </Button>
          </div>
        </div>

        {/* Output Section */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground">
              Output Result
            </Label>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                disabled={!outputText}
                className="h-8 w-8"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetAll}
                className="h-8 w-8"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="min-h-[200px] bg-background/50 rounded-lg p-4 font-mono text-sm overflow-auto border border-border/50">
            {outputText ? (
              <p className="whitespace-pre-wrap break-all">{outputText}</p>
            ) : (
              <p className="text-muted-foreground italic">
                Result will appear here...
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-accent/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">{currentMethod.name}</p>
              <p className="text-muted-foreground">{currentMethod.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
