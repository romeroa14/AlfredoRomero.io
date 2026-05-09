import fs from 'fs';
import path from 'path';

const HTML_DIR = path.resolve('servicios');
const OUT_DIR = path.resolve('src/content/servicios');

function parsePrice(raw) {
  if (!raw) return null;
  const num = parseInt(raw.replace(/[$,]/g, '').trim(), 10);
  return isNaN(num) ? null : num;
}

function parseRatingText(text) {
  if (!text) return { rating: null, reviews: null };
  const m = text.match(/([\d.]+)\/5\s*\((\d+)/);
  if (!m) return { rating: null, reviews: null };
  return { rating: parseFloat(m[1]), reviews: parseInt(m[2], 10) };
}

function extractFeatures(html) {
  const features = [];
  const featureRegex = /<div class="feature-item">\s*<div class="feature-icon">([^<]*)<\/div>\s*<div class="feature-content">\s*<h4>([^<]*)<\/h4>\s*<p>([^<]*)<\/p>/gs;
  let m;
  while ((m = featureRegex.exec(html)) !== null) {
    features.push({ icon: m[1].trim(), title: m[2].trim(), description: m[3].trim() });
  }
  return features;
}

function extractGallery(html) {
  const imgs = [];
  const imgRegex = /<div class="gallery-thumb[^"]*">\s*<img src="([^"]+)"/gs;
  let m;
  while ((m = imgRegex.exec(html)) !== null) {
    const src = m[1].replace(/^\//, '');
    imgs.push(src);
  }
  return imgs;
}

function extractFAQ(html) {
  const faq = [];
  const detailRegex = /<details[^>]*>\s*<summary>([^<]*)<\/summary>\s*<p>([^<]*)<\/p>\s*<\/details>/gs;
  let m;
  while ((m = detailRegex.exec(html)) !== null) {
    faq.push({ question: m[1].trim(), answer: m[2].trim() });
  }
  return faq.length > 0 ? faq : null;
}

function extractShortDescription(html) {
  const m = html.match(/<div class="product-description">\s*<p>([^<]+)<\/p>/s);
  return m ? m[1].trim() : '';
}

function extractImage(html) {
  const m = html.match(/<div class="image-container">\s*<img src="([^"]+)"/);
  return m ? m[1].replace(/^\//, '') : null;
}

function extractAdditionalContent(html) {
  // Everything after the first product-features block OR after the product-description
  // We want content AFTER the features that's unique per service
  // Try to find whatsapp-form, pricing-details, etc.
  const bodyStart = html.indexOf('<body>');
  const bodyEnd = html.lastIndexOf('</body>');
  if (bodyStart === -1 || bodyEnd === -1) return '';
  
  const bodyContent = html.substring(bodyStart + 6, bodyEnd);
  
  // For product-page type, take everything after product-features blocks
  // but exclude WhatsApp forms, trust signals, and scripts (those are template-level)
  // For hero-based type, take everything after hero
  
  // Strategy: extract sections between product-features (end) and footer
  const footerIdx = bodyContent.indexOf('<footer');
  if (footerIdx === -1) return '';
  
  // Find the last </div> before product-info ends
  // Actually simpler: take all <section> and <div class="service-group"> etc. 
  // that appear after .product-features or hero section
  
  // For the product-page layout, find the end of product-info
  let contentStart = -1;
  
  // Check if it's product-page type
  if (bodyContent.includes('product-features')) {
    const featuresEnd = bodyContent.lastIndexOf('</section>');
    if (featuresEnd > 0) contentStart = featuresEnd + 10;
    else {
      const lastFeatureDiv = bodyContent.lastIndexOf('product-features');
      if (lastFeatureDiv > 0) {
        // find the next section after all product-features
        const afterFeatures = bodyContent.substring(lastFeatureDiv);
        const nextSection = afterFeatures.indexOf('<section');
        if (nextSection > 0) contentStart = lastFeatureDiv + nextSection;
        else contentStart = footerIdx; // no additional content
      }
    }
  }
  
  // For hero-based (ecommerce-completo)
  if (contentStart === -1 && bodyContent.includes('hero--text-only')) {
    const heroEnd = bodyContent.indexOf('</section>');
    if (heroEnd > 0) contentStart = heroEnd + 10;
    else contentStart = footerIdx;
  }
  
  if (contentStart === -1 || contentStart >= footerIdx) return '';
  
  let content = bodyContent.substring(contentStart, footerIdx).trim();
  
  // Strip orphaned <main> wrapper tags (content is partial HTML)
  content = content.replace(/<\/?main\s*>/g, '');
  
  // Strip HTML comments (MDX doesn't support them)
  content = content.replace(/<!--[\s\S]*?-->/g, '');
  
  // Strip WhatsApp form sections (they're template-y)
  content = content.replace(/<div class="whatsapp-form">[\s\S]*?<\/div>/g, '');
  // Strip trust signals
  content = content.replace(/<div class="trust-signals">[\s\S]*?<\/div>/g, '');
  // Strip WhatsApp FAB
  content = content.replace(/<a class="fab-whatsapp"[\s\S]*?<\/a>/g, '');
  // Remove inline scripts
  content = content.replace(/<script>[\s\S]*?<\/script>/g, '');
  
  // Remove inline scripts
  content = content.replace(/<script>[\s\S]*?<\/script>/g, '');
  
  return content.trim();
}

// Service definitions with order
const services = [
  {
    slug: 'one-page',
    file: 'one-page.html',
    order: 1,
  },
  {
    slug: 'informativa-dinamica',
    file: 'informativa-dinamica.html',
    order: 2,
    title: 'Web 5 Páginas', // H1 says Web 5 Páginas, not the slug
  },
  {
    slug: 'plan-emprendedor',
    file: 'plan-emprendedor.html',
    order: 3,
    isTemplate: 'alternative', // Different structure - hero-based, no product-page
  },
  {
    slug: 'plan-corporativo',
    file: 'plan-corporativo.html',
    order: 4,
    isTemplate: 'placeholder', // {{TITLE}} placeholders
  },
  {
    slug: 'ecommerce-completo',
    file: 'ecommerce-completo.html',
    order: 5,
    isTemplate: 'alternative', // Hero-based, not product-page
  },
  {
    slug: 'tienda-profesional',
    file: 'tienda-profesional.html',
    order: 6,
  },
  {
    slug: 'tienda-medida',
    file: 'tienda-medida.html',
    order: 7,
    isTemplate: 'placeholder', // {{TITLE}} placeholders
  },
  {
    slug: 'seo-inicial',
    file: 'seo-inicial.html',
    order: 8,
  },
  {
    slug: 'seo-intermedio',
    file: 'seo-intermedio.html',
    order: 9,
  },
  {
    slug: 'seo-avanzado',
    file: 'seo-avanzado.html',
    order: 10,
  },
  {
    slug: 'seo-ecommerce',
    file: 'seo-ecommerce.html',
    order: 11,
  },
  {
    slug: 'seo-basico',
    file: 'seo-basico.html',
    order: 12,
  },
  {
    slug: 'seo-profesional',
    file: 'seo-profesional.html',
    order: 13,
  },
  {
    slug: 'seo-premium',
    file: 'seo-premium.html',
    order: 14,
  },
  {
    slug: 'sistemas-basico',
    file: 'sistemas-basico.html',
    order: 15,
  },
  {
    slug: 'sistemas-premium',
    file: 'sistemas-premium.html',
    order: 16,
    isTemplate: 'placeholder', // {{TITLE}} placeholders
  },
  {
    slug: 'ia-automatizacion',
    file: 'ia-automatizacion.html',
    order: 17,
  },
  {
    slug: 'rifas-profesional',
    file: 'rifas-profesional.html',
    order: 18,
  },
];

// Hardcoded data for template-placeholder services
const placeholderData = {
  'plan-corporativo': {
    title: 'Plan Corporativo',
    metaTitle: 'Plan Corporativo | Alfredo Romero',
    metaDescription: 'Plan corporativo de desarrollo web con alcance, tiempos y entregables profesionales. Diseño, desarrollo y SEO para empresas.',
    category: 'Desarrollo Web',
    badge: null,
    price: 0,
    originalPrice: null,
    discount: null,
    shortDescription: 'Plan corporativo personalizado para empresas que necesitan una presencia web profesional con diseño a medida, SEO avanzado y soporte continuo.',
    features: [
      { icon: '🏢', title: 'Desarrollo Personalizado', description: 'Sitio web a medida para tu empresa' },
      { icon: '🔍', title: 'SEO Empresarial', description: 'Estrategia SEO para mercado competitivo' },
      { icon: '📊', title: 'Analytics Avanzado', description: 'Métricas y reportes detallados' },
      { icon: '🛡️', title: 'Seguridad y Mantenimiento', description: 'SSL, backups y soporte continuo' },
    ],
    faq: null,
    image: null,
    gallery: [],
  },
  'tienda-medida': {
    title: 'Tienda a Medida',
    metaTitle: 'Tienda a Medida | Alfredo Romero',
    metaDescription: 'Desarrollo de e-commerce completamente personalizado con código a medida, funcionalidades específicas y arquitectura escalable.',
    category: 'E-commerce',
    badge: null,
    price: 0,
    originalPrice: null,
    discount: null,
    shortDescription: 'Tienda online completamente personalizada con desarrollo a medida. Para negocios que requieren funcionalidades específicas no disponibles en soluciones estándar.',
    features: [
      { icon: '🛒', title: 'Desarrollo a Medida', description: 'Funcionalidades personalizadas para tu e-commerce' },
      { icon: '🔌', title: 'Integraciones Avanzadas', description: 'Conexión con ERP, CRM y APIs externas' },
      { icon: '📱', title: 'PWA y App Móvil', description: 'Experiencia mobile-first y app progresiva' },
      { icon: '📊', title: 'Dashboard Personalizado', description: 'Panel de control a medida de tu negocio' },
    ],
    faq: null,
    image: null,
    gallery: [],
  },
  'sistemas-premium': {
    title: 'Sistema Premium',
    metaTitle: 'Sistema Premium | Alfredo Romero',
    metaDescription: 'Sistema administrativo premium con funcionalidades avanzadas: contabilidad, RRHH, CRM y reportes gerenciales para grandes empresas.',
    category: 'Sistemas Administrativos',
    badge: null,
    price: 0,
    originalPrice: null,
    discount: null,
    shortDescription: 'Sistema administrativo premium con módulos avanzados para la gestión integral de tu empresa. Incluye contabilidad, recursos humanos, CRM y reportes gerenciales.',
    features: [
      { icon: '📊', title: 'Contabilidad Avanzada', description: 'Módulo contable completo con reportes fiscales' },
      { icon: '👥', title: 'RRHH y Nómina', description: 'Gestión de personal y cálculo de nómina' },
      { icon: '🤝', title: 'CRM Integrado', description: 'Gestión de relaciones con clientes' },
      { icon: '📈', title: 'Business Intelligence', description: 'Reportes gerenciales y dashboards' },
    ],
    faq: null,
    image: null,
    gallery: [],
  },
};

// Hardcoded data for alternative-template services (non-product-page structure)
const alternativeData = {
  'plan-emprendedor': {
    title: 'Plan Emprendedor',
    metaTitle: 'Plan Emprendedor | Alfredo Romero',
    metaDescription: 'Sitio dinámico hasta 5 páginas con SEO básico y auditoría inicial. Hosting y dominio 1 año incluidos.',
    category: 'Desarrollo Web',
    badge: null,
    price: 0,
    originalPrice: null,
    discount: null,
    rating: null,
    reviews: null,
    image: null,
    gallery: [],
    shortDescription: 'Lánzate con una web sólida desde el día uno: rendimiento, SEO y contenidos listos para crecer.',
    features: [
      { icon: '🌐', title: 'Web', description: 'Hasta 5 páginas, responsive, formularios' },
      { icon: '🔍', title: 'SEO', description: 'Keywords iniciales, On-Page, auditoría técnica' },
      { icon: '🖥️', title: 'Infraestructura', description: 'Hosting 1 año, dominio 1 año, SSL' },
    ],
    faq: null,
  },
  'ecommerce-completo': {
    title: 'Ecommerce Completo',
    metaTitle: 'Ecommerce Completo $450 | Alfredo Romero - Desarrollo Web & IA',
    metaDescription: 'Ecommerce completo con todos los servicios incluidos: carrito de compras, pasarela de pago, panel administrativo, SEO técnico y automatización con IA. Solo $450.',
    category: 'E-commerce',
    badge: null,
    price: 450,
    originalPrice: null,
    discount: null,
    rating: null,
    reviews: null,
    image: null,
    gallery: [],
    shortDescription: 'Tu tienda online completa por solo $450. Todo incluido: carrito de compras, pasarela de pago, panel administrativo WooCommerce, SEO técnico, automatización con IA y más.',
    features: [
      { icon: '🛒', title: 'Carrito de compras completo', description: 'Con WooCommerce' },
      { icon: '💳', title: 'Pasarela de pago integrada', description: 'Mercado Pago, PayPal' },
      { icon: '🔧', title: 'Panel administrativo', description: 'WooCommerce intuitivo' },
      { icon: '📦', title: 'Catálogo ilimitado', description: 'De productos' },
      { icon: '🔍', title: 'SEO técnico completo', description: 'Para posicionar' },
      { icon: '🤖', title: 'Automatización con IA', description: 'Atención al cliente' },
      { icon: '📊', title: 'Analítica y reportes', description: 'De ventas integrados' },
      { icon: '🎁', title: 'BONO GRATIS', description: 'Hosting y dominio por 1 año' },
    ],
    faq: [
      { question: '¿Cuánto tiempo tarda en estar lista mi tienda?', answer: 'El desarrollo completo toma 4-6 semanas, dependiendo de la complejidad de los productos y funcionalidades específicas que necesites.' },
      { question: '¿Puedo agregar más productos después?', answer: 'Sí, el panel administrativo de WooCommerce te permite agregar productos ilimitados sin costo adicional y de forma muy sencilla.' },
      { question: '¿Qué métodos de pago incluye?', answer: 'Incluye Mercado Pago, PayPal, transferencias bancarias y pagos en efectivo. WooCommerce permite agregar más métodos fácilmente.' },
      { question: '¿Incluye capacitación?', answer: 'Sí, incluye 2 horas de capacitación para que aprendas a gestionar tu tienda WooCommerce de forma independiente.' },
      { question: '¿Puedo personalizar el diseño?', answer: 'El diseño base está incluido, pero puedes solicitar personalizaciones adicionales por un costo extra.' },
      { question: '¿Por qué usar WooCommerce?', answer: 'WooCommerce es gratuito, fácil de usar, tiene miles de plugins disponibles y no requiere conocimientos técnicos para gestionarlo.' },
      { question: '¿Puedo migrar mi tienda existente?', answer: 'Sí, puedo ayudarte a migrar productos, clientes y datos desde otras plataformas hacia WooCommerce.' },
    ],
  },
};

function yamlValue(val) {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'string') {
    // Escape double quotes
    const escaped = val.replace(/"/g, '\\"');
    return `"${escaped}"`;
  }
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return '[]';
    if (typeof val[0] === 'string') {
      return `\n  - ${val.map(v => `"${v.replace(/"/g, '\\"')}"`).join('\n  - ')}`;
    }
    // array of objects
    return '\n' + val.map(item => {
      let s = '  - icon: ' + yamlValue(item.icon) + '\n';
      s += '    title: ' + yamlValue(item.title) + '\n';
      s += '    description: ' + yamlValue(item.description);
      return s;
    }).join('\n');
  }
  return String(val);
}

