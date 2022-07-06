import { Dependencies } from "../../types/cli";
/**
 * true = install ext
 * false = don't install and don't ask again
 * undefined = don't install but maybe ask next time if something changes (i.e. they install VS Code)
 */
export declare function confirmHHVSCodeInstallation(): Promise<boolean | undefined>;
export declare function confirmRecommendedDepsInstallation(depsToInstall: Dependencies): Promise<boolean>;
export declare function confirmTelemetryConsent(): Promise<boolean | undefined>;
export declare function confirmProjectCreation(): Promise<{
    projectRoot: string;
    shouldAddGitIgnore: boolean;
}>;
//# sourceMappingURL=prompt.d.ts.map