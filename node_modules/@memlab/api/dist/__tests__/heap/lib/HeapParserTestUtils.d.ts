/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall web_perf_infra
 */
import type { IHeapSnapshot } from '@memlab/core';
export declare function isExpectedSnapshot(leakInjector: () => void, checkSnapshotCb: (snapshot: IHeapSnapshot) => boolean): Promise<void>;
//# sourceMappingURL=HeapParserTestUtils.d.ts.map