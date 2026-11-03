
// @ts-nocheck
import React, { useEffect, useState } from 'react'
import { Role } from '../../models/Role'
import { User } from '../../models/User'
import { UserRole } from '../../models/UserRole'
import { Permission } from '../../models/Permission'
import { IRoleService } from '../../services/interfaces/IRoleService'
import { IPermissionService } from '../../services/interfaces/IPermissionService'
import { serviceContainer } from '../../services/serviceContainer'
import GenericTable, { TableColumn, TableAction } from '../../components/common/GenericTable'
import GenericButton from '../../components/common/GenericButton'
import GenericModal from '../../components/common/GenericModal'
import Alert from '../../components/common/Alert'
import Loader from '../../components/common/Loader'
import RoleForm from './RoleForm'
import authService from '../../services/authService'

interface RolesProps {
  roleService: IRoleService
  permissionService: IPermissionService
}

type ManagementMode = 'detail' | 'users' | 'permissions'

export default function Roles({ roleService, permissionService }: RolesProps) {
  const userRoleService = serviceContainer.userRoleService

  // Gestión de roles
  const canCreateRole = authService.hasPermission('POST', '/api/roles')
  const canEditRole = authService.hasPermission('PUT', '/api/roles/1')
  const canDeleteRole = authService.hasPermission('DELETE', '/api/roles/1')

  // Consulta de usuarios asociados a roles
  const canViewRoleUsers = authService.hasPermission('GET', '/api/user-roles/roles/1')
  const canViewUsersCatalog = authService.hasPermission('GET', '/api/users')

  // Gestión de asignaciones usuario-rol
  const canAssignUser = authService.hasPermission('POST', '/api/user-roles')
  const canRemoveUser = authService.hasPermission('DELETE', '/api/user-roles/1/1')

  // Consulta y gestión de permisos asociados a roles
  const canViewRolePermissions = authService.hasPermission(
    'GET',
    '/api/role-permissions/roles/1',
  )
  const canViewPermissionsCatalog = authService.hasPermission('GET', '/api/permissions')

  const canAssignPermission =
    authService.hasPermission('POST', '/api/role-permissions') &&
    canViewPermissionsCatalog

  const canRemovePermission = authService.hasPermission(
    'DELETE',
    '/api/role-permissions/1/1',
  )

  const canViewRoleDetail = canViewRoleUsers || canViewRolePermissions

  // Para asignar usuarios se necesita consultar el catálogo y las asignaciones actuales.
  const canShowUserAssignment =
    canAssignUser && canViewUsersCatalog && canViewRoleUsers

  const [roles, setRoles] = useState<Role[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const [managementMode, setManagementMode] = useState<ManagementMode | null>(null)
  const [managementRole, setManagementRole] = useState<Role | null>(null)
  const [managementLoading, setManagementLoading] = useState<boolean>(false)
  const [managementSubmitting, setManagementSubmitting] = useState<boolean>(false)

  const [managementError, setManagementError] = useState<string | null>(null)
  const [managementSuccess, setManagementSuccess] = useState<string | null>(null)

  const [detailUsersCount, setDetailUsersCount] = useState<number | null>(null)
  const [detailPermissionsCount, setDetailPermissionsCount] = useState<number | null>(null)

  const [allUsers, setAllUsers] = useState<User[]>([])
  const [roleAssignments, setRoleAssignments] = useState<UserRole[]>([])
  const [selectedUserIdForRole, setSelectedUserIdForRole] = useState<string>('')

  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [assignedPermissions, setAssignedPermissions] = useState<Permission[]>([])
  const [selectedPermissionId, setSelectedPermissionId] = useState<string>('')

  const fetchRoles = async () => {
    setIsLoading(true)
    setError(null)

    const result = await roleService.getAll()

    if (result === null) {
      setError('No fue posible obtener la lista de roles.')
      setRoles(null)
    } else {
      setRoles(result)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchRoles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadManagementData = async (
    mode: ManagementMode,
    role: Role,
    isCancelled: () => boolean = () => false,
  ) => {
    setManagementLoading(true)
    setManagementError(null)

    if (mode === 'detail') {
      const [assignments, permissions] = await Promise.all([
        canViewRoleUsers ? userRoleService.getByRole(role.id) : Promise.resolve(null),
        canViewRolePermissions
          ? permissionService.getByRole(role.id)
          : Promise.resolve(null),
      ])

      if (isCancelled()) return

      setDetailUsersCount(
        canViewRoleUsers && assignments !== null ? assignments.length : null,
      )

      setDetailPermissionsCount(
        canViewRolePermissions && permissions !== null ? permissions.length : null,
      )

      if (
        (canViewRoleUsers && assignments === null) ||
        (canViewRolePermissions && permissions === null)
      ) {
        setManagementError('No fue posible cargar completamente el detalle del rol.')
      }
    } else if (mode === 'users') {
      const [usersCatalog, assignments] = await Promise.all([
        canViewUsersCatalog
          ? userRoleService.getAllUsers()
          : Promise.resolve(null),
        canViewRoleUsers
          ? userRoleService.getByRole(role.id)
          : Promise.resolve(null),
      ])

      if (isCancelled()) return

      setAllUsers(usersCatalog ?? [])
      setRoleAssignments(assignments ?? [])

      if (canShowUserAssignment) {
        setSelectedUserIdForRole('')
      }

      if (
        (canViewUsersCatalog && usersCatalog === null) ||
        (canViewRoleUsers && assignments === null)
      ) {
        setManagementError(
          'No fue posible cargar los usuarios o sus asignaciones.',
        )
      } else if (!canViewUsersCatalog && !canViewRoleUsers) {
        setManagementError(
          'No tienes permisos de consulta para gestionar los usuarios de este rol.',
        )
      }
    } else if (mode === 'permissions') {
      const [permissionsCatalog, permissions] = await Promise.all([
        canAssignPermission
          ? permissionService.getAll()
          : Promise.resolve([]),
        canViewRolePermissions
          ? permissionService.getByRole(role.id)
          : Promise.resolve(null),
      ])

      if (isCancelled()) return

      if (
        permissions === null ||
        (canAssignPermission && permissionsCatalog === null)
      ) {
        setAllPermissions([])
        setAssignedPermissions([])
        setManagementError('No fue posible cargar la información de permisos del rol.')
      } else {
        setAllPermissions(permissionsCatalog ?? [])
        setAssignedPermissions(permissions ?? [])
        setSelectedPermissionId('')
      }
    }

    setManagementLoading(false)
  }

  useEffect(() => {
    if (!managementMode || !managementRole) {
      return
    }

    let cancelled = false

    loadManagementData(managementMode, managementRole, () => cancelled)

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managementMode, managementRole, userRoleService, permissionService])

  const openCreateModal = () => {
    if (!canCreateRole) return

    setSelectedRole(null)
    setModalVisible(true)
    setError(null)
    setSuccess(null)
  }

  const openEditModal = (role: Role) => {
    if (!canEditRole) return

    setSelectedRole(new Role(role))
    setModalVisible(true)
    setError(null)
    setSuccess(null)
  }

  const openManagement = (role: Role, mode: ManagementMode) => {
    if (mode === 'detail' && !canViewRoleDetail) return
    if (mode === 'permissions' && !canViewRolePermissions) return

    if (
      mode === 'users' &&
      !canViewRoleUsers &&
      !canViewUsersCatalog &&
      !canAssignUser &&
      !canRemoveUser
    ) {
      return
    }

    setManagementRole(new Role(role))
    setManagementMode(mode)
    setManagementError(null)
    setManagementSuccess(null)
    setSelectedUserIdForRole('')
    setSelectedPermissionId('')
  }

  const closeManagement = () => {
    if (managementSubmitting) return

    setManagementMode(null)
    setManagementRole(null)
    setManagementError(null)
    setManagementSuccess(null)
  }

  const closeModal = () => {
    if (isSaving) return

    setModalVisible(false)
    setSelectedRole(null)
  }

  const handleSubmit = async (roleToSave: Role) => {
    const isEditing = Boolean(roleToSave.id && roleToSave.id > 0)

    if (isEditing && !canEditRole) return
    if (!isEditing && !canCreateRole) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    if (isEditing) {
      const updated = await roleService.update(roleToSave.id, roleToSave)

      if (updated === null) {
        setError('No fue posible actualizar el rol.')
      } else {
        setSuccess('Rol actualizado correctamente.')
        setModalVisible(false)
        setSelectedRole(null)
        await fetchRoles()
      }
    } else {
      const created = await roleService.create(roleToSave)

      if (created === null) {
        setError('No fue posible crear el rol. Verifica que el nombre no esté duplicado.')
      } else {
        setSuccess('Rol creado correctamente.')
        setModalVisible(false)
        setSelectedRole(null)
        await fetchRoles()
      }
    }

    setIsSaving(false)
  }

  const handleDelete = async (role: Role) => {
    if (!canDeleteRole) return

    setError(null)
    setSuccess(null)

    if (canViewRoleUsers) {
      const assignments = await userRoleService.getByRole(role.id)

      if (assignments === null) {
        setError('No fue posible validar si el rol tiene usuarios asignados. Intenta nuevamente.')
        return
      }

      if (assignments.length > 0) {
        setError(
          `No se puede eliminar el rol "${role.name}" porque está asignado a ${assignments.length} usuario(s). Retira primero esas asignaciones.`,
        )
        return
      }
    }

    const confirmed = window.confirm(
      `¿Eliminar el rol "${role.name}"? Esta acción no se puede deshacer. Los usuarios y permisos de la plataforma no serán eliminados.`,
    )

    if (!confirmed) return

    const deleted = await roleService.remove(role.id)

    if (deleted === true) {
      setSuccess('Rol eliminado correctamente.')
      await fetchRoles()
    } else {
      setError('No fue posible eliminar el rol. Verifica que no tenga usuarios asignados.')
    }
  }

  const handleAssignUserToRole = async () => {
    if (
      !canShowUserAssignment ||
      !managementRole ||
      !selectedUserIdForRole
    ) {
      return
    }

    setManagementSubmitting(true)
    setManagementError(null)
    setManagementSuccess(null)

    const assigned = await userRoleService.assignRole(
      Number(selectedUserIdForRole),
      managementRole.id,
    )

    if (assigned === null) {
      setManagementError(
        'No fue posible asignar el usuario al rol. Verifica los permisos y la respuesta del servidor.',
      )
      setManagementSubmitting(false)
      return
    }

    await loadManagementData('users', managementRole)

    setManagementSuccess('Usuario asignado al rol correctamente.')
    setManagementSubmitting(false)
  }

  const handleRemoveUserFromRole = async (assignment: UserRole) => {
    if (!canRemoveUser || !managementRole) return

    const userId = assignment.user?.id ?? assignment.userId

    if (!userId) return

    const confirmed = window.confirm(
      `¿Retirar el rol "${managementRole.name}" del usuario "${assignment.user?.name ?? `#${userId}`}"? El usuario y el rol permanecerán en el sistema.`,
    )

    if (!confirmed) return

    setManagementSubmitting(true)
    setManagementError(null)
    setManagementSuccess(null)

    const removed = await userRoleService.removeRole(userId, managementRole.id)

    if (removed !== true) {
      setManagementError(
        'No fue posible retirar el usuario del rol. Verifica los permisos del servidor.',
      )
      setManagementSubmitting(false)
      return
    }

    await loadManagementData('users', managementRole)

    setManagementSuccess(
      'Usuario retirado del rol (el usuario y el rol permanecen en el sistema).',
    )

    setManagementSubmitting(false)
  }

  const handleAssignPermissionToRole = async () => {
    if (!canAssignPermission || !managementRole || !selectedPermissionId) {
      return
    }

    setManagementSubmitting(true)
    setManagementError(null)
    setManagementSuccess(null)

    const result = await permissionService.saveRolePermissions(
      managementRole.id,
      [Number(selectedPermissionId)],
      [],
    )

    if (!result || result.failedAddIds.length > 0) {
      setManagementError('No fue posible asignar el permiso al rol.')
    } else {
      await loadManagementData('permissions', managementRole)
      setManagementSuccess('Permiso asignado al rol correctamente.')
    }

    setManagementSubmitting(false)
  }

  const handleRemovePermissionFromRole = async (permission: Permission) => {
    if (!canRemovePermission || !managementRole) return

    const confirmed = window.confirm(
      `¿Retirar el permiso "${permission.method} ${permission.url}" del rol "${managementRole.name}"? El permiso permanecerá en la plataforma.`,
    )

    if (!confirmed) return

    setManagementSubmitting(true)
    setManagementError(null)
    setManagementSuccess(null)

    const result = await permissionService.saveRolePermissions(
      managementRole.id,
      [],
      [permission.id],
    )

    if (!result || result.failedRemoveIds.length > 0) {
      setManagementError('No fue posible retirar el permiso del rol.')
    } else {
      await loadManagementData('permissions', managementRole)
      setManagementSuccess('Permiso retirado del rol (el permiso permanece en el sistema).')
    }

    setManagementSubmitting(false)
  }

  const columns: TableColumn<Role>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'name' },
    { header: 'Descripción', accessor: 'description' },
  ]

  const actions: TableAction<Role>[] = [
    ...(canViewRoleDetail
      ? [
          {
            label: 'Detalle',
            variant: 'info',
            onClick: (role: Role) => openManagement(role, 'detail'),
          } as TableAction<Role>,
        ]
      : []),

    ...(canEditRole
      ? [
          {
            label: 'Editar',
            variant: 'warning',
            onClick: (role: Role) => openEditModal(role),
          } as TableAction<Role>,
        ]
      : []),

    ...(canViewRoleUsers ||
    canViewUsersCatalog ||
    canAssignUser ||
    canRemoveUser
      ? [
          {
            label: 'Usuarios',
            variant: 'primary',
            onClick: (role: Role) => openManagement(role, 'users'),
          } as TableAction<Role>,
        ]
      : []),

    ...(canViewRolePermissions
      ? [
          {
            label: 'Permisos',
            variant: 'success',
            onClick: (role: Role) => openManagement(role, 'permissions'),
          } as TableAction<Role>,
        ]
      : []),

    ...(canDeleteRole
      ? [
          {
            label: 'Eliminar',
            variant: 'danger',
            onClick: (role: Role) => handleDelete(role),
          } as TableAction<Role>,
        ]
      : []),
  ]

  const assignedUserIds = new Set(
    roleAssignments
      .map((assignment) => assignment.user?.id ?? assignment.userId)
      .filter((userId): userId is number => typeof userId === 'number'),
  )

  const availableUsers = allUsers.filter((user) => !assignedUserIds.has(user.id))

  const assignedPermissionIds = new Set(
    assignedPermissions.map((permission) => permission.id),
  )

  const availablePermissions = allPermissions.filter(
    (permission) => !assignedPermissionIds.has(permission.id),
  )

  const managementTitle =
    managementMode === 'detail'
      ? `Detalle del Rol — ${managementRole?.name ?? ''}`
      : managementMode === 'users'
        ? `Gestionar Usuarios — ${managementRole?.name ?? ''}`
        : `Gestionar Permisos — ${managementRole?.name ?? ''}`

  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-1 fw-bold text-primary-emphasis">Gestión de Roles</h2>

          <div className="text-body-secondary small">
            Define los niveles de acceso y administra los usuarios y permisos de cada rol.
          </div>
        </div>

        {canCreateRole && (
          <GenericButton label="Nuevo Rol" variant="success" onClick={openCreateModal} />
        )}
      </div>

      {error ? <Alert type="danger" message={error} onClose={() => setError(null)} /> : null}

      {success ? <Alert type="success" message={success} onClose={() => setSuccess(null)} /> : null}

      <div className="card shadow-sm">
        <div className="card-header bg-primary-subtle text-primary-emphasis d-flex justify-content-between align-items-center">
          <span className="fw-semibold">Roles registrados</span>

          <span className="badge text-bg-primary">{roles?.length ?? 0}</span>
        </div>

        <div className="card-body p-0">
          {isLoading ? (
            <div className="p-3">
              <Loader text="Cargando roles..." />
            </div>
          ) : (
            <GenericTable<Role>
              data={roles}
              columns={columns}
              actions={actions.length > 0 ? actions : undefined}
              getKey={(role) => role.id}
              isLoading={false}
              emptyMessage="No hay roles registrados"
              errorMessage="No fue posible obtener la lista de roles."
            />
          )}
        </div>
      </div>

      <GenericModal
        visible={modalVisible}
        title={selectedRole ? 'Editar Rol' : 'Crear Rol'}
        onClose={closeModal}
        size="lg"
      >
        <RoleForm
          initialRole={selectedRole}
          existingRoles={roles ?? []}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isSaving={isSaving}
        />
      </GenericModal>

      <GenericModal
        visible={Boolean(managementMode && managementRole)}
        title={managementTitle}
        onClose={closeManagement}
        size="lg"
        backdrop={managementMode === 'detail' ? undefined : 'static'}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            {managementMode !== 'detail' && managementRole ? (
              <GenericButton
                label="Volver al detalle"
                variant="secondary"
                onClick={() => openManagement(managementRole, 'detail')}
                disabled={managementSubmitting || !canViewRoleDetail}
              />
            ) : null}

            {managementMode === 'detail' && managementRole ? (
              <>
                {canViewRoleUsers && (
                  <GenericButton
                    label="Gestionar usuarios"
                    variant="primary"
                    onClick={() => openManagement(managementRole, 'users')}
                  />
                )}

                {canViewRolePermissions && (
                  <GenericButton
                    label="Gestionar permisos"
                    variant="success"
                    onClick={() => openManagement(managementRole, 'permissions')}
                  />
                )}
              </>
            ) : null}

            <GenericButton
              label="Cerrar"
              variant="secondary"
              onClick={closeManagement}
              disabled={managementSubmitting}
            />
          </div>
        }
      >
        {managementError ? (
          <Alert type="danger" message={managementError} onClose={() => setManagementError(null)} />
        ) : null}

        {managementSuccess ? (
          <Alert
            type="success"
            message={managementSuccess}
            onClose={() => setManagementSuccess(null)}
          />
        ) : null}

        {managementLoading ? (
          <Loader text="Cargando información del rol..." />
        ) : managementMode === 'detail' && managementRole ? (
          <>
            <dl className="row mb-3">
              <dt className="col-sm-4 text-body-secondary small">ID</dt>
              <dd className="col-sm-8 fw-semibold small">#{managementRole.id}</dd>

              <dt className="col-sm-4 text-body-secondary small">Nombre</dt>
              <dd className="col-sm-8 fw-semibold small">{managementRole.name}</dd>

              <dt className="col-sm-4 text-body-secondary small">Descripción</dt>
              <dd className="col-sm-8 fw-semibold small">{managementRole.description}</dd>

              <dt className="col-sm-4 text-body-secondary small">Usuarios asignados</dt>
              <dd className="col-sm-8">
                <span className="badge bg-info">{detailUsersCount ?? 'Sin acceso'}</span>
              </dd>

              <dt className="col-sm-4 text-body-secondary small">Permisos asignados</dt>
              <dd className="col-sm-8">
                <span className="badge bg-primary">
                  {detailPermissionsCount ?? 'Sin acceso'}
                </span>
              </dd>
            </dl>

            <Alert
              type="info"
              message="Desde este detalle puedes consultar y gestionar los usuarios y permisos asociados al rol, según tus autorizaciones."
            />
          </>
        ) : managementMode === 'users' && managementRole ? (
          <>
            {canShowUserAssignment && (
              <div className="mb-4">
                <label htmlFor="role-user-select" className="form-label fw-semibold small">
                  Asignar nuevo usuario al rol
                </label>

                <div className="row g-2">
                  <div className="col-sm-8">
                    <select
                      id="role-user-select"
                      className="form-select"
                      value={selectedUserIdForRole}
                      onChange={(event) => setSelectedUserIdForRole(event.target.value)}
                      disabled={
                        managementSubmitting ||
                        managementLoading ||
                        availableUsers.length === 0
                      }
                    >
                      <option value="">
                        {availableUsers.length === 0
                          ? 'No hay más usuarios disponibles para asignar'
                          : 'Selecciona un usuario...'}
                      </option>

                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} — {user.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-sm-4">
                    <GenericButton
                      label="Asignar usuario"
                      variant="primary"
                      className="w-100"
                      onClick={handleAssignUserToRole}
                      disabled={
                        !selectedUserIdForRole ||
                        managementSubmitting ||
                        managementLoading
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {canViewRoleUsers && (
              <div>
                <div className="fw-semibold small mb-2">
                  Usuarios asignados al rol ({roleAssignments.length})
                </div>

                {roleAssignments.length === 0 ? (
                  <div className="text-body-secondary small fst-italic py-3 text-center border rounded">
                    Este rol no tiene usuarios asignados actualmente.
                  </div>
                ) : (
                  <ul className="list-group">
                    {roleAssignments.map((assignment) => {
                      const user = assignment.user
                      const isActive = user?.active !== false

                      return (
                        <li
                          key={assignment.id || user?.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <span className="fw-semibold small me-2">{user?.name}</span>
                            <span className="small text-body-secondary me-2">
                              {user?.email}
                            </span>
                            <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>

                          {canRemoveUser && (
                            <GenericButton
                              label="Retirar"
                              variant="outline-danger"
                              onClick={() => handleRemoveUserFromRole(assignment)}
                              disabled={managementSubmitting}
                            />
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )}

            {!canViewRoleUsers && !canShowUserAssignment && (
              <Alert
                type="info"
                message="No tienes permisos suficientes para consultar o gestionar las asignaciones de usuarios de este rol."
              />
            )}

            <Alert
              type="info"
              message="Un usuario puede tener uno o varios roles y un rol puede estar asociado a varios usuarios. Retirar la asignación no elimina al usuario ni el rol."
            />
          </>
        ) : managementMode === 'permissions' && managementRole ? (
          <>
            {canAssignPermission && (
              <div className="mb-4">
                <label htmlFor="role-permission-select" className="form-label fw-semibold small">
                  Asignar nuevo permiso al rol
                </label>

                <div className="row g-2">
                  <div className="col-sm-8">
                    <select
                      id="role-permission-select"
                      className="form-select"
                      value={selectedPermissionId}
                      onChange={(event) => setSelectedPermissionId(event.target.value)}
                      disabled={
                        managementSubmitting || availablePermissions.length === 0
                      }
                    >
                      <option value="">
                        {availablePermissions.length === 0
                          ? 'No hay más permisos disponibles para asignar'
                          : 'Selecciona un permiso...'}
                      </option>

                      {availablePermissions.map((permission) => (
                        <option key={permission.id} value={permission.id}>
                          {permission.method} — {permission.url}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-sm-4">
                    <GenericButton
                      label="Asignar permiso"
                      variant="primary"
                      className="w-100"
                      onClick={handleAssignPermissionToRole}
                      disabled={!selectedPermissionId || managementSubmitting}
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="fw-semibold small mb-2">
                Permisos asignados al rol ({assignedPermissions.length})
              </div>

              {assignedPermissions.length === 0 ? (
                <div className="text-body-secondary small fst-italic py-3 text-center border rounded">
                  Este rol no tiene permisos asignados actualmente.
                </div>
              ) : (
                <ul className="list-group">
                  {assignedPermissions.map((permission) => (
                    <li
                      key={permission.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <span className="badge bg-info me-2">{permission.method}</span>
                        <span className="small">{permission.url}</span>
                      </div>

                      {canRemovePermission && (
                        <GenericButton
                          label="Retirar"
                          variant="outline-danger"
                          onClick={() => handleRemovePermissionFromRole(permission)}
                          disabled={managementSubmitting}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Alert
              type="info"
              message="Retirar un permiso del rol no elimina el permiso de la plataforma ni afecta a otros roles."
            />
          </>
        ) : null}
      </GenericModal>
    </div>
  )
}
