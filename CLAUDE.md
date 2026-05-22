# RIVA — notas de proyecto

## Contexto
The RIVA Company — flooring premium (RIVA Spain + TIERRA). Estética: minimalista, lujo, conexión con naturaleza. Negro + ivory, tipografía geométrica fina, sin sombras, sin bordes redondeados.

## Fuente de verdad
- `DESIGN.md` — sistema de diseño completo (color, tipo, voz, componentes). Cualquier asset nuevo debe partir de ahí.

## Aprendizajes operativos
- Para extraer sistema de diseño de un benchmark PDF: leer una sola vez con `Read` (PDF se renderiza como imágenes), luego escribir directo. No hace falta OCR ni herramientas extra.
- Para tareas de tipo "crea documento de referencia": ir directo a Write tras leer el input — no abrir skills de docx/pdf a menos que el output deba ser .docx/.pdf.
- **Edits muy grandes en HTML pueden truncar el archivo silenciosamente** (el tool reporta success pero la escritura se corta a mitad). Verificar con `wc -l` y `tail` tras Edit > ~200 líneas. Si pasa, reconstruir con `bash heredoc + cat head+tail` directamente sobre el filesystem — más rápido que pelearse con el Edit tool.
- Para tomar gráficas de un SPA de referencia: navegar con Chrome browser → click sidebar icon (no link genérico) → screenshot rápido es suficiente, no leer DOM completo (gasta tokens). 1-2 screenshots por vista bastan.
