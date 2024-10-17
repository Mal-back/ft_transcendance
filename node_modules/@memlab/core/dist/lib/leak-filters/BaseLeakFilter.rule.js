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
exports.LeakObjectFilterRuleBase = exports.LeakDecision = void 0;
/**
 * Every leak object filter rule needs to give a label
 * to each object passed to the filter
 */
var LeakDecision;
(function (LeakDecision) {
    LeakDecision["LEAK"] = "leak";
    LeakDecision["MAYBE_LEAK"] = "maybe-leak";
    LeakDecision["NOT_LEAK"] = "not-leak";
})(LeakDecision = exports.LeakDecision || (exports.LeakDecision = {}));
class LeakObjectFilterRuleBase {
    beforeFiltering(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _config, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _snapshot, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _leakedNodeIds) {
        // do nothing by default
    }
}
exports.LeakObjectFilterRuleBase = LeakObjectFilterRuleBase;