function processStandardService(filePath, svc) {
  const html = fs.readFileSync(filePath, 'utf8');
  
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const rawTitle = titleMatch ? titleMatch[1].trim() : svc.title || svc.slug;
  const pageTitle = rawTitle.split('|')[0].trim();
  const metaTitle = rawTitle;
  
  const descMatch = html.match(/<meta name="description"\s+content="([^"]+)"/);
  const metaDesc = descMatch ? descMatch[1].trim() : '';
  
  const catMatch = html.match(/<span class="product-category">([^<]+)<\/span>/);
  const category = catMatch ? catMatch[1].trim() : '';
  
  const badgeMatch = html.match(/<span class="badge badge--featured">([^<]+)<\/span>/);
  const badge = badgeMatch ? badgeMatch[1].trim() : null;
  
  const currentMatch = html.match(/<span class="price-current">([^<]+)<\/span>/);
  const origMatch = html.match(/<span class="price-original">([^<]+)<\/span>/);
  const discMatch = html.match(/<span class="price-discount">([^<]+)<\/span>/);
  
  const price = parsePrice(currentMatch ? currentMatch[1] : null);
  const originalPrice = parsePrice(origMatch ? origMatch[1] : null);
  const discount = discMatch ? discMatch[1].trim() : null;
  
  const ratingMatch = html.match(/<span class="rating-text">([^<]+)<\/span>/);
  const { rating, reviews } = parseRatingText(ratingMatch ? ratingMatch[1] : null);
  
  const image = extractImage(html);
  const gallery = extractGallery(html);
  const features = extractFeatures(html);
  const shortDesc = extractShortDescription(html);
  const faq = extractFAQ(html);
  const additionalContent = extractAdditionalContent(html);
  
  return {
    title: svc.title || pageTitle,
    metaTitle,
    metaDescription: metaDesc,
    category,
    badge,
    price: price || 0,
    originalPrice,
    discount,
    rating,
    reviews,
    image,
    gallery,
    shortDescription: shortDesc,
    features,
    faq,
    additionalContent,
    order: svc.order,
  };
}

