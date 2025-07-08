'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, Clock, BookOpen, LayoutDashboard, MessageSquare } from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

export function MemoryNavigation() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  // Evitar erros de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/memory-dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      description: 'Visão geral de todos os tipos de memória',
    },
    {
      title: 'Memória Contextual',
      href: '/contextual-memory-viewer',
      icon: <Brain className="h-5 w-5" />,
      description: 'Visualize o contexto atual da conversa',
    },
    {
      title: 'Memória Semântica',
      href: '/memory-viewer',
      icon: <BookOpen className="h-5 w-5" />,
      description: 'Explore entidades e relacionamentos',
    },
    {
      title: 'Memória Episódica',
      href: '/episodic-memory-viewer',
      icon: <Clock className="h-5 w-5" />,
      description: 'Visualize a linha do tempo de eventos',
    },
    {
      title: 'Chat Otimizado',
      href: '/chat-optimized',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'Interface de chat com desempenho otimizado',
    },
  ];

  if (!isClient) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-2 p-4 bg-muted/40 rounded-lg mb-8">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className="w-full sm:w-auto">
            <Button
              variant={isActive ? 'default' : 'outline'}
              className="w-full justify-start gap-2"
              size="sm"
            >
              {item.icon}
              <span>{item.title}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}