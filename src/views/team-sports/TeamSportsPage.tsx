import React, { useCallback, useEffect, useMemo, useState } from "react";
import CIcon from "@coreui/icons-react";
import { cilBasketball, cilPeople, cilPlus } from "@coreui/icons";
import { Team } from "../../models/Team";
import { Sport } from "../../models/Sport";
import { TeamSportSummary } from "../../models/TeamSport";
import { ITeamService } from "../../services/interfaces/ITeamService";
import { ISportService } from "../../services/interfaces/ISportService";
import { ITeamSportService } from "../../services/interfaces/ITeamSportService";
import { serviceContainer } from "../../services/serviceContainer";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";
import ConfirmModal from "../../components/common/ConfirmModal";
import TeamSportsTable from "./TeamSportsTable";
import TeamSportFormModal from "./TeamSportFormModal";

type ActiveTab = "BY_TEAM" | "BY_SPORT";

export interface TeamSportsPageProps {
  teamService?: ITeamService;
  sportService?: ISportService;
  teamSportService?: ITeamSportService;
}

interface PendingRemoval {
  teamId: number;
  sportId: number;
  label: string;
}

export default function TeamSportsPage({
  teamService = serviceContainer.teamService,
  sportService = serviceContainer.sportService,
  teamSportService = serviceContainer.teamSportService,
}: TeamSportsPageProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("BY_TEAM");

  const [teams, setTeams] = useState<Team[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState<boolean>(true);

  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [teamSports, setTeamSports] = useState<TeamSportSummary[] | null>(null);
  const [loadingTeamSports, setLoadingTeamSports] = useState<boolean>(false);

  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  const [sportTeams, setSportTeams] = useState<TeamSportSummary[] | null>(null);
  const [loadingSportTeams, setLoadingSportTeams] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formModalVisible, setFormModalVisible] = useState<boolean>(false);
  const [submittingForm, setSubmittingForm] = useState<boolean>(false);

  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
  const [removing, setRemoving] = useState<boolean>(false);

  const selectedTeam = useMemo(
    () => teams.find((t) => t.id === selectedTeamId) ?? null,
    [teams, selectedTeamId],
  );
  const selectedSport = useMemo(
    () => sports.find((s) => s.id === selectedSportId) ?? null,
    [sports, selectedSportId],
  );

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingCatalogs(true);
      try {
        const [teamList, sportList] = await Promise.all([
          teamService.getAll(),
          sportService.getAll({ all: true }),
        ]);
        if (!active) return;
        setTeams(teamList);
        setSports(sportList);
        setSelectedTeamId(teamList.length > 0 ? teamList[0].id : null);
        setSelectedSportId(sportList.length > 0 ? sportList[0].id : null);
      } catch (err: any) {
        if (active) {
          setError(err?.message || "No fue posible cargar los equipos y deportes.");
        }
      } finally {
        if (active) setLoadingCatalogs(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [teamService, sportService]);

  const fetchTeamSports = useCallback(
    async (teamId: number | null) => {
      if (!teamId) {
        setTeamSports(null);
        return;
      }
      setLoadingTeamSports(true);
      try {
        setTeamSports(await teamSportService.getSportsOfTeam(teamId));
      } catch (err: any) {
        setTeamSports(null);
        setError(err?.message || "No fue posible consultar los deportes del equipo.");
      } finally {
        setLoadingTeamSports(false);
      }
    },
    [teamSportService],
  );

  const fetchSportTeams = useCallback(
    async (sportId: number | null) => {
      if (!sportId) {
        setSportTeams(null);
        return;
      }
      setLoadingSportTeams(true);
      try {
        setSportTeams(await teamSportService.getTeamsOfSport(sportId));
      } catch (err: any) {
        setSportTeams(null);
        setError(err?.message || "No fue posible consultar los equipos del deporte.");
      } finally {
        setLoadingSportTeams(false);
      }
    },
    [teamSportService],
  );

  useEffect(() => {
    fetchTeamSports(selectedTeamId);
  }, [selectedTeamId, fetchTeamSports]);

  useEffect(() => {
    fetchSportTeams(selectedSportId);
  }, [selectedSportId, fetchSportTeams]);

  // Options of the modal: active items that are not associated yet.
  const modalOptions = useMemo(() => {
    if (activeTab === "BY_TEAM") {
      const taken = new Set((teamSports ?? []).map((s) => s.id));
      return sports
        .filter((s) => s.active && !taken.has(s.id))
        .map((s) => ({
          id: s.id,
          name: s.parentSport ? `${s.name} (${s.parentSport.name})` : s.name,
        }));
    }
    const taken = new Set((sportTeams ?? []).map((t) => t.id));
    return teams
      .filter((t) => t.active && !taken.has(t.id))
      .map((t) => ({ id: t.id, name: `${t.name} — ${t.city}` }));
  }, [activeTab, sports, teams, teamSports, sportTeams]);

  const handleAssociate = async (optionId: number) => {
    const teamId = activeTab === "BY_TEAM" ? selectedTeamId : optionId;
    const sportId = activeTab === "BY_TEAM" ? optionId : selectedSportId;
    if (!teamId || !sportId) return;

    setSubmittingForm(true);
    try {
      const created = await teamSportService.associate(teamId, sportId);
      setSuccess(
        `Equipo "${created.team.name}" asociado al deporte "${created.sport.name}" correctamente.`,
      );
      setFormModalVisible(false);
      await Promise.all([
        fetchTeamSports(selectedTeamId),
        fetchSportTeams(selectedSportId),
      ]);
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleConfirmRemoval = async () => {
    if (!pendingRemoval) return;
    setRemoving(true);
    setError(null);
    setSuccess(null);
    try {
      await teamSportService.dissociate(pendingRemoval.teamId, pendingRemoval.sportId);
      setSuccess(`Asociación ${pendingRemoval.label} retirada correctamente.`);
      setPendingRemoval(null);
      await Promise.all([
        fetchTeamSports(selectedTeamId),
        fetchSportTeams(selectedSportId),
      ]);
    } catch (err: any) {
      setPendingRemoval(null);
      setError(err?.message || "No fue posible retirar la asociación.");
    } finally {
      setRemoving(false);
    }
  };

  const changeTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setError(null);
  };

  if (loadingCatalogs) {
    return (
      <div className="container-fluid mt-3">
        <Loader text="Cargando equipos y deportes..." />
      </div>
    );
  }

  const ownerInactive =
    activeTab === "BY_TEAM"
      ? Boolean(selectedTeam && !selectedTeam.active)
      : Boolean(selectedSport && !selectedSport.active);

  return (
    <div className="container-fluid mt-3 pb-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-0 fw-bold">Equipos y Deportes</h2>
        </div>
      </div>

      {error ? (
        <Alert type="danger" message={error} onClose={() => setError(null)} />
      ) : null}
      {success ? (
        <Alert type="success" message={success} onClose={() => setSuccess(null)} />
      ) : null}

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link d-inline-flex align-items-center gap-2 ${
              activeTab === "BY_TEAM" ? "active fw-semibold" : ""
            }`}
            onClick={() => changeTab("BY_TEAM")}
          >
            <CIcon icon={cilPeople} size="sm" />
            <span>Por equipo</span>
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link d-inline-flex align-items-center gap-2 ${
              activeTab === "BY_SPORT" ? "active fw-semibold" : ""
            }`}
            onClick={() => changeTab("BY_SPORT")}
          >
            <CIcon icon={cilBasketball} size="sm" />
            <span>Por deporte</span>
          </button>
        </li>
      </ul>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end mb-3">
            <div className="col-md-6">
              {activeTab === "BY_TEAM" ? (
                <>
                  <label htmlFor="team-sports-team" className="form-label fw-semibold">
                    Seleccionar equipo
                  </label>
                  <select
                    id="team-sports-team"
                    className="form-select"
                    value={selectedTeamId ?? ""}
                    onChange={(e) =>
                      setSelectedTeamId(e.target.value ? Number(e.target.value) : null)
                    }
                    disabled={teams.length === 0}
                  >
                    {teams.length === 0 ? (
                      <option value="">No hay equipos registrados</option>
                    ) : null}
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} — {team.city}
                        {team.active ? "" : " [Inactivo]"}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  <label htmlFor="team-sports-sport" className="form-label fw-semibold">
                    Seleccionar deporte
                  </label>
                  <select
                    id="team-sports-sport"
                    className="form-select"
                    value={selectedSportId ?? ""}
                    onChange={(e) =>
                      setSelectedSportId(e.target.value ? Number(e.target.value) : null)
                    }
                    disabled={sports.length === 0}
                  >
                    {sports.length === 0 ? (
                      <option value="">No hay deportes registrados</option>
                    ) : null}
                    {sports.map((sport) => (
                      <option key={sport.id} value={sport.id}>
                        {sport.parentSport
                          ? `${sport.name} (${sport.parentSport.name})`
                          : sport.name}
                        {sport.active ? "" : " [Inactivo]"}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
            <div className="col-md-6 d-grid d-md-flex justify-content-md-end">
              <button
                type="button"
                className="btn btn-sports-primary d-inline-flex align-items-center justify-content-center gap-2"
                disabled={
                  ownerInactive ||
                  (activeTab === "BY_TEAM" ? !selectedTeam : !selectedSport)
                }
                onClick={() => {
                  setSuccess(null);
                  setFormModalVisible(true);
                }}
              >
                <CIcon icon={cilPlus} size="sm" />
                <span>{activeTab === "BY_TEAM" ? "Asociar deporte" : "Asociar equipo"}</span>
              </button>
            </div>
          </div>

          {ownerInactive ? (
            <Alert
              type="warning"
              message={
                activeTab === "BY_TEAM"
                  ? "Este equipo está inactivo. Puedes consultar y retirar sus deportes, pero no asociarle nuevos."
                  : "Este deporte está inactivo. Puedes consultar y retirar sus equipos, pero no asociarle nuevos."
              }
            />
          ) : null}

          {activeTab === "BY_TEAM" ? (
            <TeamSportsTable
              entityLabel="Deporte"
              items={teamSports}
              isLoading={loadingTeamSports}
              errorMessage={error || undefined}
              emptyMessage="El equipo no tiene deportes asociados."
              onRemove={(sport) =>
                selectedTeam &&
                setPendingRemoval({
                  teamId: selectedTeam.id,
                  sportId: sport.id,
                  label: `de "${selectedTeam.name}" con "${sport.name}"`,
                })
              }
            />
          ) : (
            <TeamSportsTable
              entityLabel="Equipo"
              items={sportTeams}
              isLoading={loadingSportTeams}
              errorMessage={error || undefined}
              emptyMessage="El deporte no tiene equipos asociados."
              onRemove={(team) =>
                selectedSport &&
                setPendingRemoval({
                  teamId: team.id,
                  sportId: selectedSport.id,
                  label: `de "${team.name}" con "${selectedSport.name}"`,
                })
              }
            />
          )}

          <div className="mt-3">
            <Alert
              type="info"
              message="Retirar una asociación no elimina ni el equipo ni el deporte del sistema."
            />
          </div>
        </div>
      </div>

      <TeamSportFormModal
        visible={formModalVisible}
        ownerName={
          activeTab === "BY_TEAM" ? selectedTeam?.name ?? "" : selectedSport?.name ?? ""
        }
        optionLabel={activeTab === "BY_TEAM" ? "deporte" : "equipo"}
        options={modalOptions}
        submitting={submittingForm}
        onClose={() => setFormModalVisible(false)}
        onSubmit={handleAssociate}
      />

      <ConfirmModal
        visible={Boolean(pendingRemoval)}
        title="Retirar asociación"
        message={
          pendingRemoval ? (
            <p className="mb-0">
              ¿Deseas retirar la asociación <strong>{pendingRemoval.label}</strong>? El
              equipo y el deporte seguirán registrados.
            </p>
          ) : null
        }
        confirmLabel="Retirar"
        isLoading={removing}
        onConfirm={handleConfirmRemoval}
        onCancel={() => setPendingRemoval(null)}
      />
    </div>
  );
}
