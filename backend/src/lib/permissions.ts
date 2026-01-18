import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";
 
export const statement = {
    ...defaultStatements, 
    Dashboard: ["create", "share", "update", "delete"], 
} as const;
 
export const ac = createAccessControl(statement);
 
export const admin = ac.newRole({ 
    Dashboard: ["create", "update", "delete", "share"], 
    ...adminAc.statements, 
}); 
