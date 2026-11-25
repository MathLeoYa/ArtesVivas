# language: es
# encoding: UTF-8
# Spec 4 — Feature: Pasaporte Cultural Digital y Badges
# Owner: Mateo — Equipo Pulso Loja
# Servicio que valida: gamification-service (sellos y badges) + telemetry-service (notificación)
# Regla de negocio: Los espectadores obtienen sellos al visitar escenarios dentro de 100m
# y desbloquean insignias al alcanzar hitos de participación.

@pasaporte @gamification @badges
Feature: Pasaporte Cultural Digital y Sistema de Badges
  Como espectador del festival
  Quiero sellar mi pasaporte cultural al visitar los escenarios del FIAVL
  Para acumular puntos y desbloquear insignias conmemorativas del festival

  Background:
    Given el gamification-service está operativo
    And el bus de eventos Redis Pub/Sub está disponible
    And el catálogo de escenarios de catalog-service está sincronizado

  # ─────────────────────────────────────────────────
  # REGLA 1: Sellado de visita dentro de geocerca de 100m
  # ─────────────────────────────────────────────────
  Rule: Solo se puede sellar un escenario si el espectador está a menos de 100 metros

    @happy_path @geocerca @sello_valido
    Scenario: Sello exitoso cuando el espectador está dentro de los 100 metros
      Given el espectador "usuario-123" está autenticado con JWT válido
      And el escenario "Teatro Benjamín Carrión" está en coordenadas latitud -3.9970, longitud -79.1980
      And el espectador se encuentra a 35 metros del escenario
      When solicita sellar su visita al escenario "Teatro Benjamín Carrión"
      Then el sistema debe registrar el sello con código HTTP 201
      And otorgar 50 puntos nuevos al pasaporte del espectador
      And emitir el evento de dominio "StampEarned" al bus Redis

    @geocerca @fuera_del_radio
    Scenario: Rechazo de sello cuando el espectador está fuera de los 100 metros
      Given el espectador "usuario-456" está autenticado
      And el espectador se encuentra a 347 metros del escenario "Plaza San Sebastián"
      When intenta sellar su visita al escenario
      Then el sistema debe rechazar la solicitud con código HTTP 422
      And el código de error debe ser "OUTSIDE_STAMP_RADIUS"
      And el mensaje debe ser "Necesitas estar a menos de 100m del escenario para obtener el sello"
      And NO se debe emitir ningún evento al bus Redis

  # ─────────────────────────────────────────────────
  # REGLA 2: Unicidad de sello por escenario
  # ─────────────────────────────────────────────────
  Rule: Cada espectador puede obtener un único sello por escenario

    @idempotencia @sello_duplicado
    Scenario: Rechazo de sello duplicado en el mismo escenario
      Given el espectador "usuario-123" ya obtuvo el sello de "Teatro Benjamín Carrión"
      And sigue ubicado a menos de 100 metros del escenario
      When intenta sellar nuevamente el mismo escenario
      Then el sistema debe rechazar la solicitud con código HTTP 409
      And el código de error debe ser "STAMP_ALREADY_EXISTS"
      And el mensaje debe ser "Ya tienes el sello de este escenario en tu pasaporte"

  # ─────────────────────────────────────────────────
  # REGLA 3: Desbloqueo automático de Badges
  # ─────────────────────────────────────────────────
  Rule: Al completar hitos de sellos se desbloquean badges automáticamente

    @badges @desbloqueo
    Scenario: Desbloqueo del badge "Explorador Andino" al obtener el quinto sello
      Given el espectador "usuario-123" tiene 4 sellos distintos y 200 puntos acumulados
      And el badge "Explorador Andino" requiere 5 sellos en el pasaporte
      When sella exitosamente su quinto escenario distinto ("Calle Lourdes")
      Then la respuesta debe incluir el campo "badgeDesbloqueado" con "Explorador Andino"
      And el total de puntos debe actualizarse a 250
      And se debe emitir el evento de dominio "BadgeUnlocked" al bus Redis

  # ─────────────────────────────────────────────────
  # REGLA 4: Autenticación requerida
  # ─────────────────────────────────────────────────
  Rule: Solo usuarios autenticados pueden sellar su pasaporte

    @auth @no_autenticado
    Scenario: Solicitud de sello sin JWT es rechazada
      Given no hay token JWT en la solicitud
      When se intenta sellar un escenario
      Then el sistema debe responder con código HTTP 401
