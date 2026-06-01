# Sistema de Cálculo de Elo (Documentación del Flujo)

Este documento explica de forma detallada el funcionamiento de la función `_apply_elo`, encargada de actualizar la puntuación Elo de los jugadores tras finalizar una partida.

## Resumen del Flujo Lógico

El cálculo del Elo sigue una serie de validaciones estrictas y operaciones matemáticas antes de persistir los datos. A continuación, se detalla el orden de ejecución:

[Partida Finalizada]
         │
         ▼
¿Es modo IA? ───────────► SÍ ───► [Cierre: No cambia Elo]
         │ NO
         ▼
¿Falta Jugador Blanco? ──► SÍ ───► [Cierre: No cambia Elo]
         │ NO
         ▼
[Asignar Puntuación Real] (1.0 / 0.0 / 0.5)
         │
         ▼
¿Falta Jugador Negro? ───► SÍ ───► [Cierre: No cambia Elo]
         │ NO
         ▼
[Calcular Expectativa de Victoria] (_expected_score)
         │
         ▼
[Aplicar Fórmula Elo] (K-Factor = 32)
         │
         ▼
[Aplicar Límite Mínimo] (Elo mínimo = 100)
         │
         ▼
[Guardar en Base de Datos]

---

## Desglose de Etapas

### 1. Validaciones de Seguridad (Filtros Iniciales)
Para evitar errores en la base de datos o cálculos inconsistentes, la función aplica los siguientes filtros:
* **Modo IA:** Si la partida se jugó contra la Inteligencia Artificial, se interrumpe el flujo inmediatamente.
* **Existencia del Jugador Blanco:** Se verifica que el identificador exista y que el usuario se encuentre registrado en la base de datos. Si no es así, la función termina sin realizar cambios.

### 2. Puntuación Real del Encuentro (`score_white`)
Se asigna un valor numérico al resultado obtenido por el jugador blanco:
* **Victoria Blanca:** `1.0`
* **Victoria Negra:** `0.0`
* **Empate:** `0.5`

Para el jugador negro, la puntuación se calcula de forma inversa: `score_black = 1.0 - score_white`.

### 3. Cálculo del Resultado Esperado (`_expected_score`)
Antes de modificar los puntajes, el sistema calcula la probabilidad estadística que tenía cada jugador de ganar el encuentro en base a su Elo previo. La fórmula matemática utilizada es:

$$E_A = \frac{1}{1 + 10^{\frac{R_B - R_A}{400}}}$$

* Si un jugador se enfrenta a alguien con un Elo mucho más alto, su expectativa de victoria ($E$) será cercana a `0.0`.
* Si se enfrenta a alguien con menor nivel, su expectativa será cercana a `1.0`.

### 4. Actualización y Factor K
El **Factor K** está fijado en `32`, lo que representa la máxima cantidad de puntos que un jugador puede ganar o perder en una sola partida. La fórmula de actualización es:

$$Elo_{nuevo} = Elo_{actual} + K \times (Resultado_{real} - Resultado_{esperado})$$

### 5. Restricción de Suelo y Persistencia
* **Límite Mínimo:** Se utiliza la función `max(100, ...)` para garantizar que ningún jugador baje de los **100 puntos de Elo**, sin importar cuántas partidas pierda.
* **Guardado:** Finalmente, los nuevos valores se redondean, se convierten a enteros y se guardan en la base de datos a través de `db.add()`.
