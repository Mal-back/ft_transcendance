"use strict";
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall web_perf_infra
 */
Object.defineProperty(exports, "__esModule", { value: true });
function generateExampleCommand(command, cliExample, options = {}) {
    if (typeof cliExample === 'string') {
        return exampleFromCliOptionString(command, cliExample);
    }
    let commandExample = '';
    if (cliExample.description != null &&
        // if it's not null, undefined, or true
        options.descriptionAsBashComment !== false) {
        const desc = cliExample.description.trim();
        if (desc.length > 0) {
            // inject the description as a bash command in the bash example
            const bashText = cliExample.description
                .trim()
                .split('\n')
                .map(line => `# ${line.trim()}`)
                .join('\n');
            commandExample += bashText + '\n';
        }
    }
    commandExample += exampleFromCliOptionString(command, cliExample.cliOptionExample);
    return commandExample;
}
function exampleFromCliOptionString(command, cliExample) {
    return `memlab ${command} ${cliExample.trim()}`;
}
exports.default = {
    generateExampleCommand,
};
