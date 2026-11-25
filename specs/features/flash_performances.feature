# encoding: UTF-8
# Spec 4 — Feature: Registro de Flash Performances Callejeras
# Owner: Mateo — Equipo Pulso Loja
# Servicio que valida: catalog-service (registro) + telemetry-service (notificación)

@flash @callejero @catalog
Feature: Registro de Flash Performances Callejeras
  Como artista callejero registrado en el festival
  Quiero poder anunciar un acto espontáneo desde mi ubicación GPS
  Para que los espectadores cercanos sean notificados en tiempo real

  Background:
    Given el sistema de catalog-service está operativo
    And el bus de eventos Redis Pub/Sub está disponible
    And el telemetry-service está escuchando el canal "FlashPerformanceStarted"

  # ─────────────────────────────────────────────────
  # REGLA 1: Validación del perímetro del festival
  # ─────────────────────────────────────────────────
  Rule: Solo se pueden registrar flash-performances dentro del perímetro del festival

    @perimetro @valido @happy_path
    Scenario: Artista registra flash-performance válida dentro del perímetro
      Given el artista "Colectivo Máscaras" está autenticado con rol "artista"
      And su ubicación GPS es latitud -3.9985, longitud -79.1972
      And esta ubicación está dentro del perímetro del festival (radio 2.5km desde el centro)
      When registra una flash-performance con nombre "Rituales Andinos" de 30 minutos estimados
      Then el sistema debe crear el evento con estado "en_vivo"
      And el evento debe tener categoría "flash"
      And se debe emitir el evento de dominio "FlashPerformanceStarted" al bus Redis
      And el telemetry-service debe notificar a espectadores en un radio de 500 metros
      And la respuesta debe retornar el ID del evento creado con código HTTP 201

    @perimetro @invalido @fuera_del_area
    Scenario: Rechazo de flash-performance fuera del perímetro del festival
      Given el artista "DJ Andino" está autenticado con rol "artista"
      And su ubicación GPS es latitud -4.1200, longitud -79.3000
      And esta ubicación está FUERA del perímetro del festival
      When intenta registrar una flash-performance
      Then el sistema debe rechazar el registro con código HTTP 422
      And el código de error debe ser "OUTSIDE_FESTIVAL_PERIMETER"
      And el mensaje debe ser "Tu ubicación no está dentro del área del festival"
      And NO se debe emitir ningún evento al bus Redis

    @perimetro @limite @borde
    Scenario: Flash-performance exactamente en el límite del perímetro se acepta
      Given el artista "Teatro Callejero Sur" está autenticado
      And su ubicación GPS está exactamente a 2.5km del centro del festival
      When intenta registrar una flash-performance
      Then el sistema debe aceptar el registro

  # ─────────────────────────────────────────────────
  # REGLA 2: Autorización — solo artistas registrados
  # ─────────────────────────────────────────────────
  Rule: Solo artistas con credenciales del festival pueden registrar flash-performances

    @auth @no_autenticado
    Scenario: Espectador sin credenciales de artista no puede registrar flash-performance
      Given un usuario con rol "espectador" está autenticado
      When intenta registrar una flash-performance
      Then el sistema debe rechazar la solicitud con código HTTP 403
      And el mensaje debe ser "Se requiere credencial de artista del festival"

    @auth @no_autenticado
    Scenario: Solicitud sin JWT es rechazada
      Given no hay token de autenticación en la solicitud
      When se intenta registrar una flash-performance
      Then el sistema debe responder con código HTTP 401

  # ─────────────────────────────────────────────────
  # REGLA 3: Notificación a espectadores cercanos
  # ─────────────────────────────────────────────────
  Rule: El telemetry-service notifica a espectadores dentro del radio configurado

    @notificacion @radio_default
    Scenario: Notificación a espectadores en radio de 500m (default)
      Given el artista "Colectivo Máscaras" registra una flash-performance en Plaza San Sebastián
      And hay 150 espectadores con GPS activo en el sistema
      And 42 espectadores están dentro de un radio de 500m de la flash-performance
      When se emite el evento "FlashPerformanceStarted"
      Then el telemetry-service debe enviar notificación WebSocket a exactamente 42 espectadores
      And el mensaje debe incluir el nombre del acto, artista, distancia y coordenadas

    @notificacion @radio_personalizado
    Scenario: Artista solicita radio de notificación personalizado
      Given el artista configura un radio de notificación de 300 metros
      When registra la flash-performance
      Then solo los espectadores dentro de 300m deben recibir la notificación

  # ─────────────────────────────────────────────────
  # REGLA 4: Duración estimada obligatoria
  # ─────────────────────────────────────────────────
  Rule: La duración estimada del acto debe ser válida

    @validacion @duracion
    Scenario Outline: Validación de duración estimada
      Given el artista "Colectivo Máscaras" está autenticado y dentro del perímetro
      When intenta registrar una flash-performance con duración de <duracion> minutos
      Then el sistema debe responder con código HTTP <codigo>

      Examples:
        | duracion | codigo |
        | 0        | 400    |
        | 4        | 400    |
        | 5        | 201    |
        | 60       | 201    |
        | 120      | 201    |
        | 121      | 400    |
