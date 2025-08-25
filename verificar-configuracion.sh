#!/bin/bash

echo "🔍 Verificando configuración de Cursor/VS Code para AlfredoRomero.io..."
echo ""

# Verificar que los archivos de configuración existen
echo "📁 Verificando archivos de configuración:"

if [ -f ".vscode/settings.json" ]; then
    echo "✅ settings.json - OK"
else
    echo "❌ settings.json - NO ENCONTRADO"
fi

if [ -f ".vscode/extensions.json" ]; then
    echo "✅ extensions.json - OK"
else
    echo "❌ extensions.json - NO ENCONTRADO"
fi

if [ -f ".vscode/tasks.json" ]; then
    echo "✅ tasks.json - OK"
else
    echo "❌ tasks.json - NO ENCONTRADO"
fi

if [ -f ".vscode/launch.json" ]; then
    echo "✅ launch.json - OK"
else
    echo "❌ launch.json - NO ENCONTRADO"
fi

if [ -f ".vscode/snippets.json" ]; then
    echo "✅ snippets.json - OK"
else
    echo "❌ snippets.json - NO ENCONTRADO"
fi

echo ""

# Verificar estructura del proyecto
echo "📂 Verificando estructura del proyecto:"

if [ -f "index.html" ]; then
    echo "✅ index.html - OK"
else
    echo "❌ index.html - NO ENCONTRADO"
fi

if [ -d "assets" ]; then
    echo "✅ assets/ - OK"
else
    echo "❌ assets/ - NO ENCONTRADO"
fi

if [ -d "assets/css" ]; then
    echo "✅ assets/css/ - OK"
else
    echo "❌ assets/css/ - NO ENCONTRADO"
fi

if [ -d "assets/js" ]; then
    echo "✅ assets/js/ - OK"
else
    echo "❌ assets/js/ - NO ENCONTRADO"
fi

echo ""

# Verificar si Cursor está instalado
echo "🎯 Verificando Cursor:"

if command -v cursor &> /dev/null; then
    echo "✅ Cursor está instalado"
    echo "   Ubicación: $(which cursor)"
else
    echo "⚠️  Cursor no encontrado en PATH"
    echo "   Asegúrate de que Cursor esté instalado y en tu PATH"
fi

echo ""

# Mostrar información del sistema
echo "💻 Información del sistema:"
echo "   Sistema operativo: $(uname -s)"
echo "   Arquitectura: $(uname -m)"
echo "   Directorio actual: $(pwd)"

echo ""

echo "🎉 ¡Configuración verificada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Abre Cursor en este directorio: cursor ."
echo "2. Instala las extensiones recomendadas"
echo "3. Reinicia Cursor para aplicar configuraciones"
echo "4. Usa Ctrl+Shift+P para acceder a tareas y comandos"
echo ""
echo "🔧 Comandos útiles en Cursor:"
echo "   Ctrl+Shift+P - Comando palette"
echo "   Ctrl+Shift+X - Extensiones"
echo "   Ctrl+Shift+D - Debugging"
echo "   Ctrl+Shift+T - Tareas"
echo ""
echo "📚 Documentación:"
echo "   - extensiones-cursor.md - Guía de extensiones"
echo "   - .vscode/README.md - Documentación completa"
