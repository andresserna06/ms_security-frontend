import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
  CTooltip,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { apple } from "../../../assets/brand/apple";
import { eye } from "../../../assets/icons/eye";
import { IAuthService } from "../../../services/interfaces/IAuthService";
import { IOAuthProviderService } from "../../../services/interfaces/IOAuthProviderService";
import { serviceContainer } from "../../../services/serviceContainer";
import jpaSports from "../../../assets/images/JPASports.jpg";

export interface LoginProps {
  authService?: IAuthService;
  oauthProvider?: IOAuthProviderService;
  azureOAuthProvider?: IOAuthProviderService;
}

type AuthStep = "CREDENTIALS" | "2FA";

export default function Login({
  authService = serviceContainer.authService,
  oauthProvider = serviceContainer.googleOAuthProvider,
  azureOAuthProvider = serviceContainer.azureOAuthProvider,
}: LoginProps) {
  const navigate = useNavigate();

  // Estados del flujo de autenticación
  const [step, setStep] = useState<AuthStep>("CREDENTIALS");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [code2Fa, setCode2Fa] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Estados de retroalimentación visual
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [infoMessage, setInfoMessage] = useState<string>("");

  // Manejador del Paso 1: Enviar credenciales
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!email.trim() || !password) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }

    try {
      setLoading(true);
      const session = await authService.login(email, password);
      setInfoMessage(
        session?.message || "Código de verificación de 6 dígitos enviado a tu correo.",
      );
      setStep("2FA");
    } catch (err: any) {
      setError(err?.message || "Credenciales incorrectas o usuario inhabilitado.");
    } finally {
      setLoading(false);
    }
  };

  // Manejador del Paso 2: Verificar código 2FA
  const handleVerify2FaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const cleanCode = code2Fa.trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      setError("El código 2FA debe tener exactamente 6 dígitos numéricos.");
      return;
    }

    try {
      setLoading(true);
      await authService.verify2Fa(email, cleanCode);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Código incorrecto o expirado.");
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código 2FA
  const handleResendCode = async () => {
    setError("");
    setInfoMessage("");
    try {
      setLoading(true);
      const session = await authService.login(email, password);
      setInfoMessage(
        session?.message || "Se ha reenviado un nuevo código a tu correo electrónico.",
      );
    } catch (err: any) {
      setError(err?.message || "Error al reenviar el código. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Volver al formulario de credenciales
  const handleBackToCredentials = () => {
    setStep("CREDENTIALS");
    setCode2Fa("");
    setError("");
    setInfoMessage("");
  };

  // Inicio de sesión con Google consumiendo las interfaces de inversión de dependencia (IOAuthProviderService + IAuthService)
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError("");
    setInfoMessage("");

    const idToken = credentialResponse?.credential;
    if (!idToken) {
      setError("No se recibió el token de Google. Intenta nuevamente.");
      return;
    }

    try {
      setLoading(true);
      const googleEmail = oauthProvider.extractEmailFromToken(idToken);
      await authService.loginWithProvider(oauthProvider.getProviderName(), idToken, googleEmail);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "No fue posible iniciar sesión con Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("El inicio de sesión con Google fue cancelado o falló.");
  };

  const handleAzureLogin = async () => {
    setLoading(true);
    setError("");
    try {
      if (!azureOAuthProvider?.signIn) {
        throw new Error("El proveedor de Microsoft no está disponible.");
      }
      const idToken = await azureOAuthProvider.signIn();
      const azureEmail = azureOAuthProvider.extractEmailFromToken(idToken);
      await authService.loginWithProvider("AZURE", idToken, azureEmail);
      navigate("/dashboard");
    } catch (err: any) {
      if (
        err?.name === "BrowserAuthError" &&
        (err?.message?.includes("user_cancelled") || err?.errorCode === "user_cancelled")
      ) {
        return;
      }
      setError(err?.message || "No fue posible iniciar sesión con Microsoft Azure.");
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
                  className="rounded-circle"
                />
              </div>

              <CCard className="p-4 shadow-sm border-0">
                <CCardBody className="d-flex flex-column gap-3">
                  {error && (
                    <CAlert color="danger" dismissible onClose={() => setError("")}>
                      {error}
                    </CAlert>
                  )}

                  {infoMessage && (
                    <CAlert color="info" dismissible onClose={() => setInfoMessage("")}>
                      {infoMessage}
                    </CAlert>
                  )}

                  {step === "CREDENTIALS" ? (
                    <>
                      <h2 className="h5 text-center mb-0 fw-bold">Iniciar sesión en tu cuenta</h2>
                      <p className="text-body-secondary text-center small mb-2">
                        Ingresa tus credenciales para recibir tu código de seguridad
                      </p>

                      <CForm className="row gy-3" onSubmit={handleLoginSubmit}>
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
                          <CFormLabel htmlFor="password">Contraseña</CFormLabel>
                          <CInputGroup>
                            <CFormInput
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Tu contraseña"
                              autoComplete="current-password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              disabled={loading}
                            />
                            <CInputGroupText>
                              <CTooltip
                                content={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                              >
                                <CButton
                                  type="button"
                                  color="link"
                                  className="p-0 link-secondary"
                                  aria-label="Toggle password"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  <CIcon icon={eye} size="sm" />
                                </CButton>
                              </CTooltip>
                            </CInputGroupText>
                          </CInputGroup>
                        </CCol>

                        <CCol xs={12} className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                          <CFormCheck
                            id="rememberMe"
                            label="Recordarme"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={loading}
                          />
                          <Link
                            to="/forgot-password"
                            className="small text-decoration-none fw-semibold"
                            style={{ color: "#70B038" }}
                          >
                            ¿Olvidaste tu contraseña?
                          </Link>
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
                                Validando credenciales...
                              </>
                            ) : (
                              "Continuar"
                            )}
                          </CButton>
                        </CCol>
                      </CForm>

                      <div className="position-relative my-3 text-center">
                        <hr />
                        <div className="position-absolute top-50 start-50 translate-middle bg-body px-3 text-body-secondary small fw-semibold">
                          Continuar con
                        </div>
                      </div>

                      <CRow className="g-2">
                        <CCol xs={12} sm={6}>
                          <div
                            className="position-relative w-100"
                            style={{
                              height: "40px",
                              borderRadius: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <button
                              type="button"
                              className="btn w-100 h-100 d-flex align-items-center justify-content-center"
                              style={{
                                backgroundColor: "#ffffff",
                                border: "1px solid #dadce0",
                                borderRadius: "4px",
                                color: "#3c4043",
                                fontSize: "14px",
                                fontWeight: 500,
                                boxShadow: "0 1px 2px rgba(60,64,67,0.08)",
                                transition: "background-color .2s, border-color .2s, box-shadow .2s",
                              }}
                              disabled={loading}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 48 48"
                                className="me-2 flex-shrink-0"
                                aria-hidden="true"
                              >
                                <path
                                  fill="#EA4335"
                                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                                />
                                <path
                                  fill="#4285F4"
                                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                                />
                                <path
                                  fill="#FBBC05"
                                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.79l7.97-6.2z"
                                />
                                <path
                                  fill="#34A853"
                                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                                />
                              </svg>
                              <span>Google</span>
                            </button>

                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                opacity: 0.001,
                                zIndex: 2,
                                cursor: "pointer",
                                overflow: "hidden",
                              }}
                            >
                              <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                width="300"
                              />
                            </div>
                          </div>
                        </CCol>
                        <CCol xs={12} sm={6}>
                          <button
                            type="button"
                            className="btn w-100 d-flex align-items-center justify-content-center"
                            style={{
                              height: "40px",
                              backgroundColor: "#ffffff",
                              border: "1px solid #dadce0",
                              borderRadius: "4px",
                              color: "#3c4043",
                              fontSize: "14px",
                              fontWeight: 500,
                              boxShadow: "0 1px 2px rgba(60,64,67,0.08)",
                              transition: "background-color .2s, border-color .2s, box-shadow .2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f8f9fa";
                              e.currentTarget.style.borderColor = "#c6c9cc";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#ffffff";
                              e.currentTarget.style.borderColor = "#dadce0";
                            }}
                            disabled={loading}
                            onClick={handleAzureLogin}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 21 21"
                              className="me-2 flex-shrink-0"
                              aria-hidden="true"
                            >
                              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                            </svg>
                            <span>Microsoft</span>
                          </button>
                        </CCol>
                      </CRow>
                    </>
                  ) : (
                    /* PASO 2: Verificación del Código 2FA */
                    <>
                      <div className="text-center">
                        <div
                          className="d-inline-flex align-items-center justify-content-center rounded-circle mb-2"
                          style={{
                            width: "48px",
                            height: "48px",
                            backgroundColor: "rgba(112, 176, 56, 0.15)",
                            color: "#70B038",
                          }}
                        >
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </div>
                        <h2 className="h5 fw-bold mb-1">Verificación de Dos Factores (2FA)</h2>
                        <p className="text-body-secondary small mb-3">
                          Ingresa el código numérico de 6 dígitos enviado a <br />
                          <strong>{email}</strong>
                        </p>
                      </div>

                      <CForm className="row gy-3" onSubmit={handleVerify2FaSubmit}>
                        <CCol xs={12}>
                          <CFormLabel
                            htmlFor="code2Fa"
                            className="text-center d-block fw-semibold"
                          >
                            Código de Verificación
                          </CFormLabel>
                          <CFormInput
                            id="code2Fa"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            placeholder="••••••"
                            autoComplete="one-time-code"
                            value={code2Fa}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              setCode2Fa(val);
                            }}
                            className="text-center fs-3 tracking-wider py-2"
                            style={{ letterSpacing: "0.4em", fontWeight: "bold" }}
                            autoFocus
                            required
                            disabled={loading}
                          />
                          <div className="text-center text-body-secondary small mt-2">
                            El código es válido por 5 minutos y de un solo uso.
                          </div>
                        </CCol>

                        <CCol xs={12}>
                          <CButton
                            type="submit"
                            className="w-100 text-white fw-semibold py-2"
                            style={{ backgroundColor: "#70B038", borderColor: "#70B038" }}
                            disabled={loading || code2Fa.length !== 6}
                          >
                            {loading ? (
                              <>
                                <CSpinner size="sm" className="me-2" />
                                Verificando código...
                              </>
                            ) : (
                              "Verificar y Acceder"
                            )}
                          </CButton>
                        </CCol>

                        <CCol
                          xs={12}
                          className="d-flex justify-content-between align-items-center pt-2"
                        >
                          <CButton
                            type="button"
                            color="link"
                            className="p-0 text-decoration-none small text-body-secondary"
                            onClick={handleBackToCredentials}
                            disabled={loading}
                          >
                            ← Cambiar credenciales
                          </CButton>
                          <CButton
                            type="button"
                            color="link"
                            className="p-0 text-decoration-none small fw-semibold"
                            style={{ color: "#70B038" }}
                            onClick={handleResendCode}
                            disabled={loading}
                          >
                            Reenviar código
                          </CButton>
                        </CCol>
                      </CForm>
                    </>
                  )}
                </CCardBody>
              </CCard>

              <div className="text-center text-body-secondary">
                ¿No tienes una cuenta?{" "}
                <Link to="/authentication/register" style={{ color: "#70B038" }}>
                  Regístrate
                </Link>
              </div>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
}

