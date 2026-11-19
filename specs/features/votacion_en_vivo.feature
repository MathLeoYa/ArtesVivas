# language: es
# encoding: UTF-8
# Spec 4 — Feature: Votación en Vivo (Aplausómetro Digital)
# Owner: Mateo — Equipo Pulso Loja
# Servicio que valida: gamification-service (registro) + telemetry-service (difusión)

@votacion @gamification @aplausometro
Feature: Votación en Vivo — Aplausómetro Digital del Festival
  Como espectador del festival
  Quiero votar por los actos que más me gustan mientras los presencio en vivo
  Para contribuir al ranking cultural y reconocer a los artistas del FIAVL

  Background:
    Given el gamification-service está operativo
    And el bus de eventos Redis Pub/Sub está disponible
    And el telemetry-service está escuchando el canal "VoteCast"

  # ─────────────────────────────────────────────────
  # REGLA 1: Voto válido dentro de geocerca del evento
  # ─────────────────────────────────────────────────
  Rule: Solo se puede votar si el espectador está físicamente presente en el evento

    @happy_path @geocerca @voto_valido
    Scenario: Voto válido de espectador dentro del radio del evento
      Given el espectador "usuario-123" está autenticado
      And el evento "Danza de los Saraguros" (ID: event-001) está en estado "en_vivo"
      And el evento se realiza en coordenadas latitud -3.9985, longitud -79.1972
      And el espectador está en coordenadas latitud -3.9988, longitud -79.1975
      And la distancia entre el espectador y el evento es de 42 metros (dentro de los 200m permitidos)
      When emite un voto de 5 estrellas para el evento "Danza de los Saraguros"
      Then el voto debe registrarse exitosamente con código HTTP 201
      And el conteo total del aplausómetro para event-001 debe incrementarse en 1
      And se debe emitir el evento de dominio "VoteCast" al bus Redis
      And los clientes suscritos al canal "festival/votes/live/event-001" deben recibir el nuevo conteo

    @geocerca @fuera_del_radio
    Scenario: Rechazo de voto cuando el espectador está lejos del evento
      Given el espectador "usuario-456" está autenticado
      And el evento "Máscaras Rituales" está en estado "en_vivo" en Plaza San Sebastián
      And el espectador está en coordenadas a 350 metros del evento (fuera de los 200m permitidos)
      When intenta emitir un voto de 4 estrellas
      Then el sistema debe rechazar el voto con código HTTP 422
      And el código de error debe ser "OUTSIDE_VOTE_RADIUS"
      And el mensaje debe ser "Debes estar cerca del evento para votar (máx. 200m)"
      And el conteo del aplausómetro NO debe cambiar

  # ─────────────────────────────────────────────────
  # REGLA 2: Un solo voto por usuario por evento
  # ─────────────────────────────────────────────────
  Rule: Cada espectador puede votar una única vez por evento

    @idempotencia @voto_duplicado
    Scenario: Rechazo de voto duplicado del mismo usuario
      Given el espectador "usuario-123" ya votó por el evento "Danza de los Saraguros"
      And el evento sigue en estado "en_vivo"
      When el espectador intenta emitir otro voto para el mismo evento
      Then el sistema debe rechazar el voto con código HTTP 409
      And el código de error debe ser "VOTE_ALREADY_CAST"
      And el mensaje debe ser "Ya emitiste tu voto para este evento"
      And el conteo del aplausómetro NO debe cambiar

    @idempotencia @multiples_eventos
    Scenario: El mismo usuario puede votar por eventos diferentes
      Given el espectador "usuario-123" ya votó por el evento "Danza de los Saraguros"
      And el evento "Percusión Amazónica" está en estado "en_vivo" y el espectador está cerca
      When el espectador emite un voto para "Percusión Amazónica"
      Then el voto debe registrarse exitosamente

  # ─────────────────────────────────────────────────
  # REGLA 3: Solo se puede votar por eventos en curso
  # ─────────────────────────────────────────────────
  Rule: El voto solo es válido si el evento está actualmente en estado "en_vivo"

    @estado_evento @no_iniciado
    Scenario: Rechazo de voto para evento aún no iniciado
      Given el evento "Circo Andino" está en estado "programado"
      And el espectador está a 50 metros del escenario
      When el espectador intenta votar por "Circo Andino"
      Then el sistema debe rechazar el voto con código HTTP 422
      And el código de error debe ser "EVENT_NOT_LIVE"
      And el mensaje debe ser "Solo puedes votar por eventos que están en curso ahora mismo"

    @estado_evento @finalizado
    Scenario: Rechazo de voto para evento ya finalizado
      Given el evento "Danza de los Saraguros" cambió a estado "finalizado"
      When el espectador intenta emitir un voto
      Then el sistema debe rechazar el voto con código HTTP 422
      And el código de error debe ser "EVENT_NOT_LIVE"

    @estado_evento @cancelado
    Scenario: Rechazo de voto para evento cancelado
      Given el evento "Flash Callejero" fue cancelado (estado "cancelado")
      When el espectador intenta emitir un voto
      Then el sistema debe rechazar el voto con código HTTP 422

  # ─────────────────────────────────────────────────
  # REGLA 4: Validación de la calificación
  # ─────────────────────────────────────────────────
  Rule: La calificación debe estar entre 1 y 5 estrellas

    @validacion @calificacion
    Scenario Outline: Validación del rango de calificación
      Given el espectador está autenticado y dentro del radio del evento en curso
      When emite un voto con calificación de <calificacion> estrellas
      Then el sistema debe responder con código HTTP <codigo>

      Examples:
        | calificacion | codigo |
        | 0            | 400    |
        | 1            | 201    |
        | 3            | 201    |
        | 5            | 201    |
        | 6            | 400    |

  # ─────────────────────────────────────────────────
  # REGLA 5: Aplausómetro en tiempo real
  # ─────────────────────────────────────────────────
  Rule: El aplausómetro se actualiza en tiempo real tras cada voto

    @tiempo_real @websocket
    Scenario: El aplausómetro se actualiza instantáneamente tras un voto
      Given 50 espectadores están suscritos al canal WebSocket "festival/votes/live/event-001"
      And el conteo actual del aplausómetro es de 100 votos con promedio 4.5
      When un espectador válido emite un voto de 5 estrellas
      Then en menos de 500 milisegundos los 50 clientes deben recibir el mensaje "LiveVoteCount"
      And el mensaje debe mostrar 101 votos y el nuevo promedio recalculado

    @tiempo_real @acumulacion
    Scenario: El conteo acumulado del aplausómetro es correcto
      Given el evento "Danza de los Saraguros" tiene 0 votos inicialmente
      When 5 espectadores diferentes votan con calificaciones 5, 4, 5, 3, 5
      Then el total de votos debe ser 5
      And el promedio debe ser 4.4
      And la distribución debe ser: 5-estrellas:3, 4-estrellas:1, 3-estrellas:1

  # ─────────────────────────────────────────────────
  # REGLA 6: Autenticación requerida para votar
  # ─────────────────────────────────────────────────
  Rule: Solo usuarios autenticados pueden votar

    @auth @no_autenticado
    Scenario: Voto sin autenticación es rechazado
      Given no hay token JWT en la solicitud
      When se intenta emitir un voto
      Then el sistema debe responder con código HTTP 401
      And el mensaje debe indicar que se requiere autenticación
