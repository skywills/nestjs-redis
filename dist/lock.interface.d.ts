import { Settings } from "redlock";
export interface LockSettings {
    logging?: boolean;
    settings?: Partial<Settings>;
    scripts?: {
        readonly acquireScript?: string | ((script: string) => string);
        readonly extendScript?: string | ((script: string) => string);
        readonly releaseScript?: string | ((script: string) => string);
    };
}
