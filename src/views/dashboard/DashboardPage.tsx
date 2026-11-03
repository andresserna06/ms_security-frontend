import React, { useEffect, useMemo, useState } from 'react'
import {
  CBadge,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCloudDownload,
  cilMenu,
  cilOptions,
} from '@coreui/icons'
import { CChartLine } from '@coreui/react-chartjs'
import jpaLogo from '../../assets/images/JPASports.jpg'
import lesionadoImg from '../../assets/images/lesionado.jpg'
import chicaTenisImg from '../../assets/images/chicatenis.webp'
import oncecaldasImg from '../../assets/images/oncecaldas.png'
import nacionalImg from '../../assets/images/nacional.png'
import realmadridImg from '../../assets/images/realmadrid.png'
import barcelonaImg from '../../assets/images/barcelona.png'

// ==========================================
// INTERFACES & TYPES
// ==========================================
export interface StatCardData {
  id: string
  title: string
  value: string
  color: 'primary' | 'info' | 'warning' | 'danger'
  type: 'clock' | 'sparkline' | 'trend' | 'bars'
  accentColor: string
}

export interface UpcomingMatch {
  id: string
  date: string
  time: string
  tournament: string
  teamA: { name: string; badge: string; color: string }
  teamB: { name: string; badge: string; color: string }
  odds: {
    home: number
    draw: number
    away: number
  }
}

export interface NewsItem {
  id: string
  tag: string
  title: string
  subtitle: string
  imageUrl: string
  gradient: string
}

