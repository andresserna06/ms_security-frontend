import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CContainer,
  CSpinner,
} from "@coreui/react";
import { IAuthService } from "../../../services/interfaces/IAuthService";
import { serviceContainer } from "../../../services/serviceContainer";

export interface GithubCallbackProps {
  authService?: IAuthService;
}

export default function GithubCallback({
  authService = serviceContainer.authService,
}: GithubCallbackProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) {
      return;
    }
    processed.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError = searchParams.get("error");
    const expectedState = sessionStorage.getItem("github_oauth_state");
    sessionStorage.removeItem("github_oauth_state");

    if (oauthError) {
      setError(
        "GitHub canceló la autorización o no se pudo completar el inicio de sesión.",
      );
      return;
    }

    if (!code) {
      setError("No se recibió el código de autorización de GitHub.");
      return;
    }

    if (!state || !expectedState || state !== expectedState) {
      setError(
        "La validación de seguridad de GitHub falló. Intenta iniciar sesión nuevamente.",
      );
      return;
    }

    authService
      .loginWithProvider("GITHUB", code)
      .then(() => navigate("/dashboard", { replace: true }))
      .catch((err: any) => {
        setError(err?.message || "No fue posible iniciar sesión con GitHub.");
      });
  }, [authService, navigate, searchParams]);

  return (
    <div className="bg-white min-vh-100 d-flex align-items-center py-4">
      <CContainer>
        <div className="d-flex justify-content-center">
          <CCard
            className="p-4 shadow-sm border-0"
            style={{ maxWidth: "480px", width: "100%" }}
          >
            <CCardBody className="text-center d-flex flex-column gap-3">
              <h2 className="h5 fw-bold mb-0">Conectando con GitHub</h2>

              {error ? (
                <>
                  <CAlert color="danger" className="mb-0">
                    {error}
                  </CAlert>
                  <CButton
                    color="primary"
                    className="text-white"
                    onClick={() => navigate("/login", { replace: true })}
                  >
                    Volver al inicio de sesión
                  </CButton>
                </>
              ) : (
                <>
                  <CSpinner color="primary" />
                  <p className="text-body-secondary small mb-0">
                    Estamos validando tu cuenta, espera un momento...
                  </p>
                </>
              )}
            </CCardBody>
          </CCard>
        </div>
      </CContainer>
    </div>
  );
}
