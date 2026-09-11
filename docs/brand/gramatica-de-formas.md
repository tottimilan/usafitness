# Gramática de formas de USA Fitness — lo que el brand book y la tienda hacen, visto

**Fecha:** 2026-08-27 · **Fuente:** las 6 páginas renderizadas del brand book (`docs/brand/0*.png`), los 3 banners oficiales de campaña (`fuentes/*Landing Comunidad Banner*`) y el render del interior de tienda (`fuentes/WhatsApp Image…jpeg`). **Visto con los ojos, no transcrito.**
**Por qué existe:** el dueño pidió «fijarse en los brandbooks y los docs, que tienen un claro patrón de shapes, triángulos». Lo tienen. Y **ninguna de las plantillas construidas hasta hoy lo usa** — usaron tipografías condensadas ajenas a la marca y ni una diagonal.

---

## 1. Los siete elementos, por orden de presencia

| # | Elemento | Dónde aparece | Cómo es exactamente |
|---|---|---|---|
| **1** | **La cuña diagonal de esquina** | En las 6 páginas del brand book (siempre), en los 3 banners, en los paneles de pared de la tienda, en la puerta de la nevera, en la cartelería interior | Un **triángulo rectángulo cian `#00A7E1`** que entra por la esquina superior izquierda a ~45°, ocupando entre el 15 y el 30 % del ancho. En los banners aparece también en azul de marca y en blanco translúcido sobre foto. **Es el recurso nº 1 y está construido físicamente en las tiendas** |
| **2** | **La banda de metal cepillado** | Esquina inferior izquierda de las 6 páginas del brand book; esquina inferior derecha de los banners 1 y 3 | Franja diagonal con **degradado de plata cepillada** (blanco → gris claro → blanco con veta horizontal). Siempre acompaña a la cuña cian formando un chevrón: cian arriba, metal abajo, con un hueco blanco entre las dos |
| **3** | **El rayado diagonal fino** | Los 3 banners (esquinas y fondo) | **Líneas paralelas finas a 45°**, separadas ~3 veces su grosor, en gris claro, blanco translúcido o cian. Funciona como textura de esquina y como «velocidad». Nunca cubre texto |
| **4** | **Los círculos punteados** | Banners 1 y 2 | **Circunferencias de trazo punteado** (puntos redondos separados) en azul, rojo, verde, usadas como MARCO de un bloque de texto o como camino que une elementos. Grandes: 300-450 px. Es el único uso del rojo como forma fuera del logo |
| **5** | **El pin de llamada** | Banners 2 y 3 | Una **línea fina con un punto anillado** al final, que sale del título hacia el texto secundario: un «callout» de infografía. Colores: azul, rojo, verde, morado (uno distinto por bloque) |
| **6** | **Tipografía mixta en la misma línea** | Banners y cartelería de tienda | «FORMA PARTE DE NUESTRA **COMUNIDAD**»: Light + Bold en un mismo titular. Y en la tienda, sans en mayúsculas + **una palabra en script/cursiva**: «SUPPORT FOR YOUR *Sport* HERE», «YOU ARE *Stronger* THAN YOU THINK», «YOUR *Journey* IS OUR GOAL!». Los claims van en inglés |
| **7** | **La base blanca y luminosa** | Render de tienda entero | Estantería blanca, suelo claro, luz alta. El color es acento sobre blanco, nunca fondo total. **La marca no es oscura** — una plantilla nocturna es una lectura nuestra, no suya |

**Colores en aplicación:** el **cian `#00A7E1` domina** las superficies (cuñas, paneles, fondos de banner), no el azul `#0055B8`, que queda para titulares y para el logo. El rojo `#E1251B` aparece solo en el logo y en un círculo punteado: es acento escaso. El gris `#98989A` es el gris del logo y de los subtítulos; el `#DADADA` el de los fondos.

**Tipografía:** Helvetica Neue LT Std con cinco roles prescritos — Bold (títulos), Bold Extended (slogans, hashtags), Extended (subtítulos), Roman y Light (cuerpo). En web se sustituye por una neo-grotesca con licencia libre; lo que hay que trasladar es el **sistema de roles**, no la fuente.

