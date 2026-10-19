const { test } = require('node:test')
const assert = require('node:assert/strict')
const { canManageUser, ROLES } = require('../middleware/userPermissions')

test('admins can manage managers and employees, but not admins', () => {
    assert.equal(canManageUser([ROLES.Admin], [ROLES.Manager]), true)
    assert.equal(canManageUser([ROLES.Admin], [ROLES.Employee]), true)
    assert.equal(canManageUser([ROLES.Admin], [ROLES.Admin]), false)
})

test('managers can manage employees only', () => {
    assert.equal(canManageUser([ROLES.Manager], [ROLES.Employee]), true)
    assert.equal(canManageUser([ROLES.Manager], [ROLES.Manager]), false)
    assert.equal(canManageUser([ROLES.Manager], [ROLES.Admin]), false)
    assert.equal(canManageUser([ROLES.Manager], [ROLES.Employee, ROLES.Manager]), false)
})

test('employees cannot manage users', () => {
    assert.equal(canManageUser([ROLES.Employee], [ROLES.Employee]), false)
})
