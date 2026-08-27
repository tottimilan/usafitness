# Ficha — Ronda 2 (aprobada íntegra el 27-ago)

**Estado:** hojas de objetivos escritas para lo aprobado. Construcción bloqueada por la puerta de diseño (referencias visuales + confirmación del dueño) y por las **puertas externas comunes**: OK escrito de la central (guía PDF + imagen/credenciales del equipo) y verificación documental del título de Amanda Gil.
**Formato compacto:** las claves largas (evidencia, riesgos, mecanismo) viven en `docs/product/ronda2-innovacion.md`; aquí, el contrato R5 de cada pieza.

---

## Estrellas

```
PIEZA: «Empieza aquí» — asesor de 3 toques (sección interactiva)
PREGUNTA: P6 — no sé por dónde empezar (y me da vergüenza preguntar)
CONVERSIÓN: N2 (WhatsApp precalificado) → N1
EVENTO: punto_de_partida{ruta} + contacto_whatsapp con origen
PEOR TIENDA: contenido de marca (rutas escritas una vez); sin móvil → «enseña
  este resultado en tienda». Digna por construcción.
DATO BLOQUEADO: los árboles de rutas se redactan CON el equipo (YMYL: solo
  categorías y lenguaje de objetivo; puerta del dueño sobre el contenido).
FRASE: «tu WhatsApp te llega con el diagnóstico del cliente ya hecho».
```

```
PIEZA: /guia — el imán invertido (landing)
PREGUNTA: P6/P5 · CONVERSIÓN: N6 orientación
EVENTO: vale_orientacion (universal) · pedir_cita{origen} (capa solo con
  móvil verificado + compromiso del franquiciado)
PEOR TIENDA: el vale sin cita funciona en TODAS hoy; la capa de cita hoy
  solo en Vigo — es argumento de la sesión de alta, no promesa.
DATO BLOQUEADO: OK de la central para alojar el PDF (recomprimido, noindex).
FRASE: «la promesa que tu marca imprime en su guía, cumplida solo por tu
  tienda — y cada vale es una visita con intención declarada».
```

```
PIEZA: «Apártamelo» — botón de reserva (mecanismo en Oferta y Novedades)
PREGUNTA: refuerza P2 · CONVERSIÓN: N7 reserva
EVENTO: pedir_reserva{seccion, producto}
PEOR TIENDA: gate por móvil verificado; sin él, no se pinta. Cero promesa rota.
FRASE: «tu web pasa de folleto a canal de pedidos: X apartados este mes».
```

## Entran con condición

```
PIEZA: Las verdades del mostrador · P7 · N2 · verdad_abierta{cual}
GATE: firmado por central y franquiciado o NO se muestra (visible() por flag).
PEOR TIENDA: contenido de marca; el flag por tienda decide.
FRASE: «la única tienda del sector que te dice qué NO comprar».
```

```
PIEZA: Tarjeta que vuelve · «¿por qué volver?» · N8 · cupon_vuelta{origen}
GATE: beneficio dimensionado como cortesía (anti-fraude); canje contable en caja.
FRASE: «el cliente que ya te compró, de vuelta antes de que se le acabe el bote».
```

```
PIEZA: Placa de la tienda · P4 · sin evento (exenta declarada)
MECANISMO: cifras calculadas en SSR desde datos ya existentes; omisión
  automática en tiendas jóvenes. Cero mantenimiento.
FRASE: «números verificables, no adjetivos».
```

```
PIEZA: Ruta «Mujer» con Amanda Gil · P2/P4 · ver_productos{ruta:mujer}
GATE DURO: título de Amanda verificado con documento ANTES de titularla +
  permiso de imagen. Si cae la puerta: firma-de-marca sin foto o no nace.
EVIDENCIA: 557/1.683 productos de la categoría Mujer; cero presencia web.
FRASE: «un tercio de tu catálogo por fin tiene a quién hablarle».
```

```
PIEZA: Serie del experto · operativa (alimenta canal + consejo + oferta)
GATE: pieza mensual de flota con fusible evergreen — disciplina del operador.
PIEZA: QR del escaparate · N1/N4 · utm_source=qr · el vinilo dice LA OFERTA.
PIEZA: /mostrador · objetivo interno, sin GA4 · piloto 2 tiendas, éxito se
  evalúa preguntando.
PIEZA: Muro que no se pudre · solo dentro del servicio mensual pagado.
PIEZA: Mi Pase (localStorage) · INFRAESTRUCTURA de estrellas 1-2, no producto.
PIEZA: Ruta /regalo · P8 estacional · ruta del asesor en nov-ene, sin evento
  hasta demostrar demanda.
```

## Puertas para arrancar diseño

| Puerta | Dueño | Estado |
|---|---|---|
| OK central: PDF guía + imagen/credenciales equipo (un viaje) | operador | 🔒 pendiente |
| Título de Amanda Gil, documentado | operador | 🔒 pendiente |
| Beneficios completos del socio | central → operador | 🔒 pendiente (sin fecha) |
| Confirmación de diseño (referencias visuales por plantilla) | dueño | siguiente fase |
