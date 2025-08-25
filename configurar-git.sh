#!/bin/bash

echo "🔧 Configurando Git para Cursor..."
echo ""

# Verificar si Git está instalado
if ! command -v git &> /dev/null; then
    echo "❌ Git no está instalado. Instálalo primero."
    exit 1
fi

echo "✅ Git está instalado: $(git --version)"
echo ""

# Configurar información del usuario
echo "👤 Configurando información del usuario..."
git config --global user.name "Alfredo Romero"
git config --global user.email "romeroa14@gmail.com"

# Configurar credenciales
echo "🔐 Configurando credenciales..."
git config --global credential.helper store
git config --global credential.helper 'store --file ~/.git-credentials'

# Configurar editor por defecto
echo "📝 Configurando editor por defecto..."
git config --global core.editor "cursor --wait"

# Configurar autocrlf para Linux
echo "🔄 Configurando autocrlf..."
git config --global core.autocrlf input

# Configurar pull strategy
echo "📥 Configurando estrategia de pull..."
git config --global pull.rebase false

# Configurar push por defecto
echo "📤 Configurando push por defecto..."
git config --global push.default simple

# Configurar alias útiles
echo "⚡ Configurando alias útiles..."
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'

echo ""
echo "📋 Configuración actual:"
echo "   Usuario: $(git config --global user.name)"
echo "   Email: $(git config --global user.email)"
echo "   Editor: $(git config --global core.editor)"
echo "   Credential helper: $(git config --global credential.helper)"
echo ""

echo "🎯 Para usar GitHub con token personalizado:"
echo "1. Ve a GitHub.com → Settings → Developer settings → Personal access tokens"
echo "2. Genera un nuevo token con permisos de repo"
echo "3. Usa el token como contraseña cuando Git te lo pida"
echo ""

echo "🔑 Alternativa: Configurar SSH (recomendado)"
echo "1. Genera una clave SSH: ssh-keygen -t ed25519 -C 'romeroa14@gmail.com'"
echo "2. Agrega la clave a GitHub: cat ~/.ssh/id_ed25519.pub"
echo "3. Cambia la URL del repo a SSH: git remote set-url origin git@github.com:romeroa14/AlfredoRomero.io.git"
echo ""

echo "✅ Configuración completada!"
echo ""
echo "💡 Próximos pasos:"
echo "1. Intenta hacer push nuevamente"
echo "2. Si sigue fallando, usa un token personalizado de GitHub"
echo "3. O configura SSH para mayor seguridad"
