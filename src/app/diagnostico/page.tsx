"use client";

/**
 * PÁGINA DE DIAGNÓSTICO
 *
 * CÓMO USAR:
 * 1. Crea un archivo: app/diagnostico/page.tsx
 * 2. Copia este código completo
 * 3. Guarda
 * 4. Ve a http://localhost:3000/diagnostico
 * 5. Envíame screenshot de lo que ves
 */

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DiagnosticoPage() {
  const [diagnostico, setDiagnostico] = useState({
    paso1: { status: "⏳", mensaje: "Verificando cliente Supabase..." },
    paso2: { status: "⏳", mensaje: "Obteniendo sesión..." },
    paso3: { status: "⏳", mensaje: "Verificando perfil..." },
    paso4: { status: "⏳", mensaje: "Verificando variables de entorno..." },
  });

  const [logs, setLogs] = useState<string[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    const ejecutarDiagnostico = async () => {
      try {
        // PASO 1: Cliente Supabase
        addLog("🔵 Iniciando diagnóstico...");
        let supabase;
        try {
          supabase = createClient();
          setDiagnostico((prev) => ({
            ...prev,
            paso1: { status: "✅", mensaje: "Cliente creado correctamente" },
          }));
          addLog("✅ Cliente Supabase creado");
        } catch (error: any) {
          setDiagnostico((prev) => ({
            ...prev,
            paso1: { status: "❌", mensaje: `Error: ${error.message}` },
          }));
          addLog("❌ Error creando cliente: " + error.message);
          return;
        }

        // PASO 2: Sesión
        addLog("🔵 Obteniendo sesión...");
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            setDiagnostico((prev) => ({
              ...prev,
              paso2: { status: "❌", mensaje: `Error: ${error.message}` },
            }));
            addLog("❌ Error en sesión: " + error.message);
            return;
          }

          if (!session) {
            setDiagnostico((prev) => ({
              ...prev,
              paso2: {
                status: "⚠️",
                mensaje: "No hay sesión activa. Necesitas hacer login.",
              },
            }));
            addLog("⚠️ No hay sesión");
            return;
          }

          setSessionData(session);
          setDiagnostico((prev) => ({
            ...prev,
            paso2: {
              status: "✅",
              mensaje: `Sesión activa: ${session.user.email}`,
            },
          }));
          addLog("✅ Sesión encontrada: " + session.user.email);

          // PASO 3: Perfil
          addLog("🔵 Obteniendo perfil...");
          try {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profileError) {
              setDiagnostico((prev) => ({
                ...prev,
                paso3: {
                  status: "⚠️",
                  mensaje: `Error en perfil: ${profileError.message}`,
                },
              }));
              addLog("⚠️ Error en perfil: " + profileError.message);
            } else {
              setProfileData(profile);
              setDiagnostico((prev) => ({
                ...prev,
                paso3: {
                  status: "✅",
                  mensaje: `Perfil cargado: ${profile.nombre || profile.email}`,
                },
              }));
              addLog("✅ Perfil cargado");
            }
          } catch (profileError: any) {
            setDiagnostico((prev) => ({
              ...prev,
              paso3: {
                status: "❌",
                mensaje: `Exception: ${profileError.message}`,
              },
            }));
            addLog("❌ Exception en perfil: " + profileError.message);
          }
        } catch (sessionError: any) {
          setDiagnostico((prev) => ({
            ...prev,
            paso2: {
              status: "❌",
              mensaje: `Exception: ${sessionError.message}`,
            },
          }));
          addLog("❌ Exception en sesión: " + sessionError.message);
        }

        // PASO 4: Variables de entorno
        addLog("🔵 Verificando variables de entorno...");
        const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
        const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (hasUrl && hasKey) {
          setDiagnostico((prev) => ({
            ...prev,
            paso4: { status: "✅", mensaje: "Variables configuradas" },
          }));
          addLog("✅ Variables de entorno OK");
        } else {
          setDiagnostico((prev) => ({
            ...prev,
            paso4: {
              status: "❌",
              mensaje: `Falta: ${!hasUrl ? "URL" : ""} ${!hasKey ? "KEY" : ""}`,
            },
          }));
          addLog("❌ Variables faltantes");
        }

        addLog("🎉 Diagnóstico completado");
      } catch (error: any) {
        addLog("❌ Error general: " + error.message);
      }
    };

    ejecutarDiagnostico();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Diagnóstico del Sistema
          </h1>
          <p className="text-gray-600">
            Esta página verifica que todo esté funcionando correctamente
          </p>
        </div>

        {/* Resultados */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📊 Resultados</h2>
          <div className="space-y-4">
            {Object.entries(diagnostico).map(([key, value]) => (
              <div
                key={key}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <span className="text-2xl">{value.status}</span>
                <div>
                  <div className="font-semibold text-gray-900">
                    {key.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600">{value.mensaje}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Data */}
        {sessionData && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">🔐 Datos de Sesión</h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          </div>
        )}

        {/* Profile Data */}
        {profileData && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">👤 Datos de Perfil</h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify(profileData, null, 2)}
            </pre>
          </div>
        )}

        {/* Logs */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📝 Logs de Ejecución</h2>
          <div className="bg-gray-900 text-gray-300 p-4 rounded-lg max-h-96 overflow-auto font-mono text-xs">
            {logs.map((log, i) => (
              <div key={i} className="mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Variables de Entorno */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">🔑 Variables de Entorno</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>
              <span className="font-bold">NEXT_PUBLIC_SUPABASE_URL:</span>{" "}
              <span className="text-green-600">
                {process.env.NEXT_PUBLIC_SUPABASE_URL
                  ? "✅ Configurada"
                  : "❌ No configurada"}
              </span>
            </div>
            <div>
              <span className="font-bold">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>{" "}
              <span className="text-green-600">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                  ? "✅ Configurada"
                  : "❌ No configurada"}
              </span>
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-900">
            📸 Siguiente Paso
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-900">
            <li>Toma un screenshot completo de esta página</li>
            <li>Abre Chrome DevTools (F12) → Console</li>
            <li>Toma screenshot de la consola también</li>
            <li>Envía ambos screenshots</li>
          </ol>
        </div>

        {/* Acciones */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">🎯 Acciones Rápidas</h2>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              🔄 Recargar Diagnóstico
            </button>
            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              🔐 Ir a Login
            </button>
            <button
              onClick={() => (window.location.href = "/portal")}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              🏠 Ir a Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
