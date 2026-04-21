import bcrypt from "bcrypt";

export default async function comparePasswords(password: string, hashPassword: string | undefined): Promise<boolean> {
    if (!hashPassword) {
        return false;
    }
    return await bcrypt.compare(password, hashPassword);
}