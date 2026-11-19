# language: es
# encoding: UTF-8
# Spec 4 — Feature: Alertas Meteorológicas y Reubicación de Escenarios
# Owner: Mateo — Equipo Pulso Loja
# Servicio que valida: telemetry-service (alertas) + catalog-service (reubicación)

@clima @alertas @telemetry @catalog
Feature: Alertas Meteorológicas y Reubicación de Escenarios
  Como curador del festival
  Quiero que el sistema emita alertas ante cambios climáticos adversos y sugiera reubicaciones
  Para proteger a los artistas y espectadores ante la lluvia andina de Loja

  Background:
    Given el sistema de alertas meteorológicas está conectado a la API del INAMHI
    And el telemetry-service está operativo con conexiones WebSocket activas
    And el catalog-service puede actualizar el estado de los eventos
    And el bus de eventos Redis Pub/Sub está disponible

  # ─────────────────────────────────────────────────
  # REGLA 1: Detección de clima adverso y emisión de alertas
  # ─────────────────────────────────────────────────
  Rule: El sistema detecta condiciones adversas y alerta a todos los clientes conectados

    @deteccion @lluvia @broadcast
    Scenario: Lluvia moderada detectada dispara alerta a todos los clientes
      Given hay 200 clientes WebSocket conectados al canal "festival/alerts/weather"
      And el servicio meteorológico reporta condición "lluvia" con severidad "moderada"
      When el telemetry-service recibe la alerta meteorológica
      Then se debe emitir el mensaje "WeatherAlert" a los 200 clientes conectados
      And el mensaje debe indicar tipo "lluvia", severidad "moderada"
      And el mensaje debe incluir una sugerencia de acción para los espectadores

    @deteccion @granizo @broadcast @severo
    Scenario: Granizo severo dispara alerta de máxima urgencia
      Given el servicio meteorológico reporta condición "granizo" con severidad "severa"
      When el telemetry-service procesa la alerta
      Then se debe emitir el mensaje "WeatherAlert" con severidad "severa"
      And el mensaje de texto debe comenzar con "🚨 ALERTA URGENTE:"
      And todos los eventos al aire libre deben cambiar a estado "reubicando" automáticamente

    @deteccion @despejado @cancelacion
    Scenario: Cielo despejado cancela la alerta activa
      Given hay una alerta de lluvia activa emitida hace 30 minutos
      And el servicio meteorológico ahora reporta "despejado"
      When el telemetry-service procesa el cambio
      Then se debe emitir un "WeatherAlert" de tipo "despejado" con mensaje de normalización
      And los eventos en estado "reubicando" deben volver al escenario original si tienen aforo

  # ─────────────────────────────────────────────────
  # REGLA 2: Reubicación de eventos al aire libre
  # ─────────────────────────────────────────────────
  Rule: Los eventos al aire libre activos deben ser reubicados ante lluvia o granizo

    @reubicacion @automatica @lluvia
    Scenario: Lluvia detectada — reubicación automática de eventos callejeros activos
      Given hay 3 eventos con estado "en_vivo" en escenarios al aire libre
        | Evento                      | Escenario             |
        | Danza de los Saraguros      | Plaza San Sebastián   |
        | Máscaras Rituales           | Calle Lourdes         |
        | Percusión Amazónica         | Parque Central        |
      And hay 2 escenarios cubiertos con aforo disponible
        | Escenario cubierto              | Aforo disponible |
        | Teatro Benjamín Carrión         | 150              |
        | Casa de la Cultura Loja         | 200              |
      When el sistema detecta lluvia con severidad "moderada"
      Then los 3 eventos deben cambiar a estado "reubicando"
      And el sistema debe asignar escenarios cubiertos por orden de aforo disponible
      And se debe emitir un "EventRelocated" por cada evento reubicado al bus Redis
      And los clientes WebSocket deben recibir la actualización de cada evento

    @reubicacion @sin_alternativas
    Scenario: No hay escenarios cubiertos disponibles al momento de la lluvia
      Given hay 2 eventos en escenarios al aire libre
      And TODOS los escenarios cubiertos están al 100% de capacidad
      When el sistema detecta lluvia
      Then los eventos deben cambiar a estado "reubicando"
      And la alerta debe incluir el mensaje "No hay escenarios cubiertos disponibles. Los actos se suspenden temporalmente."
      And el estado de los eventos NO debe cambiar a "cancelado" (solo "reubicando")

    @reubicacion @evento_programado @no_afecta
    Scenario: Eventos programados (aún no iniciados) no se reubicarán automáticamente
      Given hay un evento con estado "programado" para las 20:00 en Plaza San Sebastián
      And son las 18:00 y se detecta lluvia
      When el sistema procesa la alerta climática
      Then el evento con estado "programado" NO debe cambiar de estado automáticamente
      And el curador debe recibir una notificación para decidir manualmente

  # ─────────────────────────────────────────────────
  # REGLA 3: Contenido mínimo de las alertas
  # ─────────────────────────────────────────────────
  Rule: Las alertas meteorológicas deben tener información accionable completa

    @contenido @campos_obligatorios
    Scenario: La alerta debe incluir todos los campos requeridos
      When el sistema emite una alerta meteorológica de lluvia
      Then el mensaje WebSocket debe contener:
        | Campo                       | Requerido |
        | tipo                        | Sí        |
        | severidad                   | Sí        |
        | mensaje                     | Sí        |
        | timestamp                   | Sí        |
        | eventosAfectados            | Sí        |
        | vigenciaHastaEstimada       | No        |

    @contenido @idioma
    Scenario: Los mensajes de alerta deben estar en español
      When el sistema emite una alerta meteorológica
      Then el campo "mensaje" debe estar escrito en español
      And debe incluir un emoji descriptivo de la condición climática
