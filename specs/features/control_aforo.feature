# encoding: UTF-8
# Spec 4 — Feature: Control de Aforo en Tiempo Real
# Owner: Mateo — Equipo Pulso Loja
# Servicio que valida: telemetry-service
# Regla de negocio: El sistema debe controlar el acceso a escenarios para
# evitar sobrepoblación en espacios patrimoniales de Loja.

@aforo @critico @telemetry
Feature: Control de Aforo en Tiempo Real
  Como organizador del festival
  Quiero que el sistema controle automáticamente el aforo de cada escenario
  Para garantizar la seguridad y comodidad en espacios patrimoniales de Loja

  Background:
    Given el sistema de telemetría está operativo
    And la conexión con Redis está activa
    And el bus de eventos Redis Pub/Sub está disponible

  # ─────────────────────────────────────────────────
  # REGLA 1: Niveles del semáforo de aforo
  # ─────────────────────────────────────────────────
  Rule: El semáforo refleja el nivel de ocupación del escenario en tiempo real

    @semaforo @verde
    Scenario: Semáforo inicia en verde con escenario vacío
      Given el escenario "Plaza San Sebastián" tiene capacidad para 500 personas
      And actualmente hay 0 personas registradas
      Then el nivel de aforo del escenario debe ser "verde"

    @semaforo @amarillo
    Scenario: Semáforo cambia a amarillo al alcanzar el 70% de capacidad
      Given el escenario "Plaza San Sebastián" tiene capacidad para 500 personas
      And actualmente hay 349 personas registradas
      When se registra el ingreso de 1 persona más
      Then la ocupación total debe ser 350 personas
      And el nivel de aforo debe cambiar a "amarillo"
      And se debe emitir el evento de dominio "CapacityWarning" al bus Redis
      And todos los clientes WebSocket suscritos al canal "festival/venues/{id}/capacity" deben recibir la actualización

    @semaforo @rojo
    Scenario: Semáforo cambia a rojo al alcanzar el 100% de capacidad
      Given el escenario "Teatro Benjamín Carrión" tiene capacidad para 300 personas
      And actualmente hay 299 personas registradas
      When se registra el ingreso de 1 persona más
      Then la ocupación total debe ser 300 personas
      And el nivel de aforo debe cambiar a "rojo"
      And se debe emitir el evento de dominio "CapacityFull" al bus Redis

    @semaforo @verde @recuperacion
    Scenario: Semáforo vuelve a verde cuando la ocupación baja del 70%
      Given el escenario "Plaza San Sebastián" tiene capacidad para 500 personas
      And actualmente hay 350 personas (nivel amarillo)
      When se registran 2 salidas del escenario
      Then la ocupación total debe ser 348 personas
      And el nivel de aforo debe cambiar a "verde"
      And se debe emitir la actualización vía WebSocket

  # ─────────────────────────────────────────────────
  # REGLA 2: Bloqueo de ingreso en aforo completo
  # ─────────────────────────────────────────────────
  Rule: No se permite el ingreso cuando el escenario está al 100% de capacidad

    @bloqueo @aforo_completo
    Scenario: Rechazo de ingreso cuando el escenario está al máximo
      Given el escenario "Teatro Benjamín Carrión" está al 100% de su capacidad (300/300)
      When un espectador intenta registrar su ingreso
      Then el sistema debe rechazar el ingreso con código "CAPACITY_FULL"
      And mostrar el mensaje "Aforo completo — te sugerimos escenarios cercanos disponibles"
      And la respuesta debe incluir hasta 3 escenarios alternativos con aforo disponible ordenados por distancia

    @bloqueo @aforo_completo @alternativas
    Scenario: El sistema sugiere alternativas disponibles al rechazar el ingreso
      Given el escenario "Plaza de la Independencia" está al 100% de capacidad
      And el escenario "Casa de la Cultura Núcleo de Loja" está al 60% de capacidad
      And el escenario "Plaza San Sebastián" está al 40% de capacidad
      When un espectador intenta ingresar a "Plaza de la Independencia"
      Then el sistema debe rechazar el ingreso
      And retornar "Casa de la Cultura Núcleo de Loja" como primera alternativa
      And retornar "Plaza San Sebastián" como segunda alternativa

  # ─────────────────────────────────────────────────
  # REGLA 3: Registro de ingresos y salidas
  # ─────────────────────────────────────────────────
  Rule: El sistema registra ingresos y salidas para mantener el conteo exacto

    @conteo @ingreso
    Scenario: Registrar ingreso incrementa el contador del escenario
      Given el escenario "Plaza San Sebastián" tiene 100 personas registradas
      When se registra el ingreso de un espectador con token de acceso válido
      Then el contador del escenario debe ser 101
      And el cambio debe reflejarse en Redis en menos de 100 milisegundos

    @conteo @salida
    Scenario: Registrar salida decrementa el contador del escenario
      Given el escenario "Plaza San Sebastián" tiene 100 personas registradas
      When se registra la salida de un espectador
      Then el contador del escenario debe ser 99
      And el cambio debe reflejarse en Redis en menos de 100 milisegundos

    @conteo @limite_minimo
    Scenario: El contador no puede ser negativo
      Given el escenario "Plaza San Sebastián" tiene 0 personas registradas
      When se intenta registrar una salida
      Then el contador debe permanecer en 0
      And no se debe emitir evento de error

  # ─────────────────────────────────────────────────
  # REGLA 4: Persistencia del estado de aforo
  # ─────────────────────────────────────────────────
  Rule: El estado del aforo se mantiene en Redis con alta disponibilidad

    @persistencia @redis
    Scenario: El estado del aforo persiste ante reconexiones del cliente
      Given el escenario "Plaza San Sebastián" tiene 200 personas registradas
      When un cliente WebSocket se desconecta y vuelve a conectar
      Then debe recibir el estado actual de aforo (200 personas) inmediatamente al reconectar