// ==========================================
// SUBCOMPONENTE: STAT CARD
// ==========================================
const StatCard: React.FC<{ data: StatCardData }> = ({ data }) => {
  return (
    <div className="card shadow-sm border-0 h-100 position-relative overflow-hidden" style={{ minHeight: '135px' }}>
      <div
        className="position-absolute top-0 start-0 bottom-0"
        style={{ width: '4px', backgroundColor: data.accentColor }}
      />
      <div className="card-body p-3 d-flex flex-column justify-content-between">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <span className="text-body-secondary text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              {data.title}
            </span>
            <h3 className="fw-bold mb-0 mt-1" style={{ color: data.accentColor }}>
              {data.value}
            </h3>
          </div>
          <CDropdown variant="btn-group" placement="bottom-end">
            <CDropdownToggle
              caret={false}
              className="p-0 border-0 bg-transparent text-secondary shadow-none"
              aria-label="Opciones"
            >
              <CIcon icon={cilOptions} size="sm" />
            </CDropdownToggle>
            <CDropdownMenu className="shadow-sm border-0" style={{ fontSize: '0.85rem' }}>
              <CDropdownItem href="#">Ver detalle</CDropdownItem>
              <CDropdownItem href="#">Exportar reporte</CDropdownItem>
              <CDropdownItem href="#">Actualizar</CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </div>

        {/* Gráfico o Widget visual representativo de cada tarjeta */}
        <div className="mt-2 d-flex align-items-center justify-content-between">
          {data.type === 'clock' && (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-danger text-white px-2 py-1 small animate-pulse">
                EN VIVO
              </span>
              <div
                className="bg-dark text-success px-2 py-1 rounded font-monospace fw-bold small border border-secondary"
                style={{ letterSpacing: '0.1em' }}
              >
                ⏱ 00:00
              </div>
            </div>
          )}

          {data.type === 'sparkline' && (
            <div className="w-100">
              <svg viewBox="0 0 100 28" className="w-100" style={{ height: '32px' }}>
                <path
                  d="M0 20 Q 20 8, 40 18 T 75 6 T 100 12"
                  fill="none"
                  stroke={data.accentColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="12" r="3" fill={data.accentColor} />
              </svg>
            </div>
          )}

          {data.type === 'trend' && (
            <div className="w-100 d-flex align-items-center justify-content-between">
              <svg viewBox="0 0 100 28" className="w-75" style={{ height: '30px' }}>
                <path
                  d="M0 24 L 25 18 L 50 14 L 75 6 L 100 2"
                  fill="none"
                  stroke={data.accentColor}
                  strokeWidth="2.5"
                />
                <path
                  d="M0 24 L 25 18 L 50 14 L 75 6 L 100 2 L 100 28 L 0 28 Z"
                  fill={`${data.accentColor}25`}
                />
              </svg>
              <span className="badge bg-success-subtle text-success small fw-bold">+18.4%</span>
            </div>
          )}

          {data.type === 'bars' && (
            <div className="d-flex align-items-end gap-1 w-100" style={{ height: '28px' }}>
              {[40, 65, 30, 85, 55, 95, 75].map((height, i) => (
                <div
                  key={i}
                  className="flex-grow-1 rounded-top"
                  style={{
                    height: `${height}%`,
                    backgroundColor: i === 5 ? data.accentColor : `${data.accentColor}50`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// SUBCOMPONENTE: RADAR DE PARTIDO (CANCHA HEATMAP)
// ==========================================
const SoccerPitchRadar: React.FC = () => {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="fw-bold mb-0">Radar de Partidos en Vivo</h5>
          <small className="text-body-secondary">Monitoreo de presión y posesión en cancha</small>
        </div>
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
          🔴 Min 74&apos;
        </span>
      </div>

      <div className="card-body p-3 d-flex flex-column justify-content-center">
        {/* Cancha de fútbol estilizada con mapa de calor */}
        <div
          className="position-relative w-100 rounded overflow-hidden shadow-inner"
          style={{
            height: '240px',
            background: 'radial-gradient(ellipse at center, #2e7d32 0%, #1b5e20 100%)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
          }}
        >
          {/* Líneas reglamentarias de la cancha */}
          {/* Línea media */}
          <div
            className="position-absolute start-50 top-0 bottom-0 border-start border-white border-opacity-50"
            style={{ width: '1px' }}
          />
          {/* Círculo central */}
          <div
            className="position-absolute top-50 start-50 translate-middle rounded-circle border border-white border-opacity-50"
            style={{ width: '70px', height: '70px' }}
          />
          <div
            className="position-absolute top-50 start-50 translate-middle rounded-circle bg-white"
            style={{ width: '4px', height: '4px' }}
          />
          {/* Área izquierda */}
          <div
            className="position-absolute start-0 top-50 translate-middle-y border border-white border-opacity-50"
            style={{ width: '45px', height: '110px', borderLeft: 'none' }}
          />
          {/* Área derecha */}
          <div
            className="position-absolute end-0 top-50 translate-middle-y border border-white border-opacity-50"
            style={{ width: '45px', height: '110px', borderRight: 'none' }}
          />

          {/* Manchas de calor simuladas (Heatmap) */}
          <div
            className="position-absolute rounded-circle"
            style={{
              top: '35%',
              left: '60%',
              width: '90px',
              height: '90px',
              background: 'radial-gradient(circle, rgba(255, 59, 48, 0.75) 0%, rgba(255, 149, 0, 0.5) 45%, transparent 75%)',
              filter: 'blur(8px)',
              pointerEvents: 'none',
            }}
          />
          <div
            className="position-absolute rounded-circle"
            style={{
              top: '55%',
              left: '70%',
              width: '75px',
              height: '75px',
              background: 'radial-gradient(circle, rgba(255, 204, 0, 0.8) 0%, rgba(52, 199, 89, 0.4) 50%, transparent 80%)',
              filter: 'blur(7px)',
              pointerEvents: 'none',
            }}
          />
          <div
            className="position-absolute rounded-circle"
            style={{
              top: '40%',
              left: '25%',
              width: '65px',
              height: '65px',
              background: 'radial-gradient(circle, rgba(0, 122, 255, 0.6) 0%, rgba(88, 86, 214, 0.3) 50%, transparent 75%)',
              filter: 'blur(6px)',
              pointerEvents: 'none',
            }}
          />

          {/* Marcadores de equipos */}
          <div className="position-absolute top-0 start-0 m-2 px-2 py-1 bg-dark bg-opacity-75 text-white rounded small fw-bold">
            ONC 1 - 0 NAC
          </div>
          <div className="position-absolute bottom-0 end-0 m-2 px-2 py-1 bg-dark bg-opacity-75 text-white rounded small">
            🔥 Mayor ataque: Zona Derecha
          </div>
        </div>

        {/* Métricas rápidas bajo la cancha */}
        <div className="row text-center mt-3 g-2">
          <div className="col-4">
            <small className="text-secondary d-block">Posesión</small>
            <span className="fw-bold">58% - 42%</span>
          </div>
          <div className="col-4">
            <small className="text-secondary d-block">Tiros al arco</small>
            <span className="fw-bold">6 - 3</span>
          </div>
          <div className="col-4">
            <small className="text-secondary d-block">Faltas</small>
            <span className="fw-bold">8 - 11</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// COMPONENTE PRINCIPAL: DASHBOARD PAGE
// ==========================================
export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [timeFilter, setTimeFilter] = useState<'Day' | 'Month' | 'Year'>('Month')

  // Simulación de carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  // Datos de las tarjetas superiores
  const statCards: StatCardData[] = useMemo(
    () => [
      {
        id: '1',
        title: 'Partidos En Vivo',
        value: '8',
        color: 'primary',
        type: 'clock',
        accentColor: '#1e3a8a',
      },
      {
        id: '2',
        title: 'Ingresos Boletos',
        value: '$4,500',
        color: 'info',
        type: 'sparkline',
        accentColor: '#0284c7',
      },
      {
        id: '3',
        title: 'Apuestas Totales',
        value: '$12K',
        color: 'warning',
        type: 'trend',
        accentColor: '#d97706',
      },
      {
        id: '4',
        title: 'Torneos Activos',
        value: '15',
        color: 'danger',
        type: 'bars',
        accentColor: '#dc2626',
      },
    ],
    [],
  )

  // Datos simulados de noticias deportivas
  const newsItems: NewsItem[] = useMemo(
    () => [
      {
        id: 'n1',
        tag: 'Fútbol Profesional',
        title: 'Estrella lesionada antes del Clásico',
        subtitle: 'El delantero sufrió una molestia en el último entrenamiento.',
        imageUrl: lesionadoImg,
        gradient: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.85) 100%)',
      },
      {
        id: 'n2',
        tag: 'Tenis Master',
        title: 'Nuevas cuotas para la final de tenis',
        subtitle: 'Mercados abiertos con favoritismo para el cabeza de serie.',
        imageUrl: chicaTenisImg,
        gradient: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.85) 100%)',
      },
    ],
    [],
  )

  // Datos simulados de próximos encuentros
  const matches: UpcomingMatch[] = useMemo(
    () => [
      {
        id: 'm1',
        date: '25 Oct',
        time: '18:00',
        tournament: 'Liga BetPlay',
        teamA: { name: 'Once Caldas', badge: oncecaldasImg, color: '#1a365d' },
        teamB: { name: 'Atlético Nacional', badge: nacionalImg, color: '#166534' },
        odds: { home: 1.8, draw: 3.2, away: 2.5 },
      },
      {
        id: 'm2',
        date: '26 Oct',
        time: '20:45',
        tournament: 'La Liga Española',
        teamA: { name: 'Real Madrid', badge: realmadridImg, color: '#4338ca' },
        teamB: { name: 'FC Barcelona', badge: barcelonaImg, color: '#991b1b' },
        odds: { home: 2.1, draw: 3.5, away: 2.0 },
      },
    ],
    [],
  )

  // Datos del gráfico de líneas superpuestas
  const chartData = useMemo(() => {
    return {
      labels: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr'],
      datasets: [
        {
          label: 'Fútbol',
          backgroundColor: 'rgba(30, 58, 138, 0.08)',
          borderColor: '#1e3a8a',
          pointHoverBackgroundColor: '#1e3a8a',
          borderWidth: 2.5,
          tension: 0.35,
          data: [65, 80, 95, 120, 110, 145, 160],
          fill: true,
        },
        {
          label: 'Basketball',
          backgroundColor: 'transparent',
          borderColor: '#d97706',
          pointHoverBackgroundColor: '#d97706',
          borderWidth: 2,
          tension: 0.35,
          data: [40, 55, 60, 85, 75, 90, 105],
        },
        {
          label: 'Tenis',
          backgroundColor: 'transparent',
          borderColor: '#0284c7',
          pointHoverBackgroundColor: '#0284c7',
          borderWidth: 2,
          tension: 0.35,
          data: [30, 45, 50, 65, 55, 70, 85],
        },
        {
          label: 'Apuestas Totales (Bets)',
          backgroundColor: 'transparent',
          borderColor: '#70B038',
          borderDash: [5, 5],
          pointHoverBackgroundColor: '#70B038',
          borderWidth: 2.5,
          tension: 0.35,
          data: [90, 110, 130, 155, 160, 190, 220],
        },
      ],
    }
  }, [])

  if (isLoading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <CSpinner color="success" />
        <span className="mt-3 text-secondary">Cargando métricas de JPA Sports...</span>
      </div>
    )
  }

  return (
    <div className="container-fluid px-0 pb-4">
      {/* ======================================================== */}
      {/* 1. HEADER (PARTE SUPERIOR) */}
      {/* ======================================================== */}
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <div>
          <h2 className="fw-bold mb-0 text-dark">Dashboard</h2>
          <small className="text-body-secondary">Panel General de Actividades Deportivas</small>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TARJETAS DE ESTADÍSTICAS (FILA SUPERIOR - 4 COLUMNAS) */}
      {/* ======================================================== */}
      <div className="row g-3 mb-4">
        {statCards.map((card) => (
          <div key={card.id} className="col-12 col-sm-6 col-lg-3">
            <StatCard data={card} />
          </div>
        ))}
      </div>

      {/* ======================================================== */}
      {/* 3. SECCIÓN MEDIA (NOTICIAS Y RADAR DE PARTIDO) */}
      {/* ======================================================== */}
      <div className="row g-4 mb-4">
        {/* Columna Izquierda Ancha: Noticias y Novedades Deportivas */}
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="fw-bold mb-0">Noticias y Novedades Deportivas</h5>
              <small className="text-body-secondary">Actualizaciones destacadas de la jornada</small>
            </div>

            <div className="card-body p-3">
              <div className="row g-3 h-100">
                {newsItems.map((news) => (
                  <div key={news.id} className="col-12 col-md-6">
                    <div
                      className="rounded-3 position-relative overflow-hidden text-white shadow-sm h-100"
                      style={{
                        minHeight: '260px',
                        backgroundImage: `url(${news.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: news.id === 'n1' ? 'center 15%' : 'center center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    >
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 p-3 d-flex flex-column justify-content-between"
                        style={{ background: news.gradient }}
                      >
                        <div>
                          <CBadge color="success" className="px-2 py-1">
                            {news.tag}
                          </CBadge>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-1 text-white">{news.title}</h5>
                          <p className="small mb-0 text-white-50">{news.subtitle}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Radar de Partidos en Vivo */}
        <div className="col-12 col-lg-4">
          <SoccerPitchRadar />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. SECCIÓN INFERIOR (GRÁFICO DE RENDIMIENTO Y PRÓXIMOS ENCUENTROS) */}
      {/* ======================================================== */}
      <div className="row g-4">
        {/* Columna Izquierda: Gráfico de Rendimiento */}
        <div className="col-12 col-lg-7">
          <CCard className="shadow-sm border-0 h-100 d-flex flex-column">
            <CCardHeader className="bg-white border-0 py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
              <div>
                <h5 className="fw-bold mb-0">Rendimiento del Torneo y Apuestas vs. Tiempo</h5>
                <small className="text-body-secondary">October 2025 - April 2026</small>
              </div>

              <div className="d-flex align-items-center gap-2">
                <CButtonGroup size="sm" role="group">
                  {(['Day', 'Month', 'Year'] as const).map((filter) => (
                    <CButton
                      key={filter}
                      color="primary"
                      variant={timeFilter === filter ? undefined : 'outline'}
                      onClick={() => setTimeFilter(filter)}
                    >
                      {filter}
                    </CButton>
                  ))}
                </CButtonGroup>
                <CButton color="light" size="sm" className="border shadow-none" aria-label="Descargar">
                  <CIcon icon={cilCloudDownload} />
                </CButton>
              </div>
            </CCardHeader>

            <CCardBody className="p-3">
              <div className="w-100" style={{ height: '340px' }}>
                <CChartLine
                  data={chartData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                      },
                    },
                    scales: {
                      x: {
                        grid: { display: false },
                      },
                      y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                      },
                    },
                  }}
                />
              </div>
            </CCardBody>
          </CCard>
        </div>

        {/* Columna Derecha: Tabla de Próximos Encuentros */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0">Próximos Encuentros</h5>
                <small className="text-body-secondary">Cuotas de apuestas y programación en vivo</small>
              </div>
              <CBadge color="primary" shape="rounded-pill" className="px-3 py-2">
                Liga Activa
              </CBadge>
            </div>

            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="ps-3">Fecha</th>
                      <th scope="col">Equipos</th>
                      <th scope="col" className="text-center">Cuotas (1 - X - 2)</th>
                      <th scope="col" className="text-end pe-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m) => (
                      <tr key={m.id}>
                        <td className="ps-3">
                          <span className="fw-bold text-dark d-block">{m.date}</span>
                          <small className="text-secondary">{m.time}</small>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img src={m.teamA.badge} alt={m.teamA.name} width="24" height="24" style={{ objectFit: 'contain' }} />
                            <span className="fw-semibold small">{m.teamA.name}</span>
                          </div>
                          <div className="d-flex align-items-center gap-2 mt-1">
                            <img src={m.teamB.badge} alt={m.teamB.name} width="24" height="24" style={{ objectFit: 'contain' }} />
                            <span className="fw-semibold small">{m.teamB.name}</span>
                          </div>
                          <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                            {m.tournament}
                          </small>
                        </td>
                        <td className="text-center">
                          <div className="d-inline-flex gap-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary px-2 py-1 font-monospace"
                              title="Victoria Local"
                            >
                              1: {m.odds.home.toFixed(2)}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary px-2 py-1 font-monospace"
                              title="Empate"
                            >
                              X: {m.odds.draw.toFixed(2)}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary px-2 py-1 font-monospace"
                              title="Victoria Visitante"
                            >
                              2: {m.odds.away.toFixed(2)}
                            </button>
                          </div>
                        </td>
                        <td className="text-end pe-3">
                          <CButton
                            color="primary"
                            size="sm"
                            className="text-white fw-semibold px-3 shadow-sm"
                            style={{ backgroundColor: '#1e3a8a', borderColor: '#1e3a8a' }}
                          >
                            Apostar
                          </CButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

