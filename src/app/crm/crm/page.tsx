"use client";

import {
  MessageCircle,
  Wrench,
  Code2,
  Sparkles,
  ArrowLeft,
  Send,
  Bot,
  Users,
  BarChart3,
  Zap,
  Clock,
  MessageSquareText,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

export default function WhatsAppComingSoonPage() {
  const upcomingFeatures = [
    { icon: Send, label: "Envío masivo de mensajes" },
    { icon: Bot, label: "Chatbot automatizado" },
    { icon: MessageSquareText, label: "Plantillas de mensajes" },
    { icon: Users, label: "Gestión de contactos" },
    { icon: Clock, label: "Programación de envíos" },
    { icon: BarChart3, label: "Métricas y analytics" },
    { icon: Zap, label: "Respuestas rápidas" },
    { icon: UserCheck, label: "Asignación de conversaciones" },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        {/* Animated Icon */}
        <div className="relative mx-auto w-32 h-32 mb-8">
          {/* Outer ring - pulsing */}
          <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-20" />

          {/* Middle ring */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-green-100 to-emerald-100" />

          {/* Inner circle with icon */}
          <div className="absolute inset-4 rounded-full bg-white shadow-lg flex items-center justify-center">
            <div className="relative">
              <MessageCircle className="w-12 h-12 text-green-600 fill-green-50" />
              {/* Sparkle accents */}
              <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>

          {/* Floating elements */}
          <div className="absolute -top-2 -left-2 w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-lg animate-bounce">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <div
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg animate-bounce"
            style={{ animationDelay: "0.2s" }}
          >
            <Wrench className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold mb-4">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          NUEVA INTEGRACIÓN
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
          WhatsApp Business
        </h1>
        <p className="text-slate-500 mb-6 leading-relaxed">
          Estamos integrando WhatsApp Business API para que puedas comunicarte
          con tus clientes directamente desde el CRM.
        </p>

        {/* Progress indicator */}
        <div className="bg-slate-100 rounded-full p-1 mb-6 max-w-xs mx-auto">
          <div className="flex items-center gap-2 text-xs font-medium">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"
                style={{ width: "45%" }}
              />
            </div>
            <span className="text-slate-600 pr-2">45%</span>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            En desarrollo activo
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
            📅 Q1 2025
          </span>
        </div>

        {/* Features coming */}
        <div className="bg-gradient-to-br from-slate-50 to-green-50/50 rounded-2xl p-6 mb-8 border border-slate-200/50">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">
            🚀 Próximamente podrás:
          </h3>
          <div className="grid grid-cols-2 gap-3 text-left">
            {upcomingFeatures.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-slate-600"
                >
                  <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  {feature.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* WhatsApp Preview Mock */}
        <div className="bg-[#0b141a] rounded-2xl p-4 mb-8 max-w-xs mx-auto shadow-xl">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white text-sm font-medium">Whapy CRM</p>
              <p className="text-green-400 text-xs">en línea</p>
            </div>
          </div>
          <div className="py-4 space-y-2">
            <div className="bg-[#202c33] text-white text-xs p-2 rounded-lg rounded-tl-none max-w-[80%]">
              ¡Hola! ¿En qué podemos ayudarte? 👋
            </div>
            <div className="bg-green-600 text-white text-xs p-2 rounded-lg rounded-tr-none max-w-[80%] ml-auto">
              Quiero info sobre sus servicios
            </div>
            <div className="flex gap-1 ml-1">
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
              <span
                className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <span
                className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </div>
        </div>

        {/* Back button */}
        <Link
          href="/crm"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/25 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al CRM
        </Link>
      </div>
    </div>
  );
}
