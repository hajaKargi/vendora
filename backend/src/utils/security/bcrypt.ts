import serverSettings from "../../core/config/settings";

const bcrypt = require("bcrypt");

class Bcrypt {

    public static async hashPassword( password: string): Promise<string> {
        let salt = serverSettings.bcryptHashingSalt as string;
        
        return await bcrypt.hash(password, parseInt(salt));
    }
    
    public static async compare( value: string, hashedValue: string): Promise<boolean> {
        return await bcrypt.compare(value, hashedValue);
    }
}

export default Bcrypt;