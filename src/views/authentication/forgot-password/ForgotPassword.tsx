import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CSpinner,
} from "@coreui/react";
import { IAuthService } from "../../../services/interfaces/IAuthService";
import { serviceContainer } from "../../../services/serviceContainer";
import jpaSports from "../../../assets/images/JPASports.jpg";

export interface ForgotPasswordProps {
  authService?: IAuthService;
}

export default function ForgotPassword({
  authService = serviceContainer.authService,
}: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Por favor ingresa tu correo electrónico.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await authService.forgotPassword(email.trim());
      setSuccessMessage(
        response?.message ||
          "Se ha enviado un enlace de recuperación a tu correo electrónico. Por favor revisa tu bandeja de entrada o spam."
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "Ocurrió un error al procesar la solicitud. Verifica el correo e intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white position-relative overflow-hidden min-vh-100 d-flex flex-row align-items-center py-4">
      <div
        aria-hidden="true"
        className="d-none d-md-block position-absolute top-0 bottom-0 start-0"
        style={{
          width: "74%",
          pointerEvents: "none",
          background:
            "linear-gradient(to right, #70B038 0%, #cbe5b3 30%, #eff8e8 60%, #ffffff 100%)",
          zIndex: 0,
        }}
      />
      <CContainer className="position-relative" style={{ zIndex: 1 }}>
        <CRow className="justify-content-center">
          <CCol md={8} lg={6} xl={5}>
            <div className="d-flex flex-column gap-4">
              <div className="text-center">
                <img
                  src={jpaSports}
                  alt="JPA Sports"
                  width="96"
                  height="96"
                  className="rounded-circle shadow-sm"
                />
              </div>

              <CCard className="p-4 shadow-sm border-0">
                <CCardBody className="d-flex flex-column gap-3">
                  <h2 className="h5 text-center mb-0 fw-bold">Recuperar contraseña</h2>
                  <p className="text-body-secondary text-center small mb-2">
                    Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace de un solo uso para restablecer tu contraseña.
                  </p>

                  {error && (
                    <CAlert color="danger" dismissible onClose={() => setError("")}>
                      {error}
                    </CAlert>
                  )}

                  {successMessage && (
                    <CAlert color="success" dismissible onClose={() => setSuccessMessage("")}>
                      <div className="fw-semibold mb-1">¡Solicitud enviada!</div>
                      <div>{successMessage}</div>
                    </CAlert>
                  )}

                  {!successMessage ? (
                    <CForm className="row gy-3" onSubmit={handleSubmit}>
                      <CCol xs={12}>
                        <CFormLabel htmlFor="email">Correo electrónico</CFormLabel>
                        <CFormInput
                          id="email"
                          type="email"
                          placeholder="tu@correo.com"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </CCol>

                      <CCol xs={12}>
                        <CButton
                          type="submit"
                          className="w-100 text-white fw-semibold py-2"
                          style={{ backgroundColor: "#70B038", borderColor: "#70B038" }}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <CSpinner size="sm" className="me-2" />
                              Enviando enlace...
                            </>
                          ) : (
                            "Enviar enlace de recuperación"
                          )}
                        </CButton>
                      </CCol>
                    </CForm>
                  ) : (
                    <div className="d-flex flex-column gap-2 text-center mt-2">
                      <p className="small text-body-secondary">
                        ¿No recibiste el correo? Verifica tu carpeta de spam o intenta nuevamente en unos minutos.
                      </p>
                      <CButton
                        color="secondary"
                        variant="outline"
                        onClick={() => {
                          setSuccessMessage("");
                          setEmail("");
                        }}
                      >
                        Enviar a otro correo
                      </CButton>
                    </div>
                  )}

                  <div className="text-center mt-2">
                    <Link
                      to="/login"
                      className="text-decoration-none small fw-semibold"
                      style={{ color: "#70B038" }}
                    >
                      ← Volver a Iniciar sesión
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
}
