import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
  CTooltip,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { eye } from "../../../assets/icons/eye";
import { IAuthService } from "../../../services/interfaces/IAuthService";
import { serviceContainer } from "../../../services/serviceContainer";
import jpaSports from "../../../assets/images/JPASports.jpg";

export interface ResetPasswordProps {
  authService?: IAuthService;
}

export default function ResetPassword({
  authService = serviceContainer.authService,
}: ResetPasswordProps) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validaciones en tiempo real
  const validations = useMemo(() => {
    return {
      minLength: newPassword.length >= 8 && newPassword.length <= 72,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
      hasSpecial: /[@$!%*?&]/.test(newPassword),
      noSpaces: !/\s/.test(newPassword) && newPassword.length > 0,
      matches: newPassword.length > 0 && newPassword === confirmPassword,
    };
  }, [newPassword, confirmPassword]);

  const isValidPassword =
    validations.minLength &&
    validations.hasUpper &&
    validations.hasLower &&
    validations.hasNumber &&
    validations.hasSpecial &&
    validations.noSpaces;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("El enlace de recuperación es inválido o no incluye el token requerido.");
      return;
    }

    if (!isValidPassword) {
      setError("La contraseña no cumple con todas las reglas de seguridad requeridas.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(
        err?.message ||
          "No fue posible restablecer la contraseña. El enlace puede haber expirado o ya haber sido utilizado."
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
                  <h2 className="h5 text-center mb-0 fw-bold">Establecer nueva contraseña</h2>
                  <p className="text-body-secondary text-center small mb-2">
                    Ingresa una contraseña segura para tu cuenta.
                  </p>

                  {!token && (
                    <CAlert color="warning">
                      No se detectó un token de recuperación en el enlace. Solicita uno nuevo desde la página de recuperación.
                    </CAlert>
                  )}

                  {error && (
                    <CAlert color="danger" dismissible onClose={() => setError("")}>
                      {error}
                    </CAlert>
                  )}

                  {success ? (
                    <div className="d-flex flex-column gap-3 text-center">
                      <CAlert color="success" className="mb-0">
                        <div className="fw-semibold mb-1">¡Contraseña restablecida con éxito!</div>
                        <div>Ya puedes ingresar al sistema con tu nueva contraseña.</div>
                      </CAlert>
                      <CButton
                        className="w-100 text-white fw-semibold py-2"
                        style={{ backgroundColor: "#70B038", borderColor: "#70B038" }}
                        onClick={() => navigate("/login")}
                      >
                        Iniciar sesión ahora
                      </CButton>
                    </div>
                  ) : (
                    <CForm className="row gy-3" onSubmit={handleSubmit}>
                      <CCol xs={12}>
                        <CFormLabel htmlFor="newPassword">Nueva contraseña</CFormLabel>
                        <CInputGroup>
                          <CFormInput
                            id="newPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="Mínimo 8 caracteres"
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            disabled={loading || !token}
                          />
                          <CInputGroupText>
                            <CTooltip content={showPassword ? "Ocultar" : "Mostrar"}>
                              <CButton
                                type="button"
                                color="link"
                                className="p-0 link-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                <CIcon icon={eye} size="sm" />
                              </CButton>
                            </CTooltip>
                          </CInputGroupText>
                        </CInputGroup>
                      </CCol>

                      <CCol xs={12}>
                        <CFormLabel htmlFor="confirmPassword">Confirmar nueva contraseña</CFormLabel>
                        <CInputGroup>
                          <CFormInput
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Repite tu nueva contraseña"
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading || !token}
                          />
                          <CInputGroupText>
                            <CTooltip content={showConfirmPassword ? "Ocultar" : "Mostrar"}>
                              <CButton
                                type="button"
                                color="link"
                                className="p-0 link-secondary"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                <CIcon icon={eye} size="sm" />
                              </CButton>
                            </CTooltip>
                          </CInputGroupText>
                        </CInputGroup>
                      </CCol>

                      {/* Reglas de validación */}
                      <CCol xs={12}>
                        <div className="p-2 border rounded bg-light small">
                          <div className="fw-semibold text-body-secondary mb-1">Requisitos de seguridad:</div>
                          <ul className="list-unstyled mb-0" style={{ fontSize: "0.8rem" }}>
                            <li className={validations.minLength ? "text-success fw-semibold" : "text-body-secondary"}>
                              {validations.minLength ? "✓" : "•"} Entre 8 y 72 caracteres
                            </li>
                            <li className={validations.hasUpper ? "text-success fw-semibold" : "text-body-secondary"}>
                              {validations.hasUpper ? "✓" : "•"} Al menos una letra mayúscula (A-Z)
                            </li>
                            <li className={validations.hasLower ? "text-success fw-semibold" : "text-body-secondary"}>
                              {validations.hasLower ? "✓" : "•"} Al menos una letra minúscula (a-z)
                            </li>
                            <li className={validations.hasNumber ? "text-success fw-semibold" : "text-body-secondary"}>
                              {validations.hasNumber ? "✓" : "•"} Al menos un número (0-9)
                            </li>
                            <li className={validations.hasSpecial ? "text-success fw-semibold" : "text-body-secondary"}>
                              {validations.hasSpecial ? "✓" : "•"} Al menos un carácter especial (@$!%*?&)
                            </li>
                            {confirmPassword.length > 0 && (
                              <li className={validations.matches ? "text-success fw-semibold" : "text-danger fw-semibold"}>
                                {validations.matches ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
                              </li>
                            )}
                          </ul>
                        </div>
                      </CCol>

                      <CCol xs={12}>
                        <CButton
                          type="submit"
                          className="w-100 text-white fw-semibold py-2"
                          style={{ backgroundColor: "#70B038", borderColor: "#70B038" }}
                          disabled={loading || !token || !isValidPassword || !validations.matches}
                        >
                          {loading ? (
                            <>
                              <CSpinner size="sm" className="me-2" />
                              Guardando contraseña...
                            </>
                          ) : (
                            "Guardar nueva contraseña"
                          )}
                        </CButton>
                      </CCol>
                    </CForm>
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
