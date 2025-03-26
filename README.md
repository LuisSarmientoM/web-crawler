# MailBot

Un sistema automatizado para procesar sitios web y generar respuestas contextuales a correos electrónicos.

## Estructura del Proyecto

```
src/
├── services/
│   ├── web/
│   │   ├── crawler.ts       # Servicio de crawling web
│   │   └── markdown-converter.ts  # Conversor HTML a Markdown
│   └── storage/
│       └── file-storage.ts  # Manejo de almacenamiento
├── types/
│   ├── crawler.ts          # Tipos para el crawler
│   └── turndown.d.ts       # Declaraciones de tipos
└── index.ts               # Punto de entrada
```

## Flujo de Procesamiento

1. **Web Crawling**
   - Inicio desde una URL base
   - Crawling recursivo respetando profundidad máxima
   - Filtrado de URLs por patrones y extensiones
   - Limpieza de elementos HTML no deseados
   - Manejo de concurrencia y timeouts

2. **Procesamiento de Contenido**
   - Extracción de contenido relevante
   - Conversión a Markdown estructurado
   - Preservación de elementos importantes (links, tablas)
   - Eliminación de elementos no deseados

3. **Almacenamiento**
   - Organización por proyectos
   - Guardado de páginas en Markdown
   - Registro de enlaces descubiertos
   - Sanitización de nombres de archivo

## Uso

```typescript
// Inicializar servicios
const crawler = new WebCrawler(url, {
  maxDepth: 2,
  maxPages: 10,
  excludePatterns: ['/api/', '/admin'],
  removeElements: ['header', 'footer']
});

const converter = new MarkdownConverter({
  keepLinks: true,
  keepTables: true
});

const storage = new FileStorage({
  projectName: 'mi-proyecto'
});

// Procesar sitio
const results = await crawler.crawl();
for (const result of results) {
  const markdown = converter.convert(result.content);
  await storage.saveMarkdownFile(result.title, markdown);
}
```

## Estructura de Datos

### Archivos Generados

```
data/
└── projects/
    └── [proyecto]/
        ├── pages/
        │   ├── pagina-1.md
        │   └── pagina-2.md
        └── links.json
```

### Formato de Archivos

- **pages/*.md**: Contenido de páginas en Markdown
- **links.json**: Registro de URLs y sus conexiones

## Configuración

### Crawler Options
```typescript
interface CrawlerOptions {
  maxDepth?: number;      // Profundidad máxima
  maxPages?: number;      // Límite de páginas
  excludePatterns?: string[]; // Patrones a excluir
  removeElements?: string[];  // Elementos a eliminar
  // ...
}
```

### Markdown Options
```typescript
interface MarkdownConverterOptions {
  keepLinks?: boolean;    // Mantener enlaces
  keepTables?: boolean;   // Mantener tablas
  keepImages?: boolean;   // Mantener imágenes
  // ...
}
```

## Próximos Pasos

- [ ] Generación de embeddings para chunks de contenido
- [ ] Integración con LLMs para procesamiento
- [ ] Sistema de búsqueda semántica
- [ ] API para procesamiento de correos

## Licencia

MIT
