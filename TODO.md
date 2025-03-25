## Procesar una web
- [ ] Recibir una url y hacer un fetch
- [ ] Con la página actual, búscar todas las urls que le pertenecen al mismo dominio
- [ ] Revisar todas y cada una de las urls encontradas sin repetir (¿usar un Set?)
- [ ] Guardar las urls dentro de un json en la carpeta data/{project}/links.json
- [ ] Por cada URL revisada, convertir la página a markdown y guardla en la carpeta data/{project}/pages/{page title}.md
    - [ ] ignorar contenido innecesario
        - [ ] Footer
        - [ ] header
        - [ ] forms
        - [ ] imagenes
        - [ ] ¿links?
- [ ] Guardar todos los chunks en data/{project}/chunks.json y los embedings generados en data/{project}/embedings.json
- [ ] De todos los archivos guardados (páginas generadas) para el proyecto, tokenizar la página con un LLM (Gemini y OpenAI) y tiktoken, cada chunk debe ser una sección las secciónes pueden estar divididas entre --- (se puede repetir 3 o más veces)

## Generar prompt
- [ ] dado unos datos ingresados (lead de un cliente) extraer el contenido del mensaje y usarlo para obtener los embeddings del mensaje
- [ ] Usando los embeddings del mensaje buscar dentro de los embedings del proyecto cuales son los chunks que más se asemejen al mensaje del lead
- [ ] Usar el contenido del lead para extraer el dominio del cliente en el correo electrónico y hacer una búsqueda en internet
    - [ ] Búsqueda en google, ¿existe en los primeros resultados?
    - [ ] Entrar al dominio, petición fetch y obtener el contenido de la página encontrada
        - [ ] Convertirlo a Markdown
        - [ ] Generar un resúmen del contenido
- [ ] dado un prompt principal agregar los datos encontrados prompt + embedings/chunks encontrados + resume página + formato correo

## Peticiónes recibidas
- [ ] Se reciben leads y se generan los prompts
- [ ] Se realizan las peticiónes con el modelo específicado usando el prompt utilizado
- [ ] Todas las peticiónes se deben realizar en paralelo
- [ ] La respuesta deberá ser un html correctamente formateado
- [ ] Guardar un log de respuestas dentro de un google sheet