**Logo sobre foto:** solo blanco o negro según luminosidad. Zona de protección = altura de «FITNESS».

## 2. Lo que esto permite y las anteriores no vieron

La marca tiene **una gramática geométrica completa** — cuña, chevrón cian/metal, rayado, círculo punteado, pin, script — que ningún referente del sector capturado tiene (NOCCO, Bulk, Huel, AG1… son tipografía + foto). Eso es exactamente lo que hace falta para que cinco plantillas sean **distintas entre sí y reconociblemente USA Fitness a la vez**: cada una puede tomar UN elemento de la gramática como motivo principal y los demás como secundarios.

| Motivo principal | Qué plantilla sale de ahí (hipótesis, a validar en la fase de diseño) |
|---|---|
| La cuña diagonal | Composición en diagonales: secciones cortadas a 45°, foto entrando por una cuña, la web como el propio local |
| El chevrón cian + metal | Bandas y franjas: ritmo horizontal de color y plata, cartel de campaña |
| El rayado fino | Textura y velocidad: fondos rayados, el rayado como barra de progreso/scroll, aire deportivo |
| El círculo punteado + pin | Infografía: los datos (horario, cifras, placa) enmarcados en círculos punteados con pines — la web como panel informativo |
| Script + mayúsculas | Editorial de cartelería: la palabra en cursiva como gesto, claims cortos, base blanca con mucho aire |

## 3. Reglas de uso que se deducen del propio material

1. **Una cuña por pantalla, en una esquina.** El brand book nunca pone dos. Repetirla en cada sección la convierte en clip-art.
2. **El rayado no pisa texto.** Vive en esquinas y en zonas sin contenido.
3. **El círculo punteado enmarca UN bloque de texto**, no decora.
4. **El rojo no es fondo.** Solo logo, un acento, y —por nuestra propia regla de sistema— lo que caduca (oferta).
5. **La base es blanca.** El cian y el metal son superficie parcial, no total.
6. **La script es UNA palabra por titular**, nunca una frase.
7. **En pantalla, el metal cepillado es un degradado CSS** (lineal, con vetas por `repeating-linear-gradient`), no una imagen: 0 KB.

## 4. Qué no está en la marca y hay que decidir nosotros

- **Modo oscuro**: no existe en el material. Si se hace, es nuestra extensión (la capa nocturna de infraestructura ya decidida), no un uso de marca.
- **Tipografía condensada**: no existe. Barlow Condensed (plantilla `energia`) y Big Shoulders (propuesta «Cartel») son ajenas a la marca. Válidas como decisión de diseño, pero hay que saberlo: **se alejan de la identidad, no la expresan.**
- **Movimiento**: el material es estático. Las diagonales y el rayado sugieren velocidad; cómo se mueven en pantalla es decisión de plantilla.

## 5. Documentos de la central que también son material de diseño

- **ANEXO Integración Digital** (`fuentes/`): la central obliga a cada franquiciado a grabar un **vídeo-tour** (4K, 60 fps, ≥20 clips: centro comercial → trayecto → tiendas vecinas → cartel → interior → productos), que ella edita y publica en su cuenta oficial. **Es un activo de contenido que cada tienda tendrá o debería tener**, y encaja literalmente en el slot de vídeo de la galería y en «Hoy en tienda» (el trayecto hasta la puerta, en vídeo). Puerta: OK de la central para alojarlo.
- **GUÍA TIENDAS** (lead magnet, 8 capítulos): Intro · Expertos (Gouveia: campeón IFBB/NPC; **Amanda Gil: CAFAD, TAFAD, certificación de entrenadora — NO nutricionista**, confirma la cautela YMYL) · Bases de nutrición · Consejos · «Diseña tu dieta» (**no replicar en web: consejo dietético**) · FAQ de seguidores respondidas por dependientes (**fuente directa para nuestra FAQ local y Las verdades**) · Únete · **Regalo: orientación gratuita en tienda** (= nuestro `/guia` imán invertido, tal cual).
