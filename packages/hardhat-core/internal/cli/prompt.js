"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmProjectCreation = exports.confirmTelemetryConsent = exports.confirmRecommendedDepsInstallation = exports.confirmHHVSCodeInstallation = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const project_creation_1 = require("./project-creation");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const TELEMETRY_CONSENT_TIMEOUT = 10000;
function createConfirmationPrompt(name, message) {
    return {
        type: "confirm",
        name,
        message,
        initial: "y",
        default: "(Y/n)",
        isTrue(input) {
            if (typeof input === "string") {
                return input.toLowerCase() === "y";
            }
            return input;
        },
        isFalse(input) {
            if (typeof input === "string") {
                return input.toLowerCase() === "n";
            }
            return input;
        },
        format() {
            const that = this;
            const value = that.value === true ? "y" : "n";
            if (that.state.submitted === true) {
                return that.styles.submitted(value);
            }
            return value;
        },
    };
}
/**
 * true = install ext
 * false = don't install and don't ask again
 * undefined = don't install but maybe ask next time if something changes (i.e. they install VS Code)
 */
async function confirmHHVSCodeInstallation() {
    const enquirer = require("enquirer");
    try {
        const { stdout } = await execAsync("code --list-extensions");
        const extName = new RegExp("NomicFoundation.hardhat-solidity");
        const hasExtension = extName.test(stdout);
        if (!hasExtension) {
            const prompt = new enquirer.prompts.Confirm({
                name: "shouldInstallExtension",
                type: "confirm",
                initial: true,
                message: "Would you like to install the Hardhat for Visual Studio Code extension? It adds advanced editing assistance for Solidity to VSCode",
            });
            let timeout;
            const timeoutPromise = new Promise((resolve) => {
                timeout = setTimeout(resolve, TELEMETRY_CONSENT_TIMEOUT);
            });
            const result = await Promise.race([prompt.run(), timeoutPromise]);
            clearTimeout(timeout);
            if (result === undefined) {
                await prompt.cancel();
            }
            return result;
        }
        else {
            // extension already installed
            return false;
        }
    }
    catch (e) {
        // vscode not installed
        if (/code: not found/.test(e === null || e === void 0 ? void 0 : e.stderr)) {
            return undefined;
        }
        if (e === "") {
            return false;
        }
        // eslint-disable-next-line @nomiclabs/hardhat-internal-rules/only-hardhat-error
        throw e;
    }
}
exports.confirmHHVSCodeInstallation = confirmHHVSCodeInstallation;
async function confirmRecommendedDepsInstallation(depsToInstall) {
    const { default: enquirer } = await Promise.resolve().then(() => __importStar(require("enquirer")));
    let responses;
    const packageManager = (await (0, project_creation_1.isYarnProject)()) ? "yarn" : "npm";
    try {
        responses = await enquirer.prompt([
            createConfirmationPrompt("shouldInstallPlugin", `Do you want to install this sample project's dependencies with ${packageManager} (${Object.keys(depsToInstall).join(" ")})?`),
        ]);
    }
    catch (e) {
        if (e === "") {
            return false;
        }
        // eslint-disable-next-line @nomiclabs/hardhat-internal-rules/only-hardhat-error
        throw e;
    }
    return responses.shouldInstallPlugin;
}
exports.confirmRecommendedDepsInstallation = confirmRecommendedDepsInstallation;
async function confirmTelemetryConsent() {
    const enquirer = require("enquirer");
    const prompt = new enquirer.prompts.Confirm({
        name: "telemetryConsent",
        type: "confirm",
        initial: true,
        message: "Help us improve Hardhat with anonymous crash reports & basic usage data?",
    });
    let timeout;
    const timeoutPromise = new Promise((resolve) => {
        timeout = setTimeout(resolve, TELEMETRY_CONSENT_TIMEOUT);
    });
    const result = await Promise.race([prompt.run(), timeoutPromise]);
    clearTimeout(timeout);
    if (result === undefined) {
        await prompt.cancel();
    }
    return result;
}
exports.confirmTelemetryConsent = confirmTelemetryConsent;
async function confirmProjectCreation() {
    const enquirer = require("enquirer");
    return enquirer.prompt([
        {
            name: "projectRoot",
            type: "input",
            initial: process.cwd(),
            message: "Hardhat project root:",
        },
        createConfirmationPrompt("shouldAddGitIgnore", "Do you want to add a .gitignore?"),
    ]);
}
exports.confirmProjectCreation = confirmProjectCreation;
//# sourceMappingURL=prompt.js.map