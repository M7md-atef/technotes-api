const ROLES = {
    Employee: 'Employee',
    Manager: 'Manager',
    Admin: 'Admin'
}

const canManageUser = (actorRoles, targetRoles) => {
    if (!Array.isArray(actorRoles) || !Array.isArray(targetRoles) || targetRoles.includes(ROLES.Admin)) {
        return false
    }

    if (actorRoles.includes(ROLES.Admin)) {
        return targetRoles.some(role => role === ROLES.Manager || role === ROLES.Employee)
    }

    return actorRoles.includes(ROLES.Manager)
        && targetRoles.includes(ROLES.Employee)
        && !targetRoles.includes(ROLES.Manager)
}

module.exports = { ROLES, canManageUser }
