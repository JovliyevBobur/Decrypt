import { Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { EncryptionTool } from '@/components/EncryptionTool';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">CryptoBox</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Secure Text Encryption
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-gradient">Encrypt</span> & <span className="text-gradient">Decrypt</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Transform your text using classic ciphers and modern encryption. 
            All processing happens locally in your browser.
          </p>
        </div>

        {/* Encryption Tool */}
        <EncryptionTool />

        {/* Features */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Caesar Cipher', desc: 'Classic shift cipher' },
            { title: 'Vigenère', desc: 'Keyword-based encryption' },
            { title: 'AES-256', desc: 'Military-grade security' },
            { title: '100% Private', desc: 'All processing in-browser' },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-muted/50 border border-border/50 text-center"
            >
              <h3 className="font-medium mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Chess Link */}
        <div className="mt-8 text-center">
          <a 
            href="/chess" 
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            🎮 Play 3D Chess
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>All encryption runs locally in your browser. Your data never leaves your device.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