function buildMdx(data) {
  const frontmatter = [];
  frontmatter.push('---');
  frontmatter.push(`title: "${data.title.replace(/"/g, '\\"')}"`);
  frontmatter.push(`metaTitle: "${data.metaTitle.replace(/"/g, '\\"')}"`);
  frontmatter.push(`metaDescription: "${data.metaDescription.replace(/"/g, '\\"')}"`);
  frontmatter.push(`category: "${data.category.replace(/"/g, '\\"')}"`);
  if (data.badge) frontmatter.push(`badge: "${data.badge.replace(/"/g, '\\"')}"`);
  else frontmatter.push(`badge: null`);
  frontmatter.push(`price: ${data.price || 0}`);
  if (data.originalPrice !== null && data.originalPrice !== undefined) frontmatter.push(`originalPrice: ${data.originalPrice}`);
  else frontmatter.push(`originalPrice: null`);
  if (data.discount) frontmatter.push(`discount: "${data.discount}"`);
  else frontmatter.push(`discount: null`);
  if (data.rating) frontmatter.push(`rating: ${data.rating}`);
  else frontmatter.push(`rating: null`);
  if (data.reviews) frontmatter.push(`reviews: ${data.reviews}`);
  else frontmatter.push(`reviews: null`);
  if (data.image) frontmatter.push(`image: "${data.image.replace(/"/g, '\\"')}"`);
  else frontmatter.push(`image: null`);
  
  // gallery
  if (data.gallery && data.gallery.length > 0) {
    frontmatter.push('gallery:');
    data.gallery.forEach(g => frontmatter.push(`  - "${g.replace(/"/g, '\\"')}"`));
  } else {
    frontmatter.push('gallery: []');
  }
  
  // features
  if (data.features && data.features.length > 0) {
    frontmatter.push('features:');
    data.features.forEach(f => {
      frontmatter.push(`  - icon: "${f.icon}"`);
      frontmatter.push(`    title: "${f.title.replace(/"/g, '\\"')}"`);
      frontmatter.push(`    description: "${f.description.replace(/"/g, '\\"')}"`);
    });
  } else {
    frontmatter.push('features: []');
  }
  
  // faq
  if (data.faq && data.faq.length > 0) {
    frontmatter.push('faq:');
    data.faq.forEach(f => {
      frontmatter.push(`  - question: "${f.question.replace(/"/g, '\\"')}"`);
      frontmatter.push(`    answer: "${f.answer.replace(/"/g, '\\"')}"`);
    });
  } else {
    frontmatter.push('faq: null');
  }
  
  frontmatter.push(`order: ${data.order}`);
  frontmatter.push('---');
  
  let body = '';
  if (data.shortDescription) {
    body += `\n${data.shortDescription}\n`;
  }
  if (data.additionalContent) {
    body += `\n${data.additionalContent}\n`;
  }
  
  return frontmatter.join('\n') + '\n' + body;
}

// Main
for (const svc of services) {
  const filePath = path.join(HTML_DIR, svc.file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${svc.file}`);
    continue;
  }
  
  let data;
  
  if (svc.isTemplate === 'placeholder') {
    data = { ...placeholderData[svc.slug], order: svc.order };
    data.additionalContent = '';
  } else if (svc.isTemplate === 'alternative') {
    data = { ...alternativeData[svc.slug], order: svc.order };
    // For ecommerce-completo, extract the rich sections (pricing, FAQ, process, etc.)
    // For plan-emprendedor, the content is minimal - just skip additionalContent
    if (svc.slug === 'ecommerce-completo') {
      const html = fs.readFileSync(filePath, 'utf8');
      data.additionalContent = extractAdditionalContent(html);
    } else {
      data.additionalContent = '';
    }
  } else {
    data = processStandardService(filePath, svc);
  }
  
  const mdx = buildMdx(data);
  const outPath = path.join(OUT_DIR, `${svc.slug}.mdx`);
  fs.writeFileSync(outPath, mdx, 'utf8');
  console.log(`CREATED: ${svc.slug}.mdx (order: ${svc.order}, category: ${data.category}, price: ${data.price})`);
}

console.log(`\nDone! ${services.length} files processed.`);
