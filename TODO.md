## Procesar una web
- [x] Recibir una url y hacer un fetch
- [x] Con la página actual, buscar todas las urls que le pertenecen al mismo dominio
- [x] Revisar todas y cada una de las urls encontradas sin repetir (usando Set)
- [x] Guardar las urls dentro de un json en la carpeta data/{project}/links.json
- [x] Por cada URL revisada, convertir la página a markdown y guardarla en la carpeta data/{project}/pages/{page title}.md
    - [x] ignorar contenido innecesario
        - [x] Footer
        - [x] header
        - [x] forms
        - [x] imagenes
        - [x] links internos (#)
        - [x] elementos vacíos o sin sentido
- [ ] Guardar todos los chunks en data/{project}/chunks.json y los embeddings generados en data/{project}/embeddings.json
    - [ ] Implementar servicio de embeddings
    - [ ] Dividir el contenido en chunks significativos
    - [ ] Generar embeddings para cada chunk
    - [ ] Guardar chunks y embeddings en archivos JSON

## Generar prompt
- [ ] Dado unos datos ingresados (lead de un cliente) extraer el contenido del mensaje y usarlo para obtener los embeddings del mensaje
- [ ] Usando los embeddings del mensaje buscar dentro de los embeddings del proyecto cuales son los chunks que más se asemejen al mensaje del lead
- [ ] Usar el contenido del lead para extraer el dominio del cliente en el correo electrónico y hacer una búsqueda en internet
    - [ ] Búsqueda en google, ¿existe en los primeros resultados?
    - [ ] Entrar al dominio, petición fetch y obtener el contenido de la página encontrada
        - [ ] Convertirlo a Markdown
        - [ ] Generar un resumen del contenido
- [ ] Dado un prompt principal agregar los datos encontrados prompt + embeddings/chunks encontrados + resumen página + formato correo

## Peticiones recibidas
- [ ] Se reciben leads y se generan los prompts
- [ ] Se realizan las peticiones con el modelo especificado usando el prompt utilizado
- [ ] Todas las peticiones se deben realizar en paralelo
- [ ] La respuesta deberá ser un html correctamente formateado
- [ ] Guardar un log de respuestas dentro de un google sheet

## Mejoras técnicas
- [x] Mover interfaces a archivos específicos en la carpeta types
- [ ] Agregar tests unitarios
- [ ] Implementar manejo de errores más robusto
- [ ] Agregar logging estructurado
- [ ] Mejorar la documentación del código
- [ ] Configurar CI/CD
- [ ] Agregar métricas y monitoreo
