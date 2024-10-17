/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall web_perf_infra
 */
import type { MemLabConfig, PuppeteerConfig } from '@memlab/core';
import type { RunOptions } from '../API';
/**
 * Manage, save, and restore the current state of the PuppeteerConfig.
 */
declare class PuppeteerStateManager {
    getAndUpdateState(config: MemLabConfig, options?: RunOptions): PuppeteerConfig;
    restoreState(config: MemLabConfig, puppeteerConfig: PuppeteerConfig): void;
}
declare const _default: PuppeteerStateManager;
export default _default;
//# sourceMappingURL=PuppeteerConfigManager.d.ts.map